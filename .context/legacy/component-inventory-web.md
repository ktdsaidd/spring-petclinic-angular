# Component Inventory — Spring Petclinic Angular (frontend)

> quick 스캔: 디렉터리/파일 패턴 기반 인벤토리. 클래스명·디렉터리에서 추출.

## 앱 셸

| 컴포넌트 | 위치 | 분류 | 역할 |
|----------|------|------|------|
| `AppComponent` | `src/app/app.component.ts` | Layout | 루트 셸 (`app-root`): 상단 내비게이션바 + 라우터 아웃렛 |

## 공통 페이지 (parts 모듈)

| 컴포넌트 | 위치 | 분류 | 라우트 |
|----------|------|------|--------|
| `WelcomeComponent` | `src/app/parts/welcome/` | Page | `''`, `/welcome` (홈) |
| `PageNotFoundComponent` | `src/app/parts/page-not-found/` | Page | `**` (404) |

## 기능 화면 (Feature → CRUD 화면 패턴)

### Owners (`src/app/owners/`)

| 컴포넌트 | 분류 | 라우트 |
|----------|------|--------|
| `OwnerListComponent` | List + 검색 폼 | `/owners` |
| `OwnerAddComponent` | Form (등록) | `/owners/add` |
| `OwnerDetailComponent` | Detail (펫·방문 표시/추가 진입) | `/owners/:id` |
| `OwnerEditComponent` | Form (수정) | `/owners/:id/edit` |

### Pets (`src/app/pets/`)

| 컴포넌트 | 분류 | 라우트 |
|----------|------|--------|
| `PetListComponent` | List | `/pets`, `/pets/:id` |
| `PetAddComponent` | Form | `/pets/add`, `/owners/:id/pets/add` |
| `PetEditComponent` | Form | `/pets/:id/edit` |

### Visits (`src/app/visits/`)

| 컴포넌트 | 분류 | 라우트 |
|----------|------|--------|
| `VisitListComponent` | List | `/visits` |
| `VisitAddComponent` | Form (VetService 주입: 진입 시 수의사 목록 firstName 정렬 로드, Vet 필수 선택) | `/visits/add` |
| `VisitEditComponent` | Form (VetService 주입: 수의사 목록 로드, 선로드 방문의 수의사 선택 초기 표시, Vet 비필수) | `/visits/:id/edit` |

### PetTypes (`src/app/pettypes/`)

| 컴포넌트 | 분류 | 라우트 |
|----------|------|--------|
| `PettypeListComponent` | List | `/pettypes` |
| `PettypeAddComponent` | Form | `/pettypes/add` |
| `PettypeEditComponent` | Form | `/pettypes/:id/edit` |

### Vets (`src/app/vets/`)

| 컴포넌트 | 분류 | 라우트 |
|----------|------|--------|
| `VetListComponent` | List | `/vets` |
| `VetAddComponent` | Form | `/vets/add` |
| `VetEditComponent` | Form (Resolver: vet, specs 선로드) | `/vets/:id/edit` |

### Specialties (`src/app/specialties/`)

| 컴포넌트 | 분류 | 라우트 |
|----------|------|--------|
| `SpecialtyListComponent` | List | `/specialties` |
| `SpecialtyAddComponent` | Form | (라우트 주석 처리됨 — 비활성) |
| `SpecialtyEditComponent` | Form (Resolver: specs) | `/specialties/:id/edit` |

## 비-컴포넌트 재사용 요소

| 요소 | 위치 | 분류 |
|------|------|------|
| `HttpErrorHandler` / `HandleError` | `src/app/error.service.ts` | 서비스 (공통 에러 파이프) |
| `VetResolver` | `src/app/vets/vet-resolver.ts` | Route Resolver |
| `SpecResolver` | `src/app/specialties/spec-resolver.ts` | Route Resolver |
| `router-stubs`, `DummyComponent` | `src/app/testing/` | 테스트 헬퍼 |

## 패턴 관찰

- **재사용 패턴**: 6개 기능 도메인 모두 `list / add / edit (+ detail)` 화면 4종 세트 동일 구조 — 새 CRUD 기능 추가 시 `src/app/{feature}/` 폴더 템플릿 복제가 표준 경로.
- **디자인 시스템**: Material prebuilt(indigo-pink) + Bootstrap 5 유틸리티 혼용; 커스텀 테마는 `src/assets/css/petclinic.css`.
- 폼: 등록/수정 화면은 Angular 폼 기반 (`FormsModule` 전역 import → template-driven forms 중심).

## 변경 이력

| 일자 | SR | 변경내용 | 섹션 |
|------|----|----------|------|
| 2026-10-05 | spec-dr-2026-00001-visit-vet-assignment | VisitAdd/VisitEdit 컴포넌트의 VetService 의존(Vet 선택 폼 도입) 반영 | ### Visits (`src/app/visits/`) |
