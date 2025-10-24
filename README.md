# AI 투자 리포트 생성기

Next.js(App Router) + TypeScript 기반의 차트/LLM 투자 리포트 웹 앱. Notion MCP 서버를 통한 자동 리포트 저장 및 비교 기능을 포함합니다.

## 주요 기능

- **실시간 차트**: 바이낸스 API를 통한 암호화폐 가격 차트
- **AI 리포트 생성**: OpenAI GPT를 통한 투자 분석 리포트
- **Notion 자동 저장**: MCP 서버를 통한 리포트 자동 저장
- **리포트 비교**: 이전 리포트와의 차이점 분석 및 증분 업데이트

## 설치

### 1. 메인 프로젝트 설치

```bash
npm install
```

### 2. MCP 서버 설치

```bash
cd mcp-server
npm install
```

## 환경 변수 설정

### 메인 프로젝트 (`.env.local`)

```bash
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key

# 바이낸스 API 설정
BINANCE_BASE_URL=https://api.binance.com

# Notion 자동 저장 설정
AUTO_SAVE_TO_NOTION=true

# Next.js 기본 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Notion API 설정 (Notion 자동 저장을 위해 필요)
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
```

### MCP 서버 (선택사항)

MCP 서버는 이제 선택사항입니다. 기본적으로 Next.js API에서 직접 Notion과 통신합니다.

## 실행 방법

### Next.js 개발 서버 시작

```bash
npm run dev
```

이제 별도의 MCP 서버 없이도 Notion 자동 저장이 작동합니다!

## Notion 데이터베이스 설정

Notion에서 다음 속성들을 가진 데이터베이스를 생성하세요:

- **Symbol** (Title): 투자 심볼
- **Timeframe** (Rich Text): 분석 기간
- **Content** (Rich Text): 리포트 내용
- **Created At** (Created Time): 생성 시간
- **Previous Report** (Relation): 이전 리포트와의 관계

## API 엔드포인트

- `GET /api/klines?symbol=BTCUSDT&interval=1h` - 차트 데이터 조회
- `POST /api/report` - AI 리포트 생성
- `POST /api/notion-save` - Notion에 리포트 저장

## 배포

Vercel을 사용해 배포합니다. MCP 서버는 별도로 배포하거나 로컬에서 실행해야 합니다.
