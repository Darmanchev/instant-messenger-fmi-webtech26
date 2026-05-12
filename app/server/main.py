from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

# ── Middleware ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/client"), name="static")

# pages
@app.get("/login")
async def login_page():
    return FileResponse("app/client/html/login.html")

@app.get("/register")
async def register_page():
    return FileResponse("app/client/html/register.html")

@app.get("/chat")
async def chat_page():
    return FileResponse("app/client/html/chat.html")

from app.server.api.v1.router import router
app.include_router(router)