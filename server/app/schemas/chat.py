from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MessageBase(BaseModel):
    """메시지 기본 스키마"""
    role: str
    content: str


class MessageCreate(MessageBase):
    """메시지 생성 스키마"""
    pass


class Message(MessageBase):
    """메시지 응답 스키마"""
    id: int
    message_id: str
    session_id: int
    created_at: datetime
    tokens_used: Optional[int] = None
    processing_time: Optional[int] = None

    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    """채팅 세션 기본 스키마"""
    title: Optional[str] = None


class ChatSessionCreate(ChatSessionBase):
    """채팅 세션 생성 스키마"""
    pass


class ChatSessionUpdate(BaseModel):
    """채팅 세션 업데이트 스키마"""
    title: Optional[str] = None
    is_active: Optional[bool] = None


class ChatSession(ChatSessionBase):
    """채팅 세션 응답 스키마"""
    id: int
    session_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    messages: List[Message] = []

    class Config:
        from_attributes = True
