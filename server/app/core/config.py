from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any


class Settings(BaseSettings):
    PROJECT_NAME: str = "DeepAuto"
    API_V1_STR: str = "/api/v1"
    
    # CORS 설정
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js 개발 서버
        "http://localhost:8000",  # FastAPI 서버
    ]
    
    # 데이터베이스 설정
    MYSQL_SERVER: str = "localhost"  # 기본값: 로컬 개발용
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_DB: str
    MYSQL_PORT: str = "3306"  # 기본값
    AWS_REGION: str = "ap-northeast-2"  # 기본값: 서울 리전
    
    # DeepAuto API 설정
    DEEPAUTO_API_KEY: str  # .env 파일에서 로드
    DEEPAUTO_BASE_URL: str = "https://api.deepauto.ai/openai/v1"
    
    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    @property
    def get_database_url(self) -> str:
        """데이터베이스 URL 생성"""
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
