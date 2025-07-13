import os
import json
import time
import logging
import asyncio
from typing import Dict, List, Optional, Any, AsyncGenerator, Union
import httpx
from dotenv import load_dotenv

# 데이터 모델 임포트
from app.schemas.deepauto import (
    DeepAutoMessage,
    DeepAutoChatCompletionRequest,
)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 환경 변수 로드
load_dotenv()

# API 설정
DEEPAUTO_API_KEY = os.getenv("DEEPAUTO_API_KEY")
# DeepAuto.ai OpenAI 호환 API 기본 URL
DEEPAUTO_BASE_URL = "https://api.deepauto.ai/openai/v1"


class DeepAutoClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 60.0,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ):
        self.api_key = api_key or DEEPAUTO_API_KEY
        if not self.api_key:
            raise ValueError("API key must be provided or set as environment variable DEEPAUTO_API_KEY")

        self.base_url = base_url or DEEPAUTO_BASE_URL
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    async def _create_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            timeout=self.timeout,
        )

    async def _make_request(
        self, endpoint: str, payload: Dict[str, Any], stream: bool = False
    ) -> httpx.Response:
        url = f"{self.base_url}/{endpoint}"
        
        retries = 0
        while retries <= self.max_retries:
            try:
                async with await self._create_client() as client:
                    if stream:
                        return await client.stream("POST", url, json=payload)
                    else:
                        response = await client.post(url, json=payload)
                    
                    if response.status_code == 200:
                        return response
                    elif response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", self.retry_delay))
                        logger.warning(f"Rate limit hit. Retrying after {retry_after} seconds.")
                        await asyncio.sleep(retry_after)
                    else:
                        response.raise_for_status()
                        
            except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                retries += 1
                if retries > self.max_retries:
                    logger.error(f"Failed after {self.max_retries} retries: {exc}")
                    raise
                    
                logger.warning(f"Request failed (attempt {retries}/{self.max_retries}): {exc}")
                await asyncio.sleep(self.retry_delay * (2 ** (retries - 1)))  # Exponential backoff
        
        raise httpx.RequestError(f"Failed to complete request after {self.max_retries} retries")

    async def create_chat_completion(
        self, 
        model: str,
        messages: List[Dict[str, str]],
        stream: bool = False,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
        n: Optional[int] = None,
        presence_penalty: Optional[float] = None,
        frequency_penalty: Optional[float] = None,
        stop: Optional[Union[str, List[str]]] = None,
        user: Optional[str] = None,
    ) -> Union[Dict[str, Any], AsyncGenerator[Dict[str, Any], None]]:
        # 공통 페이로드 구성
        payload = self._build_chat_completion_payload(
            model=model,
            messages=messages,
            stream=stream,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=top_p,
            n=n,
            presence_penalty=presence_penalty,
            frequency_penalty=frequency_penalty,
            stop=stop,
            user=user
        )
        
        if stream:
            # 스트리밍 모드일 때 스트리밍 함수로 전달
            return self.create_chat_completion_stream(payload=payload)
        else:
            # 일반 응답 모드
            response = await self._make_request(endpoint="chat/completions", payload=payload)
            return response.json()
    
    def _build_chat_completion_payload(
        self,
        model: str,
        messages: List[Dict[str, str]],
        stream: bool = False,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
        n: Optional[int] = None,
        presence_penalty: Optional[float] = None,
        frequency_penalty: Optional[float] = None,
        stop: Optional[Union[str, List[str]]] = None,
        user: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        페이로드 구성 함수
        """
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
        }

        # 선택적 파라미터 추가
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if top_p is not None:
            payload["top_p"] = top_p
        if n is not None:
            payload["n"] = n
        if presence_penalty is not None:
            payload["presence_penalty"] = presence_penalty
        if frequency_penalty is not None:
            payload["frequency_penalty"] = frequency_penalty
        if stop is not None:
            payload["stop"] = stop
        if user is not None:
            payload["user"] = user
            
        return payload
        
    async def create_chat_completion_stream(
        self, payload: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        스트리밍 모드의 채팅 완성 요청 처리
        """
        async for chunk in self._process_stream_response(endpoint="chat/completions", payload=payload):
            yield chunk

    async def _process_stream_response(
        self, endpoint: str, payload: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        try:
            # 스트리밍 요청 처리
            response = await self._make_request(endpoint=endpoint, payload=payload, stream=True)
            
            # 응답 스트림 처리
            async for chunk in response.aiter_text():
                if not chunk.strip():
                    continue
                    
                # SSE 형식 처리 ('data: ' 접두사)
                for line in chunk.split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                        
                    if line.startswith("data: "):
                        line = line[6:]  # 'data: ' 접두사 제거
                        
                    if line == "[DONE]":
                        return
                        
                    try:
                        yield json.loads(line)
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON 파싱 오류: {e}, 데이터: {line}")
        except Exception as e:
            logger.error(f"스트리밍 응답 처리 오류: {e}")
            raise

    def extract_routing_info(self, response: Dict[str, Any]) -> Dict[str, Any]:
        routing_info = {}
        
        if "routing" in response:
            routing_info = response["routing"]
        elif "usage" in response:
            routing_info = {"usage": response["usage"]}
        
        return routing_info
