import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Antigravity Trading Agent"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Alpaca API Settings
    ALPACA_API_KEY: Optional[str] = os.getenv("ALPACA_API_KEY", "PK_TEST_DEFAULT")
    ALPACA_SECRET_KEY: Optional[str] = os.getenv("ALPACA_SECRET_KEY", "SK_TEST_DEFAULT")
    ALPACA_BASE_URL: str = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
    
    # Database
    DATABASE_URL: str = "sqlite:///./trading_agent.db"

    class Config:
        env_file = ".env"

settings = Settings()
