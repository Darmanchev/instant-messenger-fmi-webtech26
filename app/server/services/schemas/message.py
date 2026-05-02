from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from .user import UserOut

class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=255)

class MessageOut(BaseModel):
    id: int
    content: str
    sent_at: datetime
    author: UserOut

    model_config = ConfigDict(from_attributes=True)
