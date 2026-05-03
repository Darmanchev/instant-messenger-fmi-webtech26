from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.server.core.config import settings
from app.server.db.database import engine
from app.server.db.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# ── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:63342",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.server.api.v1.router import router
app.include_router(router)


@app.get("/")
async def root():
    return {"status": f"{settings.APP_NAME} is running"}