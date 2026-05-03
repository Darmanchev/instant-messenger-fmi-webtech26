from pydantic import BaseModel, Field, ConfigDict


class ChannelCreate(BaseModel):
    name: str = Field(min_length=3, max_length=20)

class ChannelOut(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)