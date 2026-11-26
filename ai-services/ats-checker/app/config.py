"""Configuration management for the HireNest ATS Checker microservice."""

from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings loaded from environment variables or .env."""

    APP_NAME: str = Field(default="HireNest ATS Checker Service")
    APP_ENV: str = Field(default="development")
    HOST: str = Field(default="127.0.0.1")
    PORT: int = Field(default=8001)
    ALLOWED_ORIGINS: str = Field(
        default="http://127.0.0.1:8080,http://localhost:8080,http://127.0.0.1:5173,http://localhost:5173"
    )
    MAX_FILE_SIZE_MB: int = Field(default=5, ge=1, le=20)
    MAX_PDF_PAGES: int = Field(default=15, ge=1, le=50)
    MAX_JOB_DESCRIPTION_CHARS: int = Field(default=10000, ge=100, le=50000)
    INTERNAL_SERVICE_SECRET: str = Field(
        default="hirenest_internal_ats_secret_dev_9f8e7d6c5b4a3210",
        min_length=16,
    )

    # Optional OCR configuration & resource safeguards
    ENABLE_OCR: bool = Field(default=True)
    TESSERACT_CMD: Optional[str] = Field(default=None)
    OCR_MAX_PAGES: int = Field(default=3, ge=1, le=10)
    OCR_RENDER_DPI: int = Field(default=200, ge=72, le=300)
    OCR_MAX_IMAGE_DIMENSION: int = Field(default=2400, ge=800, le=4000)
    OCR_TIMEOUT_SECONDS: int = Field(default=10, ge=2, le=30)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def allowed_origins_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
