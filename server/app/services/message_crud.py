from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.chat import Message, ChatSession
from app.schemas.chat import MessageCreate


class MessageCRUD:
    def create_message(self, db: Session, message_data: MessageCreate, session_id: int) -> Optional[Message]:
        """ 채팅 세션에 새로운 메시지를 추가합니다. """
        try:
            # Verify that the session exists
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                print(f"Chat session with ID {session_id} not found")
                return None
            
            db_message = Message(
                session_id=session_id,
                role=message_data.role,
                content=message_data.content
            )
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            return db_message
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error creating message: {e}")
            return None
    
    def get_messages_by_session(self, db: Session, session_id: int, skip: int = 0, limit: int = 100) -> List[Message]:
        """ 특정 채팅 세션의 모든 메시지를 시간 순으로 조회합니다."""
        try:
            return db.query(Message).filter(
                Message.session_id == session_id
            ).order_by(Message.created_at).offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            print(f"Error getting messages by session: {e}")
            return []
    
    def update_message_content(self, db: Session, message_id: int, content: str) -> Optional[Message]:
        """ 메시지 내용을 업데이트합니다. """
        try:
            db_message = db.query(Message).filter(Message.id == message_id).first()
            if not db_message:
                return None
            
            db_message.content = content
            db.commit()
            db.refresh(db_message)
            return db_message
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error updating message content: {e}")
            return None
    
    def update_message_metadata(self, db: Session, message_id: int, tokens_used: Optional[int] = None, 
                               processing_time: Optional[int] = None) -> Optional[Message]:
        """ 메시지 메타데이터(토큰 사용량, 처리 시간)를 업데이트합니다. """
        try:
            db_message = db.query(Message).filter(Message.id == message_id).first()
            if not db_message:
                return None
            
            if tokens_used is not None:
                db_message.tokens_used = tokens_used
            if processing_time is not None:
                db_message.processing_time = processing_time
                
            db.commit()
            db.refresh(db_message)
            return db_message
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error updating message metadata: {e}")
            return None
    
    def get_conversation_history(self, db: Session, session_id: int, include_system: bool = True) -> List[Message]:
        """ 채팅 세션의 전체 대화 기록을 시간 순으로 조회합니다. """
        try:
            query = db.query(Message).filter(Message.session_id == session_id)
            
            if not include_system:
                query = query.filter(Message.role != 'system')
            
            return query.order_by(Message.created_at).all()
        except SQLAlchemyError as e:
            print(f"Error getting conversation history: {e}")
            return []


message_crud = MessageCRUD()
