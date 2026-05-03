from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.server.db.database import get_db
from app.server.models.user import User
from app.server.schemas.user import UserCreate, UserOut
from app.server.schemas.token import Token, LoginData
from app.server.core.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Проверяваме дали имейлът е свободен
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Имейлът вече е зает")

    # Проверяваме дали потребителското име е свободно
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Потребителското име вече е заето")

    # Създаваме потребител — хешираме паролата
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Веднага издаваме токен — не е нужен отделен вход
    return {"access_token": create_token(user.id)}


@router.post("/login", response_model=Token)
async def login(data: LoginData, db: AsyncSession = Depends(get_db)):
    # Търсим потребител по имейл
    result = await db.execute(select(User).where(User.email == data.email))
    user   = result.scalar_one_or_none()

    # Проверяваме паролата
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Невалиден имейл или парола",
        )

    return {"access_token": create_token(user.id)}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Връща данните на текущия потребител по токен"""
    return current_user