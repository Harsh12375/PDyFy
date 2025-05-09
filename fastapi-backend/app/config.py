from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "AI Planet Assignment"
    STORAGE_PATH: str = "./storage/documents"
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"
    
    GOOGLE_API_KEY: str = "AIzaSyBjSzoyn37rX5kFqBYX6PPEt2G-e_lUBy0"
    TOGETHER_API: str | None = None
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()