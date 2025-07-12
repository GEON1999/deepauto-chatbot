import os
import sys
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 경로 추가 (상대 경로로 app 모듈을 import 하기 위함)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, create_engine

def main():
    # 환경 변수에서 데이터베이스 연결 정보 가져오기
    mysql_user = os.getenv("MYSQL_USER")
    mysql_password = os.getenv("MYSQL_PASSWORD")
    mysql_server = os.getenv("MYSQL_SERVER")
    mysql_port = os.getenv("MYSQL_PORT")
    mysql_db = os.getenv("MYSQL_DB")
    
    connection_string = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_server}:{mysql_port}/{mysql_db}"
    
    try:
        engine = create_engine(connection_string, pool_pre_ping=True)
        
        # 연결 테스트
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            print("데이터베이스 연결 성공")
            
            # 현재 데이터베이스 이름 확인
            db_name = conn.execute(text("SELECT DATABASE()")).scalar()
            print(f" 현재 사용 중인 데이터베이스: {db_name}")
            
            # 테이블 목록 확인
            tables = conn.execute(text("SHOW TABLES")).fetchall()
            if tables:
                print(" 데이터베이스의 테이블 목록:")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print(" 데이터베이스에 테이블이 없습니다.")
                
    except Exception as e:
        print(f" 데이터베이스 연결 실패: {e}")

if __name__ == "__main__":
    main()