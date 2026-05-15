import asyncio
from passlib.context import CryptContext
from backend.db.database import SessionLocal, engine
from backend.db.base import Base
from backend.models import User, Channel, Message
from sqlalchemy import select

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    # create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # check if db is already seeded
        result = await db.execute(select(User))
        if result.first():
            print("DB already seeded! Skipping.")
            return

        user_data = [
            ("alice", "alice@test.com", "123456"),
            ("bob", "bob@test.com", "123456"),
            ("admin", "admin@test.com", "admin")
        ]
        users = [User(username=u, email=e, password_hash=pwd_context.hash(p)) for u, e, p in user_data]
        db.add_all(users)
        await db.flush()  # получаем id пользователей без commit

        # create channels
        channel_names = ["general", "random", "tech", "announcements", "design"]
        channels = [Channel(name=name, created_by=users[2].id) for name in channel_names]
        db.add_all(channels)
        await db.commit()
        for obj in users + channels: await db.refresh(obj)

        messages = [
            Message(content="HI! 👋", channel=channels[0], author=users[0]),
            Message(content="Glad to see you", channel=channels[0], author=users[1]),
            Message(content="FastAPI", channel=channels[2], author=users[1]),
            Message(content="InstantMessenger launched! 🚀", channel=channels[3], author=users[2]),
        ]
        db.add_all(messages)
        await db.flush()
        await db.commit()

    print("Database seeded!")


if __name__ == "__main__":
    asyncio.run(seed())