@echo off
echo Notion MCP 서버를 시작합니다...

REM 환경 변수 확인
if not exist .env (
    echo 오류: .env 파일이 없습니다. env.example을 복사하여 설정하세요.
    pause
    exit /b 1
)

REM 의존성 설치 (필요한 경우)
if not exist node_modules (
    echo 의존성을 설치합니다...
    npm install
)

REM TypeScript 빌드
echo TypeScript를 빌드합니다...
npm run build

REM 서버 시작
echo MCP 서버를 시작합니다...
npm start

