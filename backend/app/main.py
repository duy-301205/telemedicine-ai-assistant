import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.routes import router as api_router
from backend.app.database import SessionLocal
from backend.app.seed.seed_data import init_db, seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed demo data
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield
    # Shutdown

app = FastAPI(
    title="Telemedicine AI Demo API",
    description="Hệ thống Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine (Prototype Demo - Dữ liệu Mock)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in settings.cors_origin_list else settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "Telemedicine AI Demo API",
        "status": "online",
        "docs": "/docs",
        "demo_mode": settings.DEMO_MODE,
        "disclaimer": "DEMO / MOCK — KHÔNG PHẢI KẾT QUẢ AI THỰC TẾ"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main.py:app", host=settings.HOST, port=settings.PORT, reload=True)
