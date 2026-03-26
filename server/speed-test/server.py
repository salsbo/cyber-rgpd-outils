"""
Speed Test API — Dahouse
Endpoints pour mesure débit/latence depuis le navigateur.

- GET  /ping         → 1 octet (mesure TTFB/latence)
- GET  /download     → 5 Mo de données aléatoires (mesure débit descendant)
- POST /upload       → accepte des données (mesure débit montant)
- GET  /health       → état du service
"""

import os
import time

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

API_PORT = 8046

app = FastAPI(title="Speed Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dahouse.fr",
        "https://www.dahouse.fr",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Server-Timing", "Timing-Allow-Origin"],
)

# Pre-generate random data for download test
DOWNLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
DOWNLOAD_DATA = os.urandom(DOWNLOAD_SIZE)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ping")
async def ping():
    """1 byte response for latency/TTFB measurement."""
    return Response(
        content=b".",
        media_type="application/octet-stream",
        headers={
            "Cache-Control": "no-store, no-cache",
            "Timing-Allow-Origin": "*",
            "X-Server-Timing": str(int(time.time() * 1000)),
        },
    )


@app.get("/download")
async def download():
    """5 MB random data for download speed measurement."""
    return Response(
        content=DOWNLOAD_DATA,
        media_type="application/octet-stream",
        headers={
            "Cache-Control": "no-store, no-cache",
            "Timing-Allow-Origin": "*",
            "Content-Length": str(DOWNLOAD_SIZE),
        },
    )


@app.post("/upload")
async def upload(request: Request):
    """Accept uploaded data and return timing info."""
    start = time.time()
    body = await request.body()
    elapsed = time.time() - start
    size = len(body)

    return {
        "received": size,
        "serverTimeMs": round(elapsed * 1000),
    }


if __name__ == "__main__":
    print(f"Speed Test API — port {API_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=API_PORT)
