# Development Guide — Spring Petclinic Angular (frontend)

## 사전 요구 사항

| 항목 | 버전 | 근거 |
|------|------|------|
| Node.js | **24.x** (nvm 사용 권장) | package.json `engines`, `.nvmrc` |
| npm | Node 24 동봉 버전 | package-lock.json 존재 |
| 백엔드 | spring-petclinic-rest 기동 필요 (`:9966`) | README — 클라이언트 전용 앱 |

## 설치 및 실행

```bash
nvm use          # Node 24 전환
npm ci           # 잠금파일 기반 설치 (의존성 재해석 없이 재현 설치)

npm start        # ng serve → http://localhost:4200 (파일 변경 시 자동 리로드)
```

> API 호출이 실패하면 백엔드(`http://localhost:9966/petclinic/api/`) 기동 여부를 먼저 확인할 것. 에러는 `HttpErrorHandler`가 삼키고 기본값을 반환하므로 화면이 조용히 빈 상태로 보일 수 있다.

## 명령어 리퍼런스

| 명령 | 동작 |
|------|------|
| `npm start` | 개발 서버 (`ng serve`, :4200) |
| `npm run build` | 개발 빌드 → `dist/` |
| `npm run build -- --configuration production` | 프로덕션 빌드 |
| `npm test` | 단위 테스트 대화형 (Vitest + jsdom) |
| `npm run test:ci` | 단위 테스트 단일 실행 (--no-watch) |
| `npm run test:coverage` | 커버리지 리포트 생성 (`coverage/` 에 HTML/LCOV) |
| `npm run lint` | Angular ESLint (TS + 템플릿, flat config: `eslint.config.js`) |
| `npm run e2e` | Playwright E2E (dev 서버 자동 기동, chromium) |
| `npm run ng -- generate component <name>` | 스캐폴딩 (component|directive|pipe|service|class|module) |

E2E 최초 실행 전: `npx playwright install --with-deps`

## 환경 설정

- `src/environments/environment.ts` / `environment.prod.ts`
  - `REST_API_URL`: 백엔드 베이스 URL (현행 두 파일 모두 `http://localhost:9966/petclinic/api/`)
  - 백엔드 주소/게이트웨이 변경 시 이 값 수정 후 재빌드.
- `angular.json`: 빌드 산출물(`dist/`), 전역 스타일(Bootstrap CSS + `src/styles.css`), 스크립트(bootstrap.bundle), 자산(`src/assets`).

## 프로젝트 구조 규칙 (코딩 컨벤션)

- **신규 기능은 기능 폴더 단위**: `src/app/{feature}/` 안에 `{entity}.ts`(모델) + `{entity}.service.ts`(REST) + `{feature}.module.ts` + `{feature}-routing.module.ts` + 화면 컴포넌트 디렉터리를 함께 둔다 (owners/pets 등 7개 도메인이 전부 동일 구조).
- 서비스는 `environment.REST_API_URL + '{resource}'`를 `entityUrl`로 두고, 모든 호출에 `catchError(this.handlerError(...))`를 붙인다 (`error.service.ts` 패턴 답습).
- 라우트는 기능 모듈에서 `RouterModule.forChild`, 루트는 `app-routing.module.ts`가 소유.
- 각 파일에 `.spec.ts` 단위 테스트 동반 (현행 28개).

## 테스트 접근

- **단위**: Vitest(jsdom) — 서비스는 HttpClient 목, 컴포넌트는 `src/app/testing/router-stubs.ts`·`dummy.component.ts`로 라우터 의존 격리.
- **E2E**: Playwright — `playwright.config.ts`가 `npm start`를 webServer로 자동 기동(127.0.0.1:4200), CI에서는 새 서버 사용.

## 문서再生성 (compodoc)

```bash
npx @compodoc/compodoc@2.0.0 -p tsconfig.doc.json -d docs
```
→ `docs/`는 생성 산출물 (수동 편집 금지).
