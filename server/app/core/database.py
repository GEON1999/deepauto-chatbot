from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# SQLAlchemy 엔진 생성 - 로컬 개발용 (오직 MySQL, SSL 없음)
engine = create_engine(
    settings.get_database_url, 
    pool_pre_ping=True  # 연결 끊김 방지 위해 연결 상태 확인
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모델 베이스 클래스
Base = declarative_base()


def get_db():
    """
    FastAPI 엔드포인트에서 사용할 데이터베이스 세션 의존성
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
