---
project_name: 'spring-petclinic-angular'
user_name: '82023013'
date: '2026-10-04'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'dont_miss_rules']
status: 'complete'
rule_count: 46
optimized_for_llm: true
---

# Project Context for AI Agents

_이 파일은 이 프로젝트에서 코드를 구현할 때 AI 에이전트가 반드시 따라야 할 핵심 규칙과 패턴을 담고 있습니다. 에이전트가 놓치기 쉬운 자명하지 않은 세부 사항에 집중합니다._

---

## Technology Stack & Versions

| 기술 | 버전 | 비고 |
|------|------|------|
| Angular | 22.1.0 | NgModule 기반 (standalone 아님), Angular CLI 로컬 의존 |
| TypeScript | 6.0.3 | `strict: false`, `strictTemplates: true` (angularCompilerOptions) |
| Node.js | 24.x | `.nvmrc` / `engines` 로 강제 |
| RxJS | ^7.8.2 | 모든 HTTP 호출은 Observable 기반 |
| Bootstrap | ^5.3.8 | CSS + bootstrap-icons (petclinic.css 경유) |
| Angular Material | 22.1.0 | Datepicker 전용 (indigo-pink 테마, MomentDateAdapter) |
| moment | ^2.31.0 | 날짜 포맷팅; `angular.json`의 `allowedCommonJsDependencies`에 등록됨 |

**개발 도구:**

- 단위 테스트: Vitest ^4.1.11 (jsdom) — `npm test` / `npm run test:ci` / `npm run test:coverage`
- E2E: Playwright ^1.61.1 — `e2e/*.e2e-spec.ts`, `npm run e2e` (dev server 자동 기동)
- 린트: Angular ESLint 22.0.0 flat config (`eslint.config.js`) — `npm run lint`
- 빌드: `@angular/build:application` (Vite 기반), 산출물 `dist/`

**버전/호환성 제약:**

- 이 프로젝트는 **client-only** — 백엔드 REST API(`http://localhost:9966/petclinic/api/`, spring-petclinic-rest)가 먼저 실행 중이어야 함
- `useDefineForClassFields: false` + `emitDecoratorMetadata: true` + `experimentalDecorators: true` — Angular 데코레이터 동작에 필수이므로 tsconfig에서 변경 금지
- `moduleResolution: "bundler"`, `module: "preserve"`, target ES2022
- Angular 22 API만 사용 (이전 버전 문법/라이프사이클 가정 금지)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **tsconfig `strict: false`를 의도적으로 유지** — `strictNullChecks`, `strictPropertyInitialization` 비활성. 새 코드를 strict 모음으로 "업그레이드"하지 말 것. 대신 템플릿 타입 안전성은 `strictTemplates`/`strictInputTypes`/`strictNullInputTypes`가 강제함 → 템플릿에서 타입 불일치 시 컴파일 실패하므로 모델 타입을 정확히 맞출 것.
- **엔티티는 `interface`** (class/DTO 금지) — 각 기능 폴더 루트에 위치 (예: `src/app/pets/pet.ts`). 빈 객체 초기화는 `this.pet = {} as Pet` 패턴.
- **날짜는 `string` 타입** — API 왕복 시 `moment(...).format('YYYY-MM-DD')`로 변환 (moment가 날짜 처리 표준, Date 직접 사용 금지).
- **비동기는 RxJS Observable 전용** — Promise/async-await 변환 금지. 서비스 메서드는 항상 `Observable<T>` 반환.
- **오류 처리는 중앙화** — 모든 HTTP 호출은 `.pipe(catchError(this.handlerError('methodName', 기본값)))` 필수 (`HttpErrorHandler.createHandleError` 사용, `src/app/error.service.ts`). 컴포넌트에는 `errorMessage: string` 속성 + `<div *ngIf="errorMessage" class="alert alert-danger">` 표시.
- **import 정렬 관례**: Angular → 서드파티(rxjs, moment) → 환경(`environment`) → 로컬 상대경로. `baseUrl: src` 설정으로 `src` 기준 절대 import도 가능하나 기존 파일은 상대경로 유지.

### Framework-Specific Rules (Angular 22)

- **NgModule 아키텍처 유지** — 새 컴포넌트는 `standalone: false`로 선언하고 기능 모듈의 `declarations`/`exports`에 추가. standalone 마이그레이션 금지 (`@angular-eslint/prefer-standalone: 'off'`).
- **DI는 생성자 주입** — `constructor(private http: HttpClient, ...)` 패턴. `inject()`는 `ChangeDetectorRef` 등 필드 초기화 용도로만 사용. 서비스는 기능 모듈의 `providers: [XxxService]`에 등록.
- **선택자 규칙 (ESLint 강제)**: 컴포넌트 `app-{feature}-{action}` (kebab-case, element), 디렉티브 `app` 접두 camelCase (attribute).
- **새 도메인 추가 시 기능 폴더 구조 필수**: `{feature}.module.ts` + `{feature}-routing.module.ts` (`RouterModule.forChild`) + `{entity}.ts` (interface) + `{entity}.service.ts` + `{entity}-list|add|edit/` 서브 폴더.
- **폼은 Template-driven 기본** — `#form="ngForm"` + `ngModel` + HTML5 검증자(`required/minlength/pattern`). Reactive Forms는 `vet-edit`에만 예외 존재. 새 폼은 template-driven을 따를 것.
- **검증 표시 패턴**: `[class.is-valid]`/`[class.is-invalid]` = `ctrl.dirty && ctrl.valid/invalid`, 에러 메시지는 `<div class="invalid-feedback" *ngIf="ctrl.dirty && ctrl.hasError('...')">`, 제출 버튼 `[disabled]="form.invalid"`, form에 `novalidate`.
- **구조문은 `*ngIf`/`*ngFor` 유지** — `@angular-eslint/template/prefer-control-flow: 'off'`이므로 `@if`/`@for` 강제 아님 (신규 코드도 기존 파일과 동일 스타일).
- **API URL**: 서비스 내부 `private entityUrl = environment.REST_API_URL + '{entity}'` 조합. URL 하드코딩 금지. CRUD 메서드명 `get* / get*ById / add* / update* / delete*` 일관.
- **라우트 진입 전 데이터 로딩이 필요한 경우 Resolver 사용** (`vet-resolver.ts` 패턴 + 라우트의 `resolve: {vet: VetResolver}` 옵션).
- **Datepicker**: `MatDatepickerModule` + `MatMomentDateModule` + `MY_DATE_FORMATS`/`MomentDateAdapter` 프로바이더 (pets.module에 등록되어 있음).
- **기능 간 컴포넌트 재사용**은 모듈 import로 수행 (예: `PetsModule`이 `VisitsModule`을 import해 `<app-visit-list>` 임베드).
- **변화 감지**: 비동기 완료 후 `finalize()` 안에서 `ChangeDetectorRef.markForCheck()` 호출 패턴 사용 (owner-detail 등).

### Testing Rules

- **단위 테스트 프레임워크는 Vitest + TestBed** (Jest 아님) — `vi.spyOn()`, `import type { Mock } from 'vitest'`. 실행: `npm test`(watch) / `npm run test:ci`(1회, jsdom).
- **테스트 파일은 소스와 동일 폴더 `*.spec.ts`** 공치 (예: `src/app/pets/pet.service.spec.ts`).
- **서비스 테스트**: `providers: [provideHttpClient(), provideHttpClientTesting(), XxxService, HttpErrorHandler]` + `HttpTestingController.expectOne(url)` → `req.flush(data)` → `afterEach(() => httpTestingController.verify())` 필수.
- **컴포넌트 테스트**: `declarations: [Component]` + `schemas: [CUSTOM_ELEMENTS_SCHEMA]` + 서비스는 로컬 Stub 클래스로 `{ provide: XxxService, useClass: XxxServiceStub }` 교체. 라우터 목은 `src/app/testing/router-stubs.ts`의 `RouterStub`/`ActivatedRouteStub`(`testParams` 세터)/`RouterLinkStubDirective` 재사용.
- **비동기 TestBed 설정은 `waitForAsync()`** 로 감쌈 (fakeAsync/flush 패턴 미사용).
- **Observable 목 반환은 `of(...)`** — 예: `vi.spyOn(service, 'deletePet').mockReturnValue(of(1))`.
- **E2E는 Playwright** — `e2e/*.e2e-spec.ts` 명명, `npm run e2e` (chromium 단일, dev server 자동 기동; 백엔드 9966은 수동 기동 필요).
- **커버리지**: `npm run test:coverage` → `coverage/` (html+lcov). 강제 커버리지 임계값 없음.

### Code Quality & Style Rules

- **ESLint flat config (`eslint.config.js`)** — `npm run lint`가 `src/**/*.ts` + `src/**/*.html` 검사. 새 코드는 린트 통과 필수.
- **따옴표: single quote** (template literal 허용) — 위반 시 ESLint error.
- **컴포넌트 파일 명명**: kebab-case (`pet-edit.component.ts/.html/.css`) + 동일 폴더 공치.
- **CSS**: 컴포넌트별 `.css` 파일. 전역 스타일은 `src/styles.css`가 `assets/css/petclinic.css`(Bootstrap 5)와 Material 테마(indigo-pink)를 import. SCSS/styled-components 미사용.
- **스캐폴딩**: 새 컴포넌트/서비스는 `npm run ng -- generate ...` 사용 (prefix `app`, style `css` 자동 적용 — angular.json schematics).
- **UI 텍스트는 하드코딩 영어** — i18n 프레임워크 미도입. 현지화는 별도 결정 사항.
- **`shared/` 모듈 없음** — 재사용은 `parts/` 모듈 또는 기능 모듈 간 import 방식으로. 새 공통 모듈 생성은 신중히.
- **의존성 업데이트는 dependabot 방식** — `Bump X from a to b` 스타일 커밋. `package-lock.json` 재생성 시 함께 커밋.

### Development Workflow Rules

- **환경 설정**: Node 24 (`nvm use`) → `npm ci`. dev server `npm start` → `http://localhost:4200` (백엔드 spring-petclinic-rest 9966 선행 기동 필요).
- **변경 후 검증 순서**: `npm run lint` → `npm run test:ci` → `npm run build`.
- **base href**: `src/index.html`에 `<base href="/petclinic">` — 자산/라우트 경로 작업 시 README의 `--base-href=/petclinic/ --deploy-url=/petclinic/` 배포 절차 참조.
- **프로덕션 빌드**: `npm run build -- --configuration production` (environment.prod.ts 교체, `anyComponentStyle` 6kb 예산 경고).
- **Docker**: 루트 `Dockerfile` 제공 — `docker build -t spring-petclinic-angular:latest .` → 8080 포트.
- **문서 생성**: compodoc — `npx @compodoc/compodoc@2.0.0 -p tsconfig.doc.json -d docs`. `docs/`, `dist/`, `coverage/`는 린트 ignore 대상.

### API 연동
- **API 계약 컨텍스트 참고**: .context/api-contracts/openapi.yaml

### Critical Don't-Miss Rules

**금지 사항 (안티패턴):**

- ❌ standalone 컴포넌트 / `bootstrapApplication` 도입 — NgModule 구조 깨짐
- ❌ `@if`/`@for` 제어 흐름 문법 신규 강제 — 기존 `*ngIf`/`*ngFor` 템플릿과 혼용되어 스타일 일관성 붕괴
- ❌ Promise/async-await로 HTTP 호출 래핑 — RxJS 파이프라인(`catchError` 중앙 처리) 우회됨
- ❌ `handlerError` 없이 그대로 `http.get()` 호출 — 에러가 콘솔에만 남고 컴포넌트 `errorMessage` 표시 패턴 깨짐
- ❌ API URL 하드코딩 — `environment.REST_API_URL` 접두 필수 (환경 교체 지점)
- ❌ 엔티티 interface를 class로 변경 — `{} as Entity` 초기화 패턴 전제 코드 다수 깨짐
- ❌ tsconfig strict 켜기 — 대규모 컴파일 에러 유발, 프로젝트 의도(`strict: false`)와 충돌

**엣지 케이스:**

- ⚠️ `pets/:id` 아래 자식 라우트(`edit`, `visits/add`) 구조 — 새 pet 하위 경로는 children에 추가할 것
- ⚠️ Pet 생성은 `POST /owners/{ownerId}/pets` (pets URL이 아닌 owners 하위) — `addPet` 구현 시 주의
- ⚠️ 백엔드 검증 오류는 `errors` 헤더(JSON 배열)로 전달 — `HttpErrorHandler`가 파싱하므로 우회 금지
- ⚠️ moment는 CommonJS 모듈 — 새 CommonJS 의존성 추가 시 `angular.json`의 `allowedCommonJsDependencies` 등록 필요
- ⚠️ `OwnerDetailComponent`는 Angular signal 사용 (`owner()`) — 해당 기능 수정 시 signal/plain 속성 혼동 주의
- ⚠️ E2E/수동 검증은 백엔드(9966)가 실제로 실행 중이어야 의미 있음 — client-only 프로젝트

---

## Usage Guidelines

**AI 에이전트용:**

- 코드를 구현하기 전에 이 파일을 먼저 읽으세요
- 문서화된 모든 규칙을 정확히 따르세요
- 판단이 서지 않으면 더 제한적인 옵션을 선택하세요
- 새로운 패턴이 등장하면 이 파일을 업데이트하세요

**인간용:**

- 이 파일은 에이전트 필요에 집중하여 간결하게 유지하세요
- 기술 스택이 변경되면 업데이트하세요
- 분기마다 낡은 규칙을 검토하세요
- 시간이 지나면 자명해지는 규칙은 제거하세요

Last Updated: 2026-10-04
