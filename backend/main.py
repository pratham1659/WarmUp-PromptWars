from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.process import router as process_router

app = FastAPI(
    title="PromptWars API",
    description="AI-powered input processing using Google Gemini",
    version="1.0.0",
)

import os

# ── CORS ───────────────────────────────────────────────────────────────────
# Read origins from env var (comma-separated) or fall back to dev defaults.
# For Cloud Run, set ALLOWED_ORIGINS=* or the specific frontend URL.
_default_origins = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
_origins = os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth Initialization ──────────────────────────────────────────────────
from services.auth import initialize_firebase
initialize_firebase()

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(process_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
