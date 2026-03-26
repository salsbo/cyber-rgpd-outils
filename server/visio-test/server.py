"""
Serveur WebRTC Quality Test — Dahouse
Backend aiortc + FastAPI pour mesure MOS/latence/jitter

Architecture single-port :
- POST /token → génère un token usage unique (TTL 120s)
- WS   /ws/{token} → signaling WebRTC (validé par token)
- Un seul port (8043), compatible reverse proxy nginx + Cloudflare

Sécurité :
- Token usage unique, expire après 120s
- Max 10 tests simultanés
- Pas de logs utilisateur, pas de stockage

Déploiement : docker compose up -d
"""

import asyncio
import json
import secrets
import time
from dataclasses import dataclass

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from aiortc import RTCPeerConnection, RTCSessionDescription

# --- Config ---
API_PORT = 8043
TOKEN_TTL = 120
MAX_CONCURRENT = 10

app = FastAPI(title="Visio Test API")

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


@dataclass
class TestSession:
    token: str
    created: float
    used: bool = False


sessions: dict[str, TestSession] = {}


def cleanup_expired():
    now = time.time()
    expired = [t for t, s in sessions.items() if now - s.created > TOKEN_TTL]
    for token in expired:
        sessions.pop(token)


# --- Health check ---
@app.get("/health")
async def health():
    cleanup_expired()
    return {"status": "ok", "active_sessions": len(sessions)}


# --- Token endpoint ---
@app.post("/token")
async def create_token():
    cleanup_expired()

    if len(sessions) >= MAX_CONCURRENT:
        raise HTTPException(503, "Trop de tests en cours, réessayez dans quelques instants")

    token = secrets.token_urlsafe(32)
    sessions[token] = TestSession(token=token, created=time.time())

    return {
        "token": token,
        "wsUrl": f"wss://visio-test.dahouse.fr/ws/{token}",
        "expiresIn": TOKEN_TTL,
    }


# --- WebSocket signaling + WebRTC ---
@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    cleanup_expired()

    session = sessions.get(token)
    if not session:
        await websocket.close(code=4001, reason="Token invalide ou expiré")
        return

    if session.used:
        await websocket.close(code=4002, reason="Token déjà utilisé")
        return

    if time.time() - session.created > TOKEN_TTL:
        sessions.pop(token, None)
        await websocket.close(code=4003, reason="Token expiré")
        return

    session.used = True
    await websocket.accept()

    pc = RTCPeerConnection()

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        def on_message(message):
            # Echo back for RTT measurement
            try:
                channel.send(message)
            except Exception:
                pass

    try:
        while True:
            raw = await asyncio.wait_for(websocket.receive_text(), timeout=TOKEN_TTL)
            msg = json.loads(raw)

            if msg["type"] == "offer":
                sdp = RTCSessionDescription(
                    sdp=msg["sdp"]["sdp"],
                    type=msg["sdp"]["type"],
                )
                await pc.setRemoteDescription(sdp)
                answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                await websocket.send_json({
                    "type": "answer",
                    "sdp": {
                        "sdp": pc.localDescription.sdp,
                        "type": pc.localDescription.type,
                    },
                })

            elif msg["type"] == "ice" and msg.get("candidate"):
                # aiortc gère ICE via le SDP, pas besoin de trickle
                pass

    except (WebSocketDisconnect, asyncio.TimeoutError):
        pass
    except Exception:
        pass
    finally:
        await pc.close()
        sessions.pop(token, None)


if __name__ == "__main__":
    print(f"Visio Test API — port {API_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=API_PORT)
