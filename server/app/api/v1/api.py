from fastapi import APIRouter

from app.api.v1.endpoints import chat, chat_completion, health

api_router = APIRouter()

# 채팅 세션 엔드포인트 등록
api_router.include_router(chat.router, prefix="/chats", tags=["chats"])

# 채팅 완성 엔드포인트 등록
api_router.include_router(chat_completion.router, prefix="", tags=["chat_completion"])

# 서버 상태 확인 엔드포인트 등록
api_router.include_router(health.router, prefix="/health", tags=["health"])