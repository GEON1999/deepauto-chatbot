from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.chat_session_crud import chat_session_crud
from app.services.message_crud import message_crud
from app.schemas.chat import ChatSession, ChatSessionCreate, ChatSessionUpdate, Message

router = APIRouter()

@router.get("/", response_model=List[ChatSession])
def get_chat_sessions(
    skip: int = 0, 
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    채팅 세션 목록을 조회합니다.
    """
    chat_sessions = chat_session_crud.get_recent_sessions(db, limit=limit)
    return chat_sessions

@router.get("/{chat_id}", response_model=ChatSession)
def get_chat_session(
    chat_id: int,
    db: Session = Depends(get_db)
):
    """
    특정 채팅 세션을 조회합니다.
    """
    chat_session = chat_session_crud.get_session_by_id(db, session_id=chat_id)
    if chat_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    return chat_session

@router.post("/", response_model=ChatSession, status_code=status.HTTP_201_CREATED)
def create_chat_session(
    chat_session_data: ChatSessionCreate,
    db: Session = Depends(get_db)
):
    """
    새로운 채팅 세션을 생성합니다.
    """
    chat_session = chat_session_crud.create_session(db, session_data=chat_session_data)
    if chat_session is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat session"
        )
    return chat_session

@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    chat_id: int,
    db: Session = Depends(get_db)
):
    """
    채팅 세션을 삭제합니다 (소프트 삭제).
    """
    result = chat_session_crud.delete_session(db, session_id=chat_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    return None

@router.get("/{chat_id}/messages", response_model=List[Message])
def get_chat_messages(
    chat_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    특정 채팅 세션의 메시지 목록을 조회합니다.
    """
    # 먼저 채팅 세션이 존재하는지 확인
    chat_session = chat_session_crud.get_session_by_id(db, session_id=chat_id)
    if chat_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    messages = message_crud.get_messages_by_session(db, session_id=chat_id, skip=skip, limit=limit)
    return messages
