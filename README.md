# AI 투자 리포트 생성기

Next.js(App Router) + TypeScript 기반의 차트/LLM 투자 리포트 웹 앱.

## 설치

```bash
npm i
```

## 개발 서버

```bash
npm run dev
```

## 환경 변수

루트에 `.env.local` 생성:

```bash
OPENAI_API_KEY=YOUR_KEY
BINANCE_BASE_URL=https://api.binance.com
```

## 🤖 AI 자동 코드 리뷰 설정

이 프로젝트는 GitHub Actions와 OpenAI GPT-4를 사용하여 Pull Request에 자동으로 코드 리뷰를 수행합니다.

### 설정 방법

1. **OpenAI API 키 발급**

   - [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키를 발급받으세요
   - GPT-4 API 접근 권한이 필요합니다

2. **GitHub Secrets 설정**

   - GitHub 저장소의 Settings → Secrets and variables → Actions로 이동
   - "New repository secret" 클릭
   - Name: `OPENAI_API_KEY`
   - Value: 발급받은 OpenAI API 키 입력
   - "Add secret" 클릭

3. **워크플로우 활성화**
   - `.github/workflows/code-review.yml` 파일이 이미 생성되어 있습니다
   - PR을 생성하거나 업데이트할 때 자동으로 실행됩니다

### 기능

- **자동 트리거**: PR이 열리거나 업데이트될 때 자동 실행
- **스마트 분석**: 변경된 코드 파일만 분석
- **다양한 언어 지원**: TypeScript, JavaScript, Python, Java, C++, Go 등
- **포괄적 리뷰**: 코드 품질, 버그, 보안, 성능, 스타일 등 다각도 분석
- **한국어 리뷰**: 한국어로 상세한 피드백 제공

### 리뷰 항목

AI는 다음 관점에서 코드를 분석합니다:

1. **코드 품질 및 가독성**
2. **잠재적 버그나 문제점**
3. **보안 취약점**
4. **성능 최적화 기회**
5. **코드 스타일 및 컨벤션 준수**
6. **테스트 커버리지**
7. **개선 제안**

## 배포

Vercel을 사용해 배포한다.
