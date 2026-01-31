from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    MONGO_USER: str
    MONGO_PASSWORD: str
    MONGO_ADDRESS: str
    MONGO_CLUSTER: str
    FIREBASE_API: str
    ALLOWED_ORIGINS: List[str] = ["*"]
    STORAGE_ADDRESS: str = ""
    STORAGE_USER: str = ""
    STORAGE_PASSWORD: str = ""
    STORAGE_PORT: int = 23
    STORAGE_API_TOKEN: str = ""
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ELEVEN_LABS_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
