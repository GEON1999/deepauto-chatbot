import json
import time
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import httpx
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.services.chat_session_crud import ChatSessionCRUD
from app.services.message_crud import MessageCRUD
from app.schemas.chat import MessageCreate, ChatSessionUpdate

router = APIRouter()
chat_crud = ChatSessionCRUD()
message_crud = MessageCRUD()

class ChatCompletionRequest(BaseModel):
    chat_id: int
    message: str

@router.post("/chat")
async def create_chat_completion(
    request: ChatCompletionRequest,
    db: Session = Depends(get_db)
):
    """채팅 완성 API (스트리밍)"""
    try:
        # 채팅 세션 확인
        chat_session = chat_crud.get_session_by_id(db, request.chat_id)
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # 세션 제목 업데이트 (제목이 비어있는 경우에만)
        if not chat_session.title or chat_session.title.strip() == "":
            session_title = (
                request.message[:30] + "..."
                if len(request.message) > 30
                else request.message
            )
            session_update_data = ChatSessionUpdate(title=session_title)
            chat_crud.update_session(db, request.chat_id, session_update_data)
        
        # 사용자 메시지 저장
        user_message_data = MessageCreate(
            role="user",
            content=request.message
        )
        db_user_message = message_crud.create_message(db, user_message_data, request.chat_id)
        
        # 어시스턴트 메시지 초기 생성 (빈 내용으로)
        assistant_message_data = MessageCreate(
            role="assistant", 
            content=""
        )
        db_assistant_message = message_crud.create_message(db, assistant_message_data, request.chat_id)
        
        # 대화 기록 가져오기
        conversation_history = message_crud.get_conversation_history(db, request.chat_id, include_system=False)
        
        # DeepAuto API 요청 준비
        messages = []
        for msg in conversation_history:
            if msg.content.strip():  # 빈 내용 제외
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        payload = {
            "model": "deepauto/qwq-32b",
            "messages": messages,
            "stream": True,
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        headers = {
            "Authorization": f"Bearer {settings.DEEPAUTO_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # DeepAuto API URL 구성 (v1 경로 확인)
        base_url = settings.DEEPAUTO_BASE_URL
        if not base_url.endswith('/v1'):
            base_url = base_url.rstrip('/') + '/v1'
        api_url = f"{base_url}/chat/completions"
        
        start_time = time.time()
        full_response = ""
        
        async def stream_response():
            nonlocal full_response
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST", 
                    api_url,
                    json=payload, 
                    headers=headers
                ) as response:
                    if response.status_code != 200:
                        error_msg = f"Server error '{response.status_code} {response.reason_phrase}' for url '{api_url}'"
                        yield f"data: {json.dumps({'error': error_msg})}\n\n"
                        return
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            chunk_data = line[6:]  # "data: " 제거
                            if chunk_data.strip() == "[DONE]":
                                yield f"data: [DONE]\n\n"
                                break
                            
                            try:
                                chunk_json = json.loads(chunk_data)
                                if "choices" in chunk_json and len(chunk_json["choices"]) > 0:
                                    delta = chunk_json["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        content = delta["content"]
                                        if content is not None:
                                            full_response += content
                                        
                                        # 응답 데이터 구성
                                        response_data = {
                                            "id": chunk_json.get("id"),
                                            "object": chunk_json.get("object"),
                                            "created": chunk_json.get("created"),
                                            "model": chunk_json.get("model"),
                                            "choices": [{
                                                "index": 0,
                                                "delta": {"content": content},
                                                "finish_reason": chunk_json["choices"][0].get("finish_reason")
                                            }]
                                        }
                                        yield f"data: {json.dumps(response_data)}\n\n"
                            except json.JSONDecodeError:
                                continue
            
            # 완료 후 데이터베이스 업데이트
            if full_response:
                message_crud.update_message_content(
                    db, 
                    message_id=db_assistant_message.id, 
                    content=full_response
                )
                
                processing_time = int((time.time() - start_time) * 1000)
                tokens_used = len(full_response.split()) * 1.3
                message_crud.update_message_metadata(
                    db,
                    message_id=db_assistant_message.id,
                    tokens_used=int(tokens_used),
                    processing_time=processing_time
                )
        
        return StreamingResponse(
            stream_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/plain; charset=utf-8"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
