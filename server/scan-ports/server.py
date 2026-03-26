"""
Scan Ports API — Dahouse
Scan rapide des ports ouverts sur l'IP publique du client.

Sécurité :
- Scanne UNIQUEMENT l'IP du client (pas d'IP arbitraire)
- Token usage unique, TTL 60s
- Rate limit : 1 scan par IP toutes les 5 minutes
- Pas de logs, pas de stockage

Ports scannés : ~25 ports critiques (RDP, SSH, SQL, SMB, etc.)
Timeout : 1.5s par port, scan concurrent → ~5s total
"""

import asyncio
import json
import secrets
import time
from dataclasses import dataclass

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

# --- Config ---
API_PORT = 8044
TOKEN_TTL = 60
MAX_CONCURRENT = 5
RATE_LIMIT_SECONDS = 300  # 5 min between scans per IP
PORT_TIMEOUT = 1.5  # seconds per port

app = FastAPI(title="Scan Ports API")

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

# --- Port definitions ---
SCAN_PORTS = [
    {"port": 21, "service": "FTP", "label": "Transfert de fichiers", "risk": "high",
     "simple": "Transfert de fichiers non sécurisé ouvert", "detail": "FTP transmet les identifiants en clair"},
    {"port": 22, "service": "SSH", "label": "Accès terminal sécurisé", "risk": "medium",
     "simple": "Accès terminal distant ouvert", "detail": "Vérifiez l'authentification par clé et désactivez le mot de passe"},
    {"port": 23, "service": "Telnet", "label": "Terminal non chiffré", "risk": "critical",
     "simple": "Accès terminal non sécurisé ouvert — risque critique", "detail": "Telnet transmet tout en clair, à remplacer par SSH"},
    {"port": 25, "service": "SMTP", "label": "Envoi d'emails", "risk": "medium",
     "simple": "Serveur d'envoi d'emails ouvert", "detail": "Port SMTP — vérifiez qu'il n'est pas un relais ouvert"},
    {"port": 53, "service": "DNS", "label": "Serveur DNS", "risk": "low",
     "simple": "Serveur de noms de domaine", "detail": "Vérifiez que le DNS n'est pas ouvert à la récursion externe"},
    {"port": 80, "service": "HTTP", "label": "Site web non chiffré", "risk": "low",
     "simple": "Site web accessible", "detail": "Vérifiez la redirection vers HTTPS"},
    {"port": 110, "service": "POP3", "label": "Messagerie POP3", "risk": "high",
     "simple": "Boîte mail accessible sans chiffrement", "detail": "POP3 transmet les mots de passe en clair — utilisez POP3S (995)"},
    {"port": 135, "service": "MSRPC", "label": "Appels de procédure Windows", "risk": "high",
     "simple": "Service Windows exposé sur internet — risque élevé", "detail": "MSRPC ne devrait jamais être exposé publiquement"},
    {"port": 139, "service": "NetBIOS", "label": "Partage réseau Windows", "risk": "critical",
     "simple": "Partage de fichiers Windows exposé — risque critique", "detail": "NetBIOS exposé = risque d'accès aux fichiers partagés"},
    {"port": 143, "service": "IMAP", "label": "Messagerie IMAP", "risk": "medium",
     "simple": "Boîte mail accessible", "detail": "Préférez IMAPS (993) pour le chiffrement"},
    {"port": 443, "service": "HTTPS", "label": "Site web sécurisé", "risk": "info",
     "simple": "Site web sécurisé (normal)", "detail": "HTTPS — port standard, généralement attendu"},
    {"port": 445, "service": "SMB", "label": "Partage de fichiers Windows", "risk": "critical",
     "simple": "Partage de fichiers exposé — risque critique", "detail": "SMB exposé = vecteur d'attaque majeur (WannaCry, EternalBlue)"},
    {"port": 993, "service": "IMAPS", "label": "Messagerie IMAP sécurisée", "risk": "info",
     "simple": "Boîte mail sécurisée (normal)", "detail": "IMAP sur TLS — configuration standard"},
    {"port": 995, "service": "POP3S", "label": "Messagerie POP3 sécurisée", "risk": "info",
     "simple": "Boîte mail sécurisée (normal)", "detail": "POP3 sur TLS — configuration standard"},
    {"port": 1433, "service": "MSSQL", "label": "Base de données SQL Server", "risk": "critical",
     "simple": "Base de données exposée — risque critique", "detail": "SQL Server ne devrait jamais être accessible depuis internet"},
    {"port": 1521, "service": "Oracle DB", "label": "Base de données Oracle", "risk": "critical",
     "simple": "Base de données exposée — risque critique", "detail": "Oracle DB exposé = accès potentiel aux données"},
    {"port": 3306, "service": "MySQL", "label": "Base de données MySQL", "risk": "critical",
     "simple": "Base de données exposée — risque critique", "detail": "MySQL ne devrait jamais être accessible depuis internet"},
    {"port": 3389, "service": "RDP", "label": "Bureau à distance Windows", "risk": "critical",
     "simple": "Bureau à distance ouvert — risque critique", "detail": "RDP exposé = cible #1 des ransomwares (BlueKeep, brute-force)"},
    {"port": 5432, "service": "PostgreSQL", "label": "Base de données PostgreSQL", "risk": "critical",
     "simple": "Base de données exposée — risque critique", "detail": "PostgreSQL ne devrait jamais être accessible depuis internet"},
    {"port": 5900, "service": "VNC", "label": "Contrôle à distance VNC", "risk": "critical",
     "simple": "Prise de contrôle à distance ouverte — risque critique", "detail": "VNC souvent sans chiffrement, accès graphique complet à la machine"},
    {"port": 8080, "service": "HTTP-Alt", "label": "Serveur web alternatif", "risk": "medium",
     "simple": "Service web sur port non standard", "detail": "Souvent un proxy, panneau d'admin ou serveur de dev"},
    {"port": 8443, "service": "HTTPS-Alt", "label": "Serveur web sécurisé alternatif", "risk": "low",
     "simple": "Service web sécurisé sur port non standard", "detail": "Port alternatif HTTPS — vérifiez la légitimité du service"},
    {"port": 27017, "service": "MongoDB", "label": "Base de données MongoDB", "risk": "critical",
     "simple": "Base de données exposée — risque critique", "detail": "MongoDB sans auth exposé = accès complet aux données"},
    {"port": 6379, "service": "Redis", "label": "Cache/base Redis", "risk": "critical",
     "simple": "Service de cache exposé — risque critique", "detail": "Redis exposé sans auth = exécution de commandes possible"},
]


@dataclass
class ScanToken:
    token: str
    client_ip: str
    created: float
    used: bool = False


tokens: dict[str, ScanToken] = {}
rate_limits: dict[str, float] = {}  # ip -> last scan timestamp


def get_client_ip(request: Request) -> str:
    """Get real client IP from Cloudflare/nginx headers."""
    return (
        request.headers.get("cf-connecting-ip")
        or request.headers.get("x-real-ip")
        or request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.client.host
    )


def cleanup_expired():
    now = time.time()
    expired = [t for t, s in tokens.items() if now - s.created > TOKEN_TTL]
    for token in expired:
        tokens.pop(token)
    # Cleanup old rate limits
    old = [ip for ip, ts in rate_limits.items() if now - ts > RATE_LIMIT_SECONDS]
    for ip in old:
        rate_limits.pop(ip)


# --- Health ---
@app.get("/health")
async def health():
    cleanup_expired()
    return {"status": "ok", "active": len(tokens)}


# --- Token + IP detection ---
@app.post("/token")
async def create_token(request: Request):
    cleanup_expired()
    client_ip = get_client_ip(request)

    # Rate limit
    last_scan = rate_limits.get(client_ip, 0)
    if time.time() - last_scan < RATE_LIMIT_SECONDS:
        remaining = int(RATE_LIMIT_SECONDS - (time.time() - last_scan))
        raise HTTPException(429, f"Veuillez patienter {remaining}s avant de relancer un scan")

    if len(tokens) >= MAX_CONCURRENT:
        raise HTTPException(503, "Trop de scans en cours")

    token = secrets.token_urlsafe(32)
    tokens[token] = ScanToken(token=token, client_ip=client_ip, created=time.time())

    return {
        "token": token,
        "clientIp": client_ip,
        "expiresIn": TOKEN_TTL,
    }


# --- Scan endpoint ---
@app.post("/scan/{token}")
async def run_scan(token: str):
    session = tokens.get(token)
    if not session:
        raise HTTPException(404, "Token invalide ou expiré")
    if session.used:
        raise HTTPException(409, "Token déjà utilisé")
    if time.time() - session.created > TOKEN_TTL:
        tokens.pop(token, None)
        raise HTTPException(410, "Token expiré")

    session.used = True
    client_ip = session.client_ip
    rate_limits[client_ip] = time.time()

    # Run scan
    results = await scan_ports(client_ip)
    os_guess = guess_os(results)

    # Cleanup
    tokens.pop(token, None)

    return {
        "ip": client_ip,
        "ports": results,
        "os": os_guess,
        "timestamp": int(time.time()),
        "scanDuration": sum(r.get("responseTime", 0) for r in results if r["status"] == "open"),
    }


# --- Async port scanner ---
async def scan_single_port(ip: str, port_def: dict) -> dict:
    port = port_def["port"]
    result = {
        "port": port,
        "service": port_def["service"],
        "label": port_def["label"],
        "simpleLabel": port_def["simple"],
        "detail": port_def["detail"],
        "risk": port_def["risk"],
        "status": "closed",
        "banner": None,
        "responseTime": 0,
    }

    try:
        start = time.time()
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(ip, port),
            timeout=PORT_TIMEOUT,
        )
        elapsed = round((time.time() - start) * 1000)
        result["status"] = "open"
        result["responseTime"] = elapsed

        # Try to grab banner
        try:
            writer.write(b"\r\n")
            await writer.drain()
            banner_data = await asyncio.wait_for(reader.read(256), timeout=1.0)
            if banner_data:
                banner = banner_data.decode("utf-8", errors="replace").strip()
                if banner and len(banner) > 2:
                    result["banner"] = banner[:200]
        except Exception:
            pass

        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass

    except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
        result["status"] = "closed"

    return result


async def scan_ports(ip: str) -> list[dict]:
    """Scan all ports concurrently."""
    tasks = [scan_single_port(ip, p) for p in SCAN_PORTS]
    results = await asyncio.gather(*tasks)
    return sorted(results, key=lambda r: (r["status"] != "open", r["port"]))


def guess_os(results: list[dict]) -> dict:
    """Guess OS from open ports and banners."""
    open_ports = {r["port"] for r in results if r["status"] == "open"}
    banners = {r["port"]: r["banner"] for r in results if r.get("banner")}

    hints = []
    os_type = "unknown"
    os_label = "Système non identifié"
    os_simple = "Impossible de déterminer le système d'exploitation"

    # Windows indicators
    windows_ports = {135, 139, 445, 3389}
    if windows_ports & open_ports:
        os_type = "windows"
        os_label = "Windows (probable)"
        os_simple = "Votre équipement semble fonctionner sous Windows"
        matched = windows_ports & open_ports
        hints.append(f"Ports Windows détectés : {', '.join(str(p) for p in sorted(matched))}")

    # Linux indicators
    linux_indicators = 0
    if 22 in open_ports:
        linux_indicators += 1
        hints.append("SSH ouvert (courant sous Linux)")
    for banner in banners.values():
        bl = banner.lower()
        if any(k in bl for k in ["ubuntu", "debian", "centos", "linux", "nginx", "apache"]):
            linux_indicators += 2
            hints.append(f"Bannière Linux détectée")
            break

    if linux_indicators >= 2 and os_type == "unknown":
        os_type = "linux"
        os_label = "Linux (probable)"
        os_simple = "Votre équipement semble fonctionner sous Linux"

    # Network device
    if not open_ports - {80, 443} and (80 in open_ports or 443 in open_ports):
        if os_type == "unknown":
            os_type = "appliance"
            os_label = "Équipement réseau ou firewall"
            os_simple = "Votre adresse IP semble être un équipement réseau (routeur, firewall)"

    # Banner-based refinement
    for port, banner in banners.items():
        if banner and len(banner) > 5:
            hints.append(f"Port {port} : {banner[:80]}")

    return {
        "type": os_type,
        "label": os_label,
        "simpleLabel": os_simple,
        "hints": hints[:5],  # max 5 hints
    }


if __name__ == "__main__":
    print(f"Scan Ports API — port {API_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=API_PORT)
