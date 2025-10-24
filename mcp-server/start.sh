#!/bin/bash

# MCP 서버 시작 스크립트

echo "Notion MCP 서버를 시작합니다..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "오류: .env 파일이 없습니다. env.example을 복사하여 설정하세요."
    exit 1
fi

# 의존성 설치 (필요한 경우)
if [ ! -d "node_modules" ]; then
    echo "의존성을 설치합니다..."
    npm install
fi

# TypeScript 빌드
echo "TypeScript를 빌드합니다..."
npm run build

# 서버 시작
echo "MCP 서버를 시작합니다..."
npm start

