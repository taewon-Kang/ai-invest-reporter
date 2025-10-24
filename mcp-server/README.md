# Notion MCP Server

AI 투자 리포터 프로젝트를 위한 Notion MCP (Model Context Protocol) 서버입니다.

## 기능

- **리포트 자동 저장**: LLM이 생성한 투자 리포트를 Notion 데이터베이스에 자동 저장
- **이전 리포트 비교**: LLM을 통해 이전 리포트와 비교하여 변경사항 분석
- **증분 업데이트**: 새로운 정보만 추가로 저장하여 효율적인 리포트 관리

## 설치 및 설정

### 1. 의존성 설치

```bash
cd mcp-server
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 `.env`로 복사하고 필요한 값들을 설정하세요:

```bash
cp env.example .env
```

`.env` 파일에 다음 값들을 설정하세요:

```env
# Notion API 설정
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# OpenAI API 설정 (리포트 비교용)
OPENAI_API_KEY=your_openai_api_key

# MCP 서버 설정
MCP_SERVER_PORT=3001
```

### 3. Notion 데이터베이스 설정

Notion에서 다음 속성들을 가진 데이터베이스를 생성하세요:

- **Symbol** (Title): 투자 심볼
- **Timeframe** (Rich Text): 분석 기간
- **Content** (Rich Text): 리포트 내용
- **Created At** (Created Time): 생성 시간
- **Previous Report** (Relation): 이전 리포트와의 관계

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

## 사용 가능한 도구

### 1. save_report

기본 리포트 저장

```json
{
  "name": "save_report",
  "arguments": {
    "symbol": "BTCUSDT",
    "timeframe": "1d",
    "content": "리포트 내용..."
  }
}
```

### 2. compare_and_save_report

이전 리포트와 비교하여 저장

```json
{
  "name": "compare_and_save_report",
  "arguments": {
    "symbol": "BTCUSDT",
    "timeframe": "1d",
    "content": "새로운 리포트 내용..."
  }
}
```

### 3. get_previous_report

이전 리포트 조회

```json
{
  "name": "get_previous_report",
  "arguments": {
    "symbol": "BTCUSDT",
    "timeframe": "1d"
  }
}
```

## Next.js 프로젝트와 통합

기존 Next.js 프로젝트의 `/api/notion-save` 엔드포인트를 통해 MCP 서버와 통신할 수 있습니다.

환경 변수에 `AUTO_SAVE_TO_NOTION=true`를 설정하면 리포트 생성 시 자동으로 Notion에 저장됩니다.

## 문제 해결

### 일반적인 오류

1. **Notion API 키 오류**: Notion 통합 토큰이 올바른지 확인
2. **데이터베이스 ID 오류**: Notion 데이터베이스 ID가 올바른지 확인
3. **권한 오류**: Notion 통합이 데이터베이스에 접근 권한이 있는지 확인

### 로그 확인

서버 실행 시 콘솔에서 상세한 로그를 확인할 수 있습니다.

