from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.process import router as process_router

app = FastAPI(
    title="PromptWars API",
    description="AI-powered input processing using Google Gemini",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────
# Allow the Vite React frontend running on localhost:5173 (and 3000 as fallback)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(process_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
