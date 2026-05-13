from fastapi import APIRouter
from backend.api.v1.endpoints import messages, channels, auth, ws

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(channels.router)
router.include_router(messages.router)
router.include_router(ws.router)