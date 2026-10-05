# Source Tree Analysis — Spring Petclinic Angular

프로젝트 루트: `C:\data\workspaces\spring-petclinic-angular`
저장소 유형: **monolith** (단일 Angular SPA, 1 part: `web`)

## 주석 디렉터리 트리

```
spring-petclinic-angular/
├── src/                          # 애플리케이션 소스
│   ├── main.ts                   # ★ 엔트리 포인트 — Angular 부스트스트랩 (platformBrowserDynamic → AppModule)
│   ├── index.html                # SPA 호스트 HTML (<app-root>)
│   ├── polyfills.ts              # 폴리필 (core-js/zone.js 관련)
│   ├── styles.css                # 전역 스타일 — petclinic.css + Material indigo-pink 테마 import
│   ├── environments/             # 환경 설정
│   │   ├── environment.ts        # REST_API_URL = http://localhost:9966/petclinic/api/
│   │   └── environment.prod.ts   # 프로덕션 (현행: dev와 동일 URL 하드코딩)
│   ├── assets/                   # 정적 자산
│   │   ├── css/                  # petclinic.css (커스텀 테마)
│   │   ├── fonts/                # 폰트
│   │   └── images/               # 이미지
│   └── app/                      # ★ 핵심: Angular 앱 (NgModule 기반)
│       ├── app.module.ts         # 루트 모듈 — 7개 기능 모듈 + HttpClientModule/FormsModule import
│       ├── app-routing.module.ts # 라우트: ''/welcome → Welcome, '**' → PageNotFound
│       ├── app.component.*       # 앱 셸 (selector: app-root, 내비게이션 레이아웃)
│       ├── error.service.ts      # ★ 공통 인프라: HttpErrorHandler / HandleError (전역 에러 파이프)
│       ├── owners/               # [기능] 소유자 관리
│       │   ├── owner.ts          # 모델: Owner
│       │   ├── owner.service.ts  # REST 클라이언트: /owners (CRUD + search)
│       │   ├── owners.module.ts / owners-routing.module.ts
│       │   ├── owner-list/       # 목록+검색 (GET /owners, ?lastName=)
│       │   ├── owner-add/        # 등록 (POST /owners)
│       │   ├── owner-detail/     # 상세 (GET /owners/{id}, 펫/방문 표시·추가 진입점)
│       │   └── owner-edit/       # 수정 (PUT /owners/{id})
│       ├── pets/                 # [기능] 펫 관리
│       │   ├── pet.ts / pet.service.ts (/pets, POST는 /owners/{id}/pets)
│       │   ├── pet-list/ pet-add/ pet-edit/
│       ├── visits/               # [기능] 방문 관리
│       │   ├── visit.ts / visit.service.ts (/visits, POST는 /owners/{oid}/pets/{pid}/visits)
│       │   ├── visit-list/ visit-add/ visit-edit/
│       ├── pettypes/             # [기능] 펫 종류 마스터
│       │   ├── pettype.ts / pettype.service.ts (/pettypes CRUD)
│       │   ├── pettype-list/ pettype-add/ pettype-edit/
│       ├── vets/                 # [기능] 수의사 관리
│       │   ├── vet.ts / vet.service.ts (/vets CRUD)
│       │   ├── vet-resolver.ts   # 라우트 Resolve: vets/:id/edit 진입 전 Vet 로드
│       │   ├── vet-list/ vet-add/ vet-edit/
│       ├── specialties/          # [기능] 전문 분야 마스터
│       │   ├── specialty.ts / specialty.service.ts (/specialties CRUD)
│       │   ├── spec-resolver.ts  # 라우트 Resolve: 편집 화면 진입 전 Specialty 목록 로드
│       │   ├── specialty-list/ specialty-add/ specialty-edit/
│       ├── parts/                # [공통] 정적 페이지
│       │   ├── welcome/          # 홈 (WelcomeComponent)
│       │   └── page-not-found/   # 404 (와일드카드 라우트)
│       └── testing/              # [공통] 테스트 헬퍼
│           ├── dummy.component.ts
│           └── router-stubs.ts   # 라우터 스텁 (단위 테스트용)
├── e2e/                          # Playwright E2E (app.e2e-spec.ts)
├── docs/                         # compodoc 생성 산출물 (수동 편집 금지)
├── .github/workflows/angular-ci.yml  # CI: build → lint → test:ci → e2e (Node 24)
├── angular.json                  # Angular CLI 빌드 설정 (outputPath: dist, Bootstrap 스타일/스크립트 번들 포함)
├── package.json                  # 스크립트/의존성 (ng, build, test, lint, e2e)
├── eslint.config.js              # Angular ESLint (flat config)
├── tsconfig.json / tsconfig.doc.json
├── playwright.config.ts          # E2E: chromium, dev 서버 자동 기동(4200)
├── Dockerfile                    # multi-stage: node 24 build → nginx 8080 서빙
└── README.md                     # 설치/개발/배포 가이드
```

## 핵심 디렉터리 요약

| 경로 | 역할 |
|------|------|
| `src/app/{feature}/` | **기능 모듈 7개** (owners, pets, visits, pettypes, vets, specialties, parts). 각 폴더 = 모델 + 서비스 + 라우팅 + 화면 컴포넌트 묶음 (feature-module 패턴) |
| `src/app/error.service.ts` | 전역 HTTP 에러 처리 인프라 — 모든 서비스가 의존 |
| `src/environments/` | API Base URL 주입 지점 (백엔드 주소 변경 시 여기 수정) |
| `src/app/testing/` | 단위 테스트 공용 스텁 |
| `e2e/` | Playwright 시나리오 |

## 엔트리 포인트 체인

`index.html` → `src/main.ts` → `AppModule` (`app.module.ts`) → `AppComponent`(app-root 셸) → `AppRoutingModule` → 기능 모듈 라우트

## 통합 지점 (외부)

- `src/environments/environment*.ts` 의 `REST_API_URL` → **spring-petclinic-rest** 백엔드 (`http://localhost:9966/petclinic/api/`) — 유일한 외부 경계.
