from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.chat import ChatSession
from app.schemas.chat import ChatSessionCreate, ChatSessionUpdate


class ChatSessionCRUD:
    def create_session(self, db: Session, session_data: ChatSessionCreate) -> Optional[ChatSession]:
        """ 채팅 세션 생성 """
        try:
            db_session = ChatSession(
                title=session_data.title,
                is_active=True
            )
            db.add(db_session)
            db.commit()
            db.refresh(db_session)
            return db_session
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error creating chat session: {e}")
            return None
    
    def get_session_by_id(self, db: Session, session_id: int) -> Optional[ChatSession]:
        """ 채팅 세션 ID로 조회 """
        try:
            return db.query(ChatSession).filter(ChatSession.id == session_id).first()
        except SQLAlchemyError as e:
            print(f"Error getting chat session by id: {e}")
            return None
    
    def get_recent_sessions(self, db: Session, limit: int = 20) -> List[ChatSession]:
        """ 최근에 업데이트된 활성 채팅 세션을 조회합니다."""
        try:
            return db.query(ChatSession).filter(
                ChatSession.is_active == True
            ).order_by(ChatSession.updated_at.desc()).limit(limit).all()
        except SQLAlchemyError as e:
            print(f"Error getting recent chat sessions: {e}")
            return []
    
    def update_session(self, db: Session, session_id: int, session_data: ChatSessionUpdate) -> Optional[ChatSession]:
        """ 채팅 세션의 제목이나 활성 상태를 업데이트합니다. """
        try:
            db_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not db_session:
                return None
            
            # Update fields if provided
            if session_data.title is not None:
                db_session.title = session_data.title
            if session_data.is_active is not None:
                db_session.is_active = session_data.is_active
                
            db.commit()
            db.refresh(db_session)
            return db_session
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error updating chat session: {e}")
            return None
    
    def delete_session(self, db: Session, session_id: int) -> bool:
        """ 채팅 세션을 삭제합니다."""
        try:
            db_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not db_session:
                return False
            
            # Soft delete by setting is_active to False
            db_session.is_active = False
            db.commit()
            return True
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error deleting chat session: {e}")
            return False
    
    def get_active_session_count(self, db: Session) -> int:
        """ 활성화된 채팅 세션의 수를 조회합니다."""
        try:
            return db.query(ChatSession).filter(ChatSession.is_active == True).count()
        except SQLAlchemyError as e:
            print(f"Error getting active session count: {e}")
            return 0


chat_session_crud = ChatSessionCRUD()
