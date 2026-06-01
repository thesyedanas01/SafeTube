from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    APP_NAME: str = "SafeTube AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: list[str] = [
        "chrome-extension://*",
        "http://localhost:*",
        "http://127.0.0.1:*",
    ]

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{Path(__file__).resolve().parent.parent.parent / 'safetube.db'}"

    # External APIs
    GEMINI_API_KEY: str | None = None

    # ML Model settings
    MAX_TEXT_LENGTH: int = 50000  # Max chars for analysis input
    TRANSCRIPT_WORD_LIMIT: int = 5000  # Truncate transcripts to this many words

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
