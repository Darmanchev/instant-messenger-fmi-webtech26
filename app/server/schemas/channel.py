from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class ChannelCreate(BaseModel):
    name: str = Field(min_length=3, max_length=20)

class ChannelOut(BaseModel):
    id: int
    name: str
    create_by: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)