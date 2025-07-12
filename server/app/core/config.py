from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "DeepAuto"
    API_V1_STR: str = "/api/v1"
    
    # CORS 설정
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js 개발 서버
        "http://localhost:8000",  # FastAPI 서버
    ]
    
    # 추후 DB 설정, 인증 설정 등이 필요할 경우 여기에 추가
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
