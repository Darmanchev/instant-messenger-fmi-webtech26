import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.auth import decode_token
from backend.core.config import settings
from backend.core.websocket import ConnectionLimitExceeded, manager
from backend.db.database import get_db
from backend.models.channel import Channel
from backend.models.message import Message
from backend.models.user import User
from backend.schemas.message import MessageCreate

router = APIRouter(tags=["websocket"])
logger = logging.getLogger(__name__)


async def close_websocket(ws: WebSocket, code: int, reason: str) -> None:
    try:
        await ws.close(code=code, reason=reason)
    except RuntimeError:
        pass


@router.websocket("/ws/{channel_id}")
async def websocket_endpoint(
    channel_id: int,
    ws: WebSocket,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    user_id = decode_token(token)
    if user_id is None:
        await close_websocket(ws, 4001, "Invalid authentication token")
        return

    try:
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            await close_websocket(ws, 4001, "User not found")
            return

        channel_result = await db.execute(select(Channel.id).where(Channel.id == channel_id))
        if channel_result.scalar_one_or_none() is None:
            await close_websocket(ws, 4004, "Channel not found")
            return
    except SQLAlchemyError:
        logger.exception("Failed to validate WebSocket connection")
        await db.rollback()
        await close_websocket(ws, 1011, "Database error")
        return

    client_ip = ws.client.host if ws.client else "unknown"
    try:
        await manager.connect(
            ws,
            channel_id,
            user.id,
            client_ip,
            max_connections_per_user=settings.WS_MAX_CONNECTIONS_PER_USER,
            max_connections_per_ip=settings.WS_MAX_CONNECTIONS_PER_IP,
        )
    except ConnectionLimitExceeded as exc:
        await close_websocket(ws, 4008, str(exc))
        return

    try:
        while True:
            event = await ws.receive()
            if event["type"] == "websocket.disconnect":
                raise WebSocketDisconnect(
                    code=event.get("code", 1000),
                    reason=event.get("reason"),
                )

            raw_message = event.get("text")
            if raw_message is None:
                await close_websocket(ws, 1003, "Text JSON messages are required")
                break

            if len(raw_message.encode("utf-8")) > settings.WS_MAX_FRAME_BYTES:
                await close_websocket(ws, 1009, "Message frame is too large")
                break

            if not await manager.allow_message(
                user.id,
                limit=settings.WS_MESSAGES_PER_MINUTE,
            ):
                await close_websocket(ws, 1013, "Message rate limit exceeded")
                break

            try:
                data = MessageCreate.model_validate_json(raw_message)
            except ValidationError:
                await close_websocket(ws, 1008, "Invalid message payload")
                break

            msg = Message(
                content=data.content,
                user_id=user.id,
                channel_id=channel_id,
            )

            try:
                db.add(msg)
                await db.commit()
                await db.refresh(msg)
            except SQLAlchemyError:
                logger.exception("Failed to persist WebSocket message")
                await db.rollback()
                await close_websocket(ws, 1011, "Database error")
                break

            await manager.broadcast(
                {
                    "id": msg.id,
                    "content": msg.content,
                    "sent_at": msg.sent_at.isoformat(),
                    "channel_id": msg.channel_id,
                    "author": {
                        "id": user.id,
                        "username": user.username,
                    },
                },
                channel_id,
                send_timeout_seconds=settings.WS_SEND_TIMEOUT_SECONDS,
            )
    except WebSocketDisconnect:
        pass
    except RuntimeError:
        logger.exception("Malformed WebSocket frame")
        await close_websocket(ws, 1003, "Text JSON messages are required")
    finally:
        await manager.disconnect(ws, channel_id)
