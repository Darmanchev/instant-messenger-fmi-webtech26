from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.server.db.database import get_db
from app.server.models.channel import Channel
from app.server.schemas.channel import ChannelOut, ChannelCreate

router = APIRouter(prefix="/channels", tags=["channels"])


@router.get("/", response_model=list[ChannelOut])
async def get_channels(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Channel))
    return result.scalars().all()


@router.get("/{channel_id}", response_model=ChannelOut)
async def get_channel(channel_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Channel).where(Channel.id == channel_id))
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(status_code=404, detail="Каналът не е намерен")
    return channel


@router.post("/", response_model=ChannelOut, status_code=201)
async def create_channel(data: ChannelCreate, db: AsyncSession = Depends(get_db)):
    # Проверяваме дали канал с това име вече съществува
    result = await db.execute(select(Channel).where(Channel.name == data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Канал с това име вече съществува")

    channel = Channel(name=data.name)
    db.add(channel)
    await db.commit()
    await db.refresh(channel)
    return channel


@router.delete("/{channel_id}", status_code=204)
async def delete_channel(channel_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Channel).where(Channel.id == channel_id))
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(status_code=404, detail="Каналът не е намерен")
    await db.delete(channel)
    await db.commit()