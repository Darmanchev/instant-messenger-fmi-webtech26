from sqlalchemy import Column, ForeignKey, Integer, Text, String
from sqlalchemy.orm import relationship

from app.server.db.base import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50),unique=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # relationships
    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")
    creator = relationship("User", back_populates="created_channels")
