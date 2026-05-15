from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.auth import get_current_user
from backend.db.database import get_db
from backend.models.channel import Channel
from backend.schemas.channel import ChannelOut, ChannelCreate
from backend.models.user import User

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
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel


@router.post("/", response_model=ChannelOut, status_code=201)
async def create_channel(
    data: ChannelCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ):
    # check if channel with that name already exists
    result = await db.execute(select(Channel).where(Channel.name == data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A channel with that name already exists")

    channel = Channel(name=data.name, created_by=current_user.id)
    db.add(channel)
    await db.commit()
    await db.refresh(channel)
    return channel


@router.delete("/{channel_id}", status_code=204)
async def delete_channel(
    channel_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ):
    result = await db.execute(select(Channel).where(Channel.id == channel_id))
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    if channel.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the channel creator can delete it")
    await db.delete(channel)
    await db.commit()