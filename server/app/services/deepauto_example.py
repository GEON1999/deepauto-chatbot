import asyncio
import logging

from .deepauto_client import DeepAutoClient

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_api_connection():
    """DeepAuto.ai API 연결 테스트 예제"""
    client = DeepAutoClient()
    
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "What are some highly rated restaurants in San Francisco?"
        }
    ]
    
    try:
        # API 요청 수행
        response = await client.create_chat_completion(
            model="openai/gpt-4o-mini-2024-07-18,deepauto/qwq-32b", 
            messages=messages,
            max_tokens=50
        )
        
        # 응답 결과 출력
        logger.info("API 요청 성공")
        
        # 모델 응답 추출
        if "choices" in response and len(response["choices"]) > 0:
            content = response["choices"][0]["message"].get("content", "")
            logger.info(f"응답 내용: {content}")
        
        # 라우팅 정보 추출
        routing_info = client.extract_routing_info(response)
        logger.info(f"라우팅 정보: {routing_info}")
        
        return True
    except Exception as e:
        logger.error(f"API 요청 오류: {e}")
        return False


async def main():
    """테스트 실행"""
    logger.info("DeepAuto.ai API 연결 테스트 중...")
    success = await test_api_connection()
    
    if success:
        logger.info("연결 테스트 성공")
    else:
        logger.error("연결 테스트 실패")


if __name__ == "__main__":
    asyncio.run(main())
