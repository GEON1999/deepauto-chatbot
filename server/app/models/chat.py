from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.models.base import Base, TimestampMixin


class ChatSession(Base, TimestampMixin):
    """채팅 세션 모델"""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    # 관계 설정: 하나의 세션에 여러 메시지가 포함됨
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, title={self.title})>"


class Message(Base, TimestampMixin):
    """메시지 모델"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(50))  # 'user', 'assistant', 'system' 등
    content = Column(Text)
    
    # 추가 메타데이터
    tokens_used = Column(Integer, nullable=True)
    processing_time = Column(Integer, nullable=True)  # 처리 시간(밀리초)
    
    # 관계 설정: 메시지는 하나의 세션에 속함
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role})>"
