from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.server.db.database import get_db
from app.server.models.message import Message
from app.server.models.user import User
from app.server.core.websocket import manager
from app.server.core.auth import decode_token


router = APIRouter(tags=["websocket"])

@router.websocket("/ws/{channel_id}")
async def websocket_endpoint(channel_id: int, ws: WebSocket, token: str, db: AsyncSession = Depends(get_db)):
    user_id = decode_token(token)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        await ws.close()
        return

    await manager.connect(ws, channel_id)

    try:
        while True:
            data = await ws.receive_json()

            msg = Message(
                content=data["content"],
                user_id=user.id,
                channel_id=channel_id,
            )

            db.add(msg)
            await db.commit()
            await db.refresh(msg)

            await manager.broadcast({
                "id": msg.id,
                "content": msg.content,
                "sent_at": msg.sent_at.isoformat(),
                "channel_id": msg.channel_id,
                "author": {
                    "id": user.id,
                    "username": user.username,
                }
            }, channel_id)


    except WebSocketDisconnect:
        manager.disconnect(ws, channel_id)