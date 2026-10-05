# Architecture — Spring Petclinic Angular (frontend)

## Executive Summary

Spring Petclinic 데모의 **Angular 프론트엔드**(v11.2.11, Angular 22 기반). 수의 클리닉 도메인(소유자·펫·방문·수의사·마스터 데이터)의 CRUD 화면을 제공하며, 데이터 접근은 전적으로 외부 REST 백엔드(spring-petclinic-rest)에 위임하는 **클라이언트 전용 SPA**이다. 인증 상태, 로컬 영속성, 서버 로직이 전혀 없다.

## Technology Stack

| 카테고리 | 기술 | 버전 | 근거 |
|----------|------|------|------|
| 프레임워크 | Angular | 22.1.0 | package.json (core/common/router/forms/animations) |
| 언어 | TypeScript | 6.0.3 | devDependencies |
| 반응형 | RxJS | ^7.8.2 | Observable 기반 서비스 계약 |
| UI 라이브러리 | Angular Material (+ moment adapter) | 22.1.0 | indigo-pink prebuilt theme import |
| CSS | Bootstrap / Bootstrap Icons | ^5.3.8 / ^1.13.1 | angular.json styles/scripts 번들 |
| 날짜 | moment | ^2.31.0 | Material Moment Adapter와 함께 사용 |
| 빌드 | @angular/build (Angular CLI 22) | 22.1.0 | angular.json |
| 단위원 | Vitest (jsdom) | ^4.1.11 | package.json test 스크립트 |
| E2E | Playwright | ^1.61.1 | playwright.config.ts |
| 린트 | Angular ESLint (flat config) | 22.0.0 | eslint.config.js |
| 런타임 | Node.js | 24.x (engines, .nvmrc) | package.json |
| 패키징 | Docker (node build → nginx 8080) | nginx 1.17.6 / node 24-alpine | Dockerfile |

## Architecture Pattern

**NgModule 기반 Feature-Module 레이어링** (modular monolith SPA):

```
┌─────────────────────────────────────────────────┐
│ AppComponent (app-root 셸: 내비게이션/라우트 아웃렛) │
├─────────────────────────────────────────────────┤
│ Feature Modules (7)                              │
│  owners │ pets │ visits │ pettypes │ vets │      │
│  specialties │ parts(welcome, 404)               │
│  각 모듈 = 화면 컴포넌트 + 라우팅(forChild) +      │
│            Resolve(VetResolver, SpecResolver)     │
├─────────────────────────────────────────────────┤
│ Service Layer (@Injectable, 6개)                 │
│  Owner/Pet/Visit/PetType/Vet/SpecialtyService    │
│  + HttpErrorHandler/HandleError (공통 에러 파이프)  │
├─────────────────────────────────────────────────┤
│ HttpClient (HTTPModule)                           │
└──────────────────────┬──────────────────────────┘
                       ▼ REST/JSON
        spring-petclinic-rest :9966 /petclinic/api/
```

- 상태 관리: **전역 스토어 없음** (NgRx/Signals store 등 미사용). 서비스 호출 → 컴포넌트 로컬 필드 → 템플릿 바인딩의 단순 흐름.
- 라우팅: 루트 `AppRoutingModule`(welcome/404) + 기능별 `forChild` 라우트. 편집 화면 진입 전 Resolver로 엔티티 선로드 (vets, specialties).
- 에러: 서비스마다 `createHandleError` 생성, `catchError`로 기본값 방출 → 화면이 죽지 않는 견고성 우선 설계.

## Data Architecture

DB 없음. 클라이언트 모델 6종(Owner, Pet, PetType, Visit, Vet, Specialty)이 REST JSON 응답의 거울. 상세: [data-models-web.md](./data-models-web.md)

## API Design

6개 리소스군·30개 호출 지점. 하위 리소스 네스팅(POST /owners/{id}/pets 등) 포함. 상세: [api-contracts-web.md](./api-contracts-web.md)

## Component Overview

22개 컴포넌트 (AppComponent + 21 기능 화면). 목록/추가/수정/상세 패턴의 반복. 상세: [component-inventory-web.md](./component-inventory-web.md)

## Source Tree

주석 트리: [source-tree-analysis.md](./source-tree-analysis.md)

## Development Workflow

`npm ci` → `npm start`(:4200) / `npm run build` / `npm test`(Vitest) / `npm run lint` / `npm run e2e`(Playwright). 백엔드(:9966) 선행 기동 필요. 상세: [development-guide-web.md](./development-guide-web.md)

## Deployment Architecture

- **Docker multi-stage**: node 24-alpine에서 `npm ci && ng build --configuration production` → nginx 1.17.6 이미지로 `dist/` 정적 서빙, 포트 8080, 비root `nginx` 사용자, healthcheck 내장.
- **수동 웹서버 배포**: README에 Nginx(alias + try_files SPA 리라이트), Apache(.htaccess Rewrite) 절차 문서화. `--base-href=/petclinic/` 빌드 전제.
- **CI**: GitHub Actions `angular-ci.yml` — push/PR(master) 시 npm ci → production build → lint → test:ci → Playwright E2E (Node 24 매트릭스).
- 상세: [deployment-guide.md](./deployment-guide.md)

## Testing Strategy

| 계층 | 도구 | 위치/패턴 | 비고 |
|------|------|-----------|------|
| 단위 | Vitest + jsdom | `*.spec.ts` 28개 (서비스·컴포넌트) | `src/app/testing/` 스텁 활용; `test:ci` 단일 실행, `test:coverage` LCOV |
| E2E | Playwright (chromium) | `e2e/*.e2e-spec.ts` | dev 서버 자동 기동(127.0.0.1:4200), trace on-first-retry |
| CI 게이트 | GitHub Actions | build → lint → test → e2e 순차 | 전 단계 실패 시 PR 차단 |

## 아키텍처상 주목점 (quick 스캔 관찰)

1. **environment.prod.ts도 localhost:9966 하드코딩** — 프로덕션 배포 시 API 주소 재빌드 또는 리버스 프록시 필요.
2. **인증/인가 부재** — 프론트는 무방비, 전적으로 백엔드/게이트웨이 의존.
3. **specialties 라우트의 add/detail 경로 주석 처리** — 화면 코드는 존재하나 라우팅 비활성 상태.
4. **Angular Material + Bootstrap 동시 로드** — 테마 간섭 가능성(현행은 Material prebuilt + Bootstrap CSS 병용).
