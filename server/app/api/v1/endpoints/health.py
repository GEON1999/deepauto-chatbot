from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.services.chat_session_crud import chat_session_crud

router = APIRouter()

@router.get("/")
def check_health(db: Session = Depends(get_db)):
    """
    서버와 데이터베이스 연결 상태를 확인합니다.
    """
    # 데이터베이스 연결 확인을 위해 활성 세션 수 조회
    try:
        active_sessions = chat_session_crud.get_active_session_count(db)
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "status": db_status,
            "active_sessions": active_sessions if db_status == "healthy" else None
        },
        "api_version": "v1"
    }
