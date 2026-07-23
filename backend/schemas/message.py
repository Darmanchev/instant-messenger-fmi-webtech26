from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .user import UserPublic


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=255)

    model_config = ConfigDict(extra="forbid")


class MessageOut(BaseModel):
    id: int
    content: str
    sent_at: datetime
    author: UserPublic

    model_config = ConfigDict(from_attributes=True)
