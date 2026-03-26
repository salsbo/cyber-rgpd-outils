"""
Éligibilité API — Dahouse
Proxy pour données ARCEP (fichiers open data) + ANFR (API v1)

- GET /health
- POST /eligibilite {lat, lon, postcode, dept}
  → FTTH eligibility + mobile coverage + nearby antennas

Données ARCEP : fichiers CSV départementaux téléchargés et cachés en mémoire
Données ANFR : API v1 publique (pas de clé nécessaire)
"""

import asyncio
import csv
import gzip
import io
import time
from dataclasses import dataclass
from math import radians, sin, cos, sqrt, atan2

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

API_PORT = 8047

app = FastAPI(title="Éligibilité API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dahouse.fr",
        "https://www.dahouse.fr",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# --- ARCEP data cache ---
# Key: department code, Value: (timestamp, list of records)
arcep_cache: dict[str, tuple[float, list[dict]]] = {}
CACHE_TTL = 86400  # 24h

ARCEP_ELIG_URL = "https://data.arcep.fr/fixe/maconnexioninternet/eligibilite/last/departement/actuel_{dept}.csv.gz"
ARCEP_IMB_URL = "https://data.arcep.fr/fixe/maconnexioninternet/base_imb/last/departement/base_imb_{dept}.csv.gz"

TECH_LABELS = {
    "FO": "Fibre optique (FTTH)",
    "CU": "Cuivre (ADSL/VDSL)",
    "CA": "Câble (coax)",
    "TH": "THD Radio",
    "SA": "Satellite",
}

# --- Models ---
class EligRequest(BaseModel):
    lat: float
    lon: float
    postcode: str
    citycode: str = ""
    addr_code: str = ""  # BAN address code (e.g. "92064_0123_00012")


# --- Haversine ---
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))


# --- ARCEP data loading ---
async def load_arcep_imb(dept: str) -> list[dict]:
    """Load building data for a department (cached)."""
    cache_key = f"imb_{dept}"
    if cache_key in arcep_cache:
        ts, data = arcep_cache[cache_key]
        if time.time() - ts < CACHE_TTL:
            return data

    url = ARCEP_IMB_URL.format(dept=dept)
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
            raw = gzip.decompress(resp.content)
            reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")), delimiter=";")
            records = []
            for row in reader:
                try:
                    # Lambert-93 → approximate WGS84 (simplified)
                    # Actually the CSV has coords in Lambert-93, we need lat/lon
                    # Use imb_x, imb_y (Lambert-93) for distance calc
                    records.append(row)
                except Exception:
                    continue
            arcep_cache[cache_key] = (time.time(), records)
            return records
    except Exception as e:
        print(f"Error loading ARCEP IMB {dept}: {e}")
        return []


async def load_arcep_elig(dept: str) -> list[dict]:
    """Load eligibility data for a department (cached)."""
    cache_key = f"elig_{dept}"
    if cache_key in arcep_cache:
        ts, data = arcep_cache[cache_key]
        if time.time() - ts < CACHE_TTL:
            return data

    url = ARCEP_ELIG_URL.format(dept=dept)
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
            raw = gzip.decompress(resp.content)
            reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")), delimiter=";")
            records = list(reader)
            arcep_cache[cache_key] = (time.time(), records)
            return records
    except Exception as e:
        print(f"Error loading ARCEP elig {dept}: {e}")
        return []


async def load_arcep_operators() -> dict[str, str]:
    """Load operator reference table."""
    if "operators" in arcep_cache:
        ts, data = arcep_cache["operators"]
        if time.time() - ts < CACHE_TTL:
            return {d["code"]: d["nom"] for d in data}

    url = "https://data.arcep.fr/fixe/maconnexioninternet/reference/last/operateur/operateur.csv"
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return {}
            reader = csv.DictReader(io.StringIO(resp.text), delimiter=";")
            records = list(reader)
            arcep_cache["operators"] = (time.time(), records)
            return {r.get("code", ""): r.get("nom", "") for r in records}
    except Exception:
        return {}


# --- Find building by BAN address code ---
async def find_building(dept: str, addr_code: str, citycode: str) -> dict | None:
    """Find building by BAN address code or commune."""
    buildings = await load_arcep_imb(dept)
    if not buildings:
        return None

    # Best match: exact addr_code from BAN geocoding
    if addr_code and "_" in addr_code:
        # Exact match
        for b in buildings:
            if b.get("addr_code") == addr_code:
                return b

        # Partial match on street code (first 2 parts: "92064_0123")
        base = "_".join(addr_code.split("_")[:2])
        candidates = [b for b in buildings if b.get("addr_code", "").startswith(base)]
        if candidates:
            return candidates[0]

    # Fallback: search by commune code (from citycode or addr_code without underscore)
    commune = citycode or addr_code
    if commune:
        commune_buildings = [b for b in buildings
                            if b.get("imb_code_insee") == commune
                            or b.get("addr_code_insee") == commune]
        if commune_buildings:
            # Return the first one that has fibre (imb_source == "fo")
            for b in commune_buildings:
                if b.get("imb_source") == "fo":
                    return b
            return commune_buildings[0]

    return None


# --- ANFR antennas ---
def parse_height(h: str) -> float:
    """Parse height string like '25,5' or '25.5' to float."""
    try:
        return float(str(h).replace(",", "."))
    except (ValueError, TypeError):
        return 0.0


def parse_coords(coords) -> tuple[float, float] | None:
    """Parse ANFR coordinates field."""
    if isinstance(coords, dict):
        return coords.get("lat", 0), coords.get("lon", 0)
    if isinstance(coords, (list, tuple)) and len(coords) == 2:
        return float(coords[0]), float(coords[1])
    parts = str(coords).split(",")
    if len(parts) == 2:
        try:
            return float(parts[0].strip()), float(parts[1].strip())
        except ValueError:
            return None
    return None


async def find_antennas(lat: float, lon: float, postcode: str) -> list[dict]:
    """Find nearby 4G/5G antennas via ANFR API v1.

    - Geographic search via geofilter.distance (not postal code)
    - No height filter (all antennas)
    - Group by operator: combine 4G+5G on same site
    - Search radius: 5km
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Geographic search within 5km radius
            # Note: use raw URL because httpx encodes the dot in geofilter.distance
            url = f"https://data.anfr.fr/d4c/api/records/1.0/search/?dataset=observatoire_2g_3g_4g&geofilter.distance={lat},{lon},5000&rows=3000"
            resp = await client.get(url)
            if resp.status_code != 200:
                return []

            data = resp.json()

            # Parse all valid antennas
            raw_antennas: list[dict] = []
            for r in data.get("records", []):
                f = r.get("fields", {})
                gen = f.get("generation", "")
                if gen not in ("4G", "5G"):
                    continue

                status = f.get("statut", "")
                if "service" not in status.lower() and "opérationnel" not in status.lower():
                    continue

                height = parse_height(f.get("sup_nm_haut", "0"))

                coords = parse_coords(f.get("coordonnees"))
                if not coords:
                    continue

                a_lat, a_lon = coords
                dist = haversine(lat, lon, a_lat, a_lon)

                raw_antennas.append({
                    "operator": f.get("adm_lb_nom", "Inconnu"),
                    "generation": gen,
                    "technology": f.get("emr_lb_systeme", gen),
                    "lat": a_lat,
                    "lon": a_lon,
                    "distance": round(dist),
                    "address": " ".join(filter(None, [
                        f.get("adr_lb_add1"),
                        f.get("adr_lb_lieu"),
                        f.get("adr_nm_cp"),
                    ])),
                    "height": str(height),
                    "status": status,
                    "site_id": f.get("sta_nm_anfr", ""),
                })

            # Group by operator: find closest site per operator, merge generations
            raw_antennas.sort(key=lambda x: x["distance"])

            # Group by operator+location (same site = same coords rounded to ~50m)
            sites: dict[str, dict] = {}  # key: "operator-lat-lon" -> merged entry
            for ant in raw_antennas:
                # Round coords to group antennas on same site
                site_key = f"{ant['operator']}-{round(ant['lat'], 3)}-{round(ant['lon'], 3)}"

                if site_key not in sites:
                    sites[site_key] = {
                        **ant,
                        "generations": [ant["generation"]],
                        "technologies": [ant["technology"]],
                    }
                else:
                    existing = sites[site_key]
                    if ant["generation"] not in existing["generations"]:
                        existing["generations"].append(ant["generation"])
                    if ant["technology"] not in existing["technologies"]:
                        existing["technologies"].append(ant["technology"])

            # Keep up to 3 closest sites per operator
            op_count: dict[str, int] = {}
            results: list[dict] = []
            for site in sorted(sites.values(), key=lambda x: x["distance"]):
                op = site["operator"]
                count = op_count.get(op, 0)
                if count >= 3:
                    continue
                op_count[op] = count + 1
                # Clean up: merge generations into single field
                gens = sorted(set(site["generations"]))
                site["generation"] = "+".join(gens)  # "4G+5G"
                site["technology"] = ", ".join(site["technologies"][:3])
                del site["generations"]
                del site["technologies"]
                results.append(site)

            return results[:16]

    except Exception as e:
        print(f"ANFR error: {e}")
        return []


# --- Endpoints ---
@app.get("/health")
async def health():
    return {"status": "ok", "cached_departments": len(arcep_cache)}


@app.post("/eligibilite")
async def check_eligibilite(req: EligRequest):
    dept = req.postcode[:2]
    if dept == "20":
        dept = "2A" if req.postcode[:3] in ("200", "201") else "2B"

    # Load data in parallel
    operators_task = load_arcep_operators()
    elig_task = load_arcep_elig(dept)
    imb_task = find_building(dept, req.addr_code, req.citycode)
    antenna_task = find_antennas(req.lat, req.lon, req.postcode)

    operators_ref, elig_data, building, antennas = await asyncio.gather(
        operators_task, elig_task, imb_task, antenna_task
    )

    # Find eligibility for this building
    ftth_operators = []
    other_techs = []
    imb_code = None
    nb_logements = None

    if building:
        imb_id = building.get("imb_id", "")
        imb_code = building.get("imb_code", building.get("code_imb", ""))
        nb_logements = building.get("imb_nbr_logloc")

        # Match eligibility data to this building
        for e in elig_data:
            if e.get("imb_id") == imb_id or e.get("imb_code") == imb_code:
                op_code = e.get("code_operateur", "")
                op_name = operators_ref.get(op_code, op_code)
                tech = e.get("code_techno", "")

                entry = {
                    "name": op_name,
                    "technology": tech,
                    "technologyLabel": TECH_LABELS.get(tech, tech),
                    "downloadClass": e.get("classe_debit_descendant", ""),
                    "uploadClass": e.get("classe_debit_montant", ""),
                }

                if tech == "FO":
                    ftth_operators.append(entry)
                else:
                    other_techs.append(entry)

    # Building details
    imb_type = None
    imb_source = None
    imb_address = None
    if building:
        imb_type = building.get("imb_type", "")  # IM=immeuble, PA=pavillon
        imb_source = building.get("imb_source", "")  # fo=fibre, cu=cuivre
        imb_address = " ".join(filter(None, [
            building.get("addr_numero", ""),
            building.get("addr_rep", ""),
            building.get("addr_nom_voie", ""),
            building.get("addr_nom_commune", ""),
        ]))

    return {
        "ftth": {
            "available": len(ftth_operators) > 0,
            "operators": ftth_operators,
            "otherTechs": other_techs,
            "imbCode": imb_code,
            "nbLogements": nb_logements,
            "imbType": imb_type,
            "imbSource": imb_source,
            "imbAddress": imb_address,
            "oi": None,
        },
        "antennas": antennas,
    }


if __name__ == "__main__":
    print(f"Éligibilité API — port {API_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=API_PORT)
