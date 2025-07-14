# DeepAuto Chatbot

실시간 스트리밍 기반 AI 채팅 시스템

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Next.js App  │ ◄──────────────────► │  FastAPI Server │
│   (Frontend)    │                      │   (Backend)     │
└─────────────────┘                      └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │   MySQL DB      │
                                         │                 │
                                         └─────────────────┘
```

### Technology Stack

#### Backend (`/server`)

- **FastAPI**: Python 웹 프레임워크
- **SQLAlchemy**: ORM (Object-Relational Mapping)
- **MySQL**: 관계형 데이터베이스
- **Uvicorn**: ASGI 서버
- **Python 3.10/3.11**: 권장 Python 버전

#### Frontend (`/nextjs`)

- **Next.js 15**: React 기반 풀스택 프레임워크
- **React 19**: 사용자 인터페이스 라이브러리
- **TypeScript**: 정적 타입 검사
- **Tailwind CSS 4**: 유틸리티 우선 CSS 프레임워크
- **Server-Sent Events (SSE)**: 실시간 스트리밍

## 🗄️ Database Design

### 주요 테이블 구조

#### Sessions 테이블

- 채팅 세션 관리
- 세션별 메타데이터 저장
- 사용자별 채팅 히스토리 분리

#### Messages 테이블

- 개별 메시지 저장
- 사용자/AI 메시지 구분
- 세션과의 외래키 관계
- 타임스탬프 및 메시지 내용

#### 관계 설계

```sql
Sessions (1) ──── (N) Messages
```

## 🚀 Getting Started

### 환경 설정

#### 1. 환경 변수 설정

- `.env` 파일이 이메일에 별도 첨부되어 있습니다
- **중요**: `.env` 파일을 `/server` 폴더의 루트 경로에 포함해야 합니다
- 데이터베이스 연결 정보 및 API 키가 포함되어 있습니다

#### 2. 전체 프로젝트 클론

```bash
git clone <repository-url>
cd deepauto
```

### Backend Setup (`/server`)

#### 1. Python 환경 준비

- **권장 Python 버전**: 3.10 또는 3.11
- **주의**: Python 3.13은 일부 패키지와 호환되지 않습니다

```bash
# Python 버전 확인
python --version
# 또는
python3 --version
```

#### 2. 가상환경 생성 및 활성화

```bash
cd server

# 가상환경 생성
python -m venv venv
# 또는 python3 -m venv venv

# 가상환경 활성화
# Linux/Mac:
source venv/bin/activate

# Windows:
.\venv\Scripts\activate
```

#### 3. 의존성 설치

```bash
# requirements.txt를 통한 패키지 설치
pip install -r requirements.txt

# 설치 확인
pip list
```

#### 4. 서버 실행

```bash
# 개발 서버 실행 (기본 포트: 8000)
uvicorn main:app --reload
```

#### 5. API 서버 확인

- 브라우저에서 `http://127.0.0.1:8000/docs` 접속
- FastAPI 자동 생성 API 문서 확인

### Frontend Setup (`/nextjs`)

#### 1. Node.js 환경 준비

- **권장 Node.js 버전**: 18.x 이상
- npm 또는 yarn 패키지 매니저 필요

```bash
# Node.js 버전 확인
node --version
npm --version
```

#### 2. 의존성 설치

```bash
cd nextjs

# npm을 사용하는 경우
npm install

# 또는 yarn을 사용하는 경우
yarn install
```

#### 3. 개발 서버 실행

```bash
# Next.js 개발 서버 실행 (Turbopack 사용)
npm run dev
# 또는
yarn dev

# 기본 포트: 3000
```

#### 4. 프로덕션 빌드

```bash
# 개발계 실행
npm run dev
# 또는
yarn dev
```

## 🔧 Development Workflow

### 1. 전체 시스템 실행 순서

```bash
# 1. Backend 서버 실행 (터미널 1)
cd server
source venv/bin/activate  # 가상환경 활성화
uvicorn main:app --reload

# 2. Frontend 서버 실행 (터미널 2)
cd nextjs
npm run dev
```

### 2. 접속 URL

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API 문서**: `http://localhost:8000/docs`

## 📁 Project Structure

```
deepauto/
├── nextjs/                 # Frontend (Next.js)
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── services/       # API 서비스 레이어
│   │   └── app/           # Next.js App Router
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                 # Backend (FastAPI)
│   ├── main.py            # FastAPI 애플리케이션 진입점
│   ├── requirements.txt   # Python 의존성
│   ├── .env              # 환경 변수 (별도 첨부)
│   └── alembic/          # 데이터베이스 마이그레이션
│
└── README.md             # 프로젝트 문서
```

## 🌟 Key Features

### ✅ 실시간 채팅

- Server-Sent Events (SSE) 기반 실시간 메시지 스트리밍
- 타이핑 효과와 함께 AI 응답 실시간 표시

### ✅ 세션 관리

- 다중 채팅 세션 지원
- 세션별 대화 히스토리 보존
- 세션 생성/삭제/전환 기능

### ✅ 반응형 UI

- 모바일/데스크톱 환경 모두 지원
- Tailwind CSS 기반 현대적 디자인
- 직관적인 사용자 인터페이스

### ✅ 안정성

- TypeScript 기반 타입 안전성
- 에러 처리 및 복구 로직
- 네트워크 연결 끊김 대응
