from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime
import datetime

# SQLAlchemy 기본 Base 클래스 생성
Base = declarative_base()

# 모델에서 공통적으로 사용할 mixin 클래스
class TimestampMixin:
    """
    모든 모델에 생성 및 수정 시간을 추가하는 mixin 클래스
    """
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
