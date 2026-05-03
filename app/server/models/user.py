from sqlalchemy import Column, String, Text, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.server.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text,nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    messages = relationship("Message", back_populates="author")