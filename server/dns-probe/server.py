"""
DNS Probe — Détection du résolveur DNS du client

Architecture :
1. Client → POST /probe → reçoit {token, probeDomain}
2. Client fait un fetch sur probeDomain (navigateur résout via son DNS)
3. Le serveur DNS autoritaire voit l'IP du résolveur qui a interrogé
4. Client → GET /probe/{token} → reçoit l'IP et l'identité du résolveur

Sécurité :
- Token usage unique, TTL 30s
- Le serveur DNS ne répond qu'aux sous-domaines probe.dahouse.fr
- Pas de logs persistants
"""

import asyncio
import secrets
import time
import threading
from dataclasses import dataclass, field

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dnslib import DNSRecord, DNSHeader, RR, A, QTYPE
from dnslib.server import DNSServer, BaseResolver

# --- Config ---
API_PORT = 8045
DNS_PORT = 53
PROBE_DOMAIN = "probe.dahouse.fr"
SERVER_IP = "213.32.24.42"
TOKEN_TTL = 30
MAX_PROBES = 20

# --- Known DNS resolvers ---
KNOWN_RESOLVERS = {
    # Google
    "8.8.8.8": {"name": "Google Public DNS", "ip": "8.8.8.8", "type": "public"},
    "8.8.4.4": {"name": "Google Public DNS", "ip": "8.8.4.4", "type": "public"},
    # Cloudflare
    "1.1.1.1": {"name": "Cloudflare DNS", "ip": "1.1.1.1", "type": "public"},
    "1.0.0.1": {"name": "Cloudflare DNS", "ip": "1.0.0.1", "type": "public"},
    "1.1.1.2": {"name": "Cloudflare Sécurité", "ip": "1.1.1.2", "type": "public"},
    "1.1.1.3": {"name": "Cloudflare Famille", "ip": "1.1.1.3", "type": "public"},
    # Quad9
    "9.9.9.9": {"name": "Quad9", "ip": "9.9.9.9", "type": "public"},
    "149.112.112.112": {"name": "Quad9", "ip": "149.112.112.112", "type": "public"},
    # OpenDNS
    "208.67.222.222": {"name": "OpenDNS (Cisco)", "ip": "208.67.222.222", "type": "public"},
    "208.67.220.220": {"name": "OpenDNS (Cisco)", "ip": "208.67.220.220", "type": "public"},
    # AdGuard
    "94.140.14.14": {"name": "AdGuard DNS", "ip": "94.140.14.14", "type": "public"},
    "94.140.15.15": {"name": "AdGuard DNS", "ip": "94.140.15.15", "type": "public"},
    # NextDNS
    "45.90.28.0": {"name": "NextDNS", "ip": "45.90.28.0", "type": "public"},
    "45.90.30.0": {"name": "NextDNS", "ip": "45.90.30.0", "type": "public"},
}

# Known ISP DNS ranges (French ISPs)
ISP_RANGES = [
    # Free
    {"prefix": "212.27.", "name": "Free (Freebox)", "type": "isp"},
    {"prefix": "213.228.", "name": "Free (Freebox)", "type": "isp"},
    {"prefix": "2001:660:", "name": "Free (Freebox)", "type": "isp"},
    # Orange
    {"prefix": "80.10.", "name": "Orange", "type": "isp"},
    {"prefix": "81.253.", "name": "Orange", "type": "isp"},
    {"prefix": "193.252.", "name": "Orange", "type": "isp"},
    # SFR
    {"prefix": "109.0.", "name": "SFR", "type": "isp"},
    {"prefix": "86.64.", "name": "SFR", "type": "isp"},
    # Bouygues
    {"prefix": "194.158.", "name": "Bouygues Telecom", "type": "isp"},
    # OVH
    {"prefix": "213.251.", "name": "OVH DNS", "type": "hosting"},
    {"prefix": "188.165.", "name": "OVH DNS", "type": "hosting"},
]


def identify_resolver(ip: str) -> dict:
    """Identify a DNS resolver by its IP."""
    # Check exact matches first
    if ip in KNOWN_RESOLVERS:
        return KNOWN_RESOLVERS[ip]

    # Check ISP ranges
    for isp in ISP_RANGES:
        if ip.startswith(isp["prefix"]):
            return {"name": isp["name"], "ip": ip, "type": isp["type"]}

    # Check Google ranges (they use many IPs)
    for prefix in ["74.125.", "172.217.", "216.239.", "142.250.", "209.85."]:
        if ip.startswith(prefix):
            return {"name": "Google Public DNS", "ip": ip, "type": "public"}

    # Check Cloudflare ranges
    for prefix in ["104.16.", "104.17.", "104.18.", "104.19.", "104.20.",
                    "172.64.", "172.65.", "172.66.", "172.67.", "162.159."]:
        if ip.startswith(prefix):
            return {"name": "Cloudflare DNS", "ip": ip, "type": "public"}

    return {"name": "Résolveur inconnu", "ip": ip, "type": "unknown"}


# --- Probe storage ---
@dataclass
class ProbeSession:
    token: str
    subdomain: str
    created: float
    resolver_ip: str | None = None
    resolver_ips: list[str] = field(default_factory=list)
    resolved: bool = False


probes: dict[str, ProbeSession] = {}  # subdomain -> session
tokens: dict[str, ProbeSession] = {}  # token -> session


def cleanup():
    now = time.time()
    expired_subs = [s for s, p in probes.items() if now - p.created > TOKEN_TTL]
    for sub in expired_subs:
        session = probes.pop(sub)
        tokens.pop(session.token, None)


# --- Custom DNS resolver ---
class ProbeResolver(BaseResolver):
    def resolve(self, request, handler):
        qname = str(request.q.qname).rstrip(".")
        qtype = QTYPE[request.q.qtype]
        reply = request.reply()

        # Only respond to *.probe.dahouse.fr
        if qname.endswith(PROBE_DOMAIN) and qname != PROBE_DOMAIN:
            subdomain = qname.replace(f".{PROBE_DOMAIN}", "")

            # Log the resolver IP
            client_ip = handler.client_address[0]
            session = probes.get(subdomain)
            if session and not session.resolved:
                session.resolver_ip = client_ip
                session.resolver_ips.append(client_ip)
                session.resolved = True

            # Always respond with our server IP (so the fetch succeeds)
            reply.add_answer(RR(qname, QTYPE.A, rdata=A(SERVER_IP), ttl=1))

        elif qname == PROBE_DOMAIN:
            # SOA for the zone
            reply.add_answer(RR(qname, QTYPE.A, rdata=A(SERVER_IP), ttl=60))

        return reply


# --- FastAPI app ---
app = FastAPI(title="DNS Probe API")

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


@app.get("/health")
async def health():
    cleanup()
    return {"status": "ok", "active_probes": len(probes)}


@app.post("/probe")
async def create_probe():
    cleanup()

    if len(probes) >= MAX_PROBES:
        raise HTTPException(503, "Trop de tests en cours")

    token = secrets.token_urlsafe(16)
    subdomain = secrets.token_hex(8)

    session = ProbeSession(token=token, subdomain=subdomain, created=time.time())
    probes[subdomain] = session
    tokens[token] = session

    return {
        "token": token,
        "probeDomain": f"https://{subdomain}.{PROBE_DOMAIN}/probe.gif",
    }


@app.get("/probe/{token}")
async def get_probe_result(token: str):
    session = tokens.get(token)
    if not session:
        raise HTTPException(404, "Token invalide ou expiré")

    if time.time() - session.created > TOKEN_TTL:
        probes.pop(session.subdomain, None)
        tokens.pop(token, None)
        raise HTTPException(410, "Token expiré")

    if not session.resolved:
        # Not yet resolved, client should retry
        return {"status": "pending", "message": "En attente de la résolution DNS..."}

    resolver_info = identify_resolver(session.resolver_ip)

    # Add simple labels
    if resolver_info["type"] == "isp":
        resolver_info["simpleLabel"] = f"DNS de votre box ({resolver_info['name']})"
        resolver_info["recommendation"] = "C'est le résolveur par défaut de votre box internet. Vous pouvez le changer pour un résolveur plus rapide ou plus sécurisé."
    elif resolver_info["type"] == "public":
        resolver_info["simpleLabel"] = f"{resolver_info['name']} — résolveur public"
        resolver_info["recommendation"] = "Vous utilisez un résolveur public. Bonne pratique."
    else:
        resolver_info["simpleLabel"] = f"Résolveur non identifié ({resolver_info['ip']})"
        resolver_info["recommendation"] = "Nous n'avons pas pu identifier votre résolveur. Il peut s'agir d'un DNS d'entreprise ou d'un résolveur personnalisé."

    # Cleanup
    probes.pop(session.subdomain, None)
    tokens.pop(token, None)

    return {
        "status": "resolved",
        "resolver": resolver_info,
        "allResolverIps": session.resolver_ips,
    }


# --- Startup: run DNS server in background thread ---
def start_dns_server():
    resolver = ProbeResolver()
    server = DNSServer(resolver, port=DNS_PORT, address=SERVER_IP)
    server.start_thread()
    print(f"DNS server listening on UDP:{DNS_PORT}")
    return server


if __name__ == "__main__":
    dns_server = start_dns_server()
    print(f"DNS Probe API — port {API_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=API_PORT)
