from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Quant Research Dashboard API"
    environment: str = "dev"
    database_url: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/dashboard"
    redis_url: str = "redis://redis:6379/0"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    alpha_vantage_api_key: str = ""
    fred_api_key: str = ""

    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
