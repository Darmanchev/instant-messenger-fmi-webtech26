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
    # check if email is already registered
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This email address is already taken")

    # check if username is already registered
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="That username is already taken")

    # create new user and hash password
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # give access token
    return {"access_token": create_token(user.id)}


@router.post("/login", response_model=Token)
async def login(data: LoginData, db: AsyncSession = Depends(get_db)):
    # search for user by email
    result = await db.execute(select(User).where(User.email == data.email))
    user   = result.scalar_one_or_none()

    # verify password
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    return {"access_token": create_token(user.id)}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the current user's data based on the token"""
    return current_user