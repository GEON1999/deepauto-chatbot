from typing import Dict, List, Optional, Union
from pydantic import BaseModel


class DeepAutoMessage(BaseModel):
    """DeepAuto 채팅 메시지 모델"""
    role: str
    content: str
    name: Optional[str] = None


class DeepAutoChatCompletionRequest(BaseModel):
    """DeepAuto 채팅 완성 요청 모델"""
    model: str
    messages: List[DeepAutoMessage]
    stream: bool = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    n: Optional[int] = None
    presence_penalty: Optional[float] = None
    frequency_penalty: Optional[float] = None
    stop: Optional[Union[str, List[str]]] = None
    user: Optional[str] = None


class DeepAutoChoice(BaseModel):
    """DeepAuto API 응답의 선택지 모델"""
    finish_reason: Optional[str] = None
    index: int
    message: Dict
    

class DeepAutoUsage(BaseModel):
    """DeepAuto API 토큰 사용량 모델"""
    completion_tokens: int
    prompt_tokens: int
    total_tokens: int
    completion_tokens_details: Optional[Dict] = None
    prompt_tokens_details: Optional[Dict] = None


class DeepAutoRouting(BaseModel):
    """DeepAuto API 라우팅 정보 모델"""
    selected_model: str
    grades: List[Dict]
