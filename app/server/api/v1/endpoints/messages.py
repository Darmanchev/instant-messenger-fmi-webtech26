from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.server.db.database import get_db
from app.server.models.message import Message
from app.server.models.channel import Channel
from app.server.schemas.message import MessageOut

router = APIRouter(prefix="/channels", tags=["messages"])


@router.get("/{channel_id}/messages", response_model=list[MessageOut])
async def get_messages(channel_id: int, db: AsyncSession = Depends(get_db)):
    channel = await db.execute(select(Channel).where(Channel.id == channel_id))
    if not channel.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Channel not found")

    result = await db.execute(
        select(Message)
        .where(Message.channel_id == channel_id)
        .options(selectinload(Message.author))
        .order_by(Message.sent_at.asc())
    )
    return result.scalars().all()


@router.get("/{channel_id}/search", response_model=list[MessageOut])
async def search_messages(
    channel_id: int,
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    channel = await db.execute(select(Channel).where(Channel.id == channel_id))
    if not channel.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Channel not found")

    result = await db.execute(
        select(Message)
        .where(
            Message.channel_id == channel_id,
            Message.content.ilike(f"%{q}%"),
        )
        .options(selectinload(Message.author))
        .order_by(Message.sent_at.asc())
    )
    return result.scalars().all()

@router.delete("/{channel_id}/messages/{message_id}", status_code=204)
async def delete_message(
    channel_id: int,
    message_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Message).where(
            Message.id == message_id,
            Message.channel_id == channel_id,
        )
    )
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(msg)
    await db.commit()