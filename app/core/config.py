from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGO_USER: str
    MONGO_PASSWORD: str
    MONGO_ADDRESS: str
    MONGO_CLUSTER: str
    FIREBASE_API: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
