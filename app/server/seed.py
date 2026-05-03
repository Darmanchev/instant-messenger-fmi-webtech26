import asyncio
from passlib.context import CryptContext
from app.server.db.database import SessionLocal, engine
from app.server.db.base import Base
from app.server.models import User, Channel, Message
from sqlalchemy import select

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    # 1. Създаваме таблиците асинхронно
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # 2. Проверка за съществуващи данни
        result = await db.execute(select(User))
        if result.first():
            print("⚡ БД вече е попълнена.")
            return

        # 3. Създаваме потребители (чрез списък от речници за чистота)
        user_data = [
            ("alice", "alice@test.com", "123456"),
            ("bob", "bob@test.com", "123456"),
            ("admin", "admin@test.com", "admin")
        ]
        users = [User(username=u, email=e, password_hash=pwd_context.hash(p)) for u, e, p in user_data]
        db.add_all(users)

        # 4. Създаваме канали
        channel_names = ["general", "random", "tech", "announcements", "design"]
        channels = [Channel(name=name) for name in channel_names]
        db.add_all(channels)

        # Запазваме, за да получим ID за съобщенията
        await db.commit()
        for obj in users + channels: await db.refresh(obj)

        # 5. Съобщения (използваме обектите директно благодарение на back_populates)
        messages = [
            Message(content="Здравейте на всички! 👋", channel=channels[0], author=users[0]),
            Message(content="Радвам се, че съм тук!", channel=channels[0], author=users[1]),
            Message(content="FastAPI е по-добър от Flask.", channel=channels[2], author=users[1]),
            Message(content="🎉 BestMessenger е пуснат!", channel=channels[3], author=users[2]),
        ]
        db.add_all(messages)
        await db.commit()

    print("✅ БД е успешно инициализирана с демо данни!")


if __name__ == "__main__":
    asyncio.run(seed())