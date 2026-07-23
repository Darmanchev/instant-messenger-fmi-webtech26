from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

MIN_SECRET_KEY_BYTES = 32
INSECURE_SECRET_KEY_PREFIXES = (
    "change-me",
    "replace-me",
    "replace-with",
    "example",
    "secret",
)


class Settings(BaseSettings):
    APP_NAME: str = "InstantMessenger API"
    ENVIRONMENT: Literal["development", "test", "production"] = "production"
    DATABASE_URL: str
    SECRET_KEY: SecretStr
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, gt=0)
    WS_MAX_FRAME_BYTES: int = Field(default=2048, ge=512, le=65536)
    WS_MESSAGES_PER_MINUTE: int = Field(default=30, ge=1, le=600)
    WS_MAX_CONNECTIONS_PER_USER: int = Field(default=3, ge=1, le=20)
    WS_MAX_CONNECTIONS_PER_IP: int = Field(default=20, ge=1, le=500)
    WS_SEND_TIMEOUT_SECONDS: float = Field(default=5.0, gt=0, le=30)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: SecretStr) -> SecretStr:
        secret = value.get_secret_value()
        normalized = secret.strip().lower()

        if any(normalized.startswith(prefix) for prefix in INSECURE_SECRET_KEY_PREFIXES):
            raise ValueError("SECRET_KEY must not use an example or placeholder value")

        if len(secret.encode("utf-8")) < MIN_SECRET_KEY_BYTES:
            raise ValueError(f"SECRET_KEY must contain at least {MIN_SECRET_KEY_BYTES} bytes")

        return value


settings = Settings()  # type: ignore[call-arg]
