from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str
    APP_NAME: str
    SECRET_KEY: str = "deodap_secret_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Phase 6 Additions
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    SMTP_HOST: Optional[str] = "localhost"
    SMTP_PORT: Optional[int] = 1025
    SMTP_USER: Optional[str] = ""
    SMTP_PASSWORD: Optional[str] = ""
    SMTP_FROM: Optional[str] = "noreply@deodap.com"
    BLOCKED_IPS: Optional[str] = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
