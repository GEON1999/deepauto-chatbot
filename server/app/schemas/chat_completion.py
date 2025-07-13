from pydantic import BaseModel
from typing import Optional, List

class ChatCompletionRequest(BaseModel):
    """
    채팅 완성 요청 스키마
    """
    chat_id: int
    message: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
