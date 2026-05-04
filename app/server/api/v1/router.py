from fastapi import APIRouter
from app.server.api.v1.endpoints import auth, channels, messages, ws

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(channels.router)
router.include_router(messages.router)
router.include_router(ws.router)