# API Contracts — Spring Petclinic Angular (frontend)

> 스캔 레벨: quick (패턴 기반 — 서비스 클래스의 HTTP 호출 패턴에서 추출).
> 이 프로젝트는 **백엔드 API를 소비하는 클라이언트**이다. 실제 API 구현은 [spring-petclinic-rest](https://github.com/spring-petclinic/spring-petclinic-rest)에 존재하며, 본 문서는 프론트엔드가 호출하는 엔드포인트 계약만 기술한다.

## 기본 설정

| 항목 | 값 | 근거 |
|------|-----|------|
| Base URL | `http://localhost:9966/petclinic/api/` | `src/environments/environment.ts`, `environment.prod.ts` (둘 다 동일 값 하드코딩) |
| HTTP 클라이언트 | `@angular/common/http` `HttpClient` | `app.module.ts`의 `HttpClientModule` |
| 에러 처리 | 전역 `HttpErrorHandler` + 서비스별 `HandleError` 파이프 (`catchError`) | `src/app/error.service.ts`, 각 `*.service.ts` |
| 인증 | 없음 (프론트엔드 측 guard/jwt/token 코드 없음) — 백엔드 책임 | `src/` 내 auth/guard/jwt 패턴 부재 |
| 직렬화 | JSON (HttpClient 기본) | — |

## 서비스별 엔드포인트 계약

### OwnerService (`src/app/owners/owner.service.ts`) — `/owners`

| 메서드 | HTTP | 경로 | 요청 본문 | 응답 타입 |
|--------|------|------|-----------|-----------|
| `getOwners()` | GET | `/owners` | — | `Owner[]` |
| `searchOwners(lastName)` | GET | `/owners?lastName={lastName}` | — | `Owner[]` |
| `getOwnerById(id)` | GET | `/owners/{id}` | — | `Owner` |
| `addOwner(owner)` | POST | `/owners` | `Owner` | `Owner` |
| `updateOwner(id, owner)` | PUT | `/owners/{id}` | `Owner` | `{}` (응답 미사용) |
| `deleteOwner(id)` | DELETE | `/owners/{id}` | — | `{}` (응답 미사용) |

### PetService (`src/app/pets/pet.service.ts`) — `/pets`

| 메서드 | HTTP | 경로 | 요청 본문 | 응답 타입 |
|--------|------|------|-----------|-----------|
| `getPets()` | GET | `/pets` | — | `Pet[]` |
| `getPetById(id)` | GET | `/pets/{id}` | — | `Pet` |
| `addPet(ownerId, pet)` | POST | `/owners/{ownerId}/pets` | `Pet` | `Pet` |
| `updatePet(id, pet)` | PUT | `/pets/{id}` | `Pet` | `Pet` |
| `deletePet(id)` | DELETE | `/pets/{id}` | — | `number` |

### VisitService (`src/app/visits/visit.service.ts`) — `/visits`

| 메서드 | HTTP | 경로 | 요청 본문 | 응답 타입 |
|--------|------|------|-----------|-----------|
| `getVisits()` | GET | `/visits` | — | `Visit[]` |
| `getVisitById(id)` | GET | `/visits/{id}` | — | `Visit` |
| `addVisit(ownerId, petId, visit)` | POST | `/owners/{ownerId}/pets/{petId}/visits` | `Visit` | `Visit` |
| `updateVisit(id, visit)` | PUT | `/visits/{id}` | `Visit` | `Visit` |
| `deleteVisit(id)` | DELETE | `/visits/{id}` | — | `number` |

### PetTypeService (`src/app/pettypes/pettype.service.ts`) — `/pettypes`

| 메서드 | HTTP | 경로 | 요청 본문 | 응답 타입 |
|--------|------|------|-----------|-----------|
| `getPetTypes()` | GET | `/pettypes` | — | `PetType[]` |
| `getPetTypeById(id)` | GET | `/pettypes/{id}` | — | `PetType` |
| `addPetType(petType)` | POST | `/pettypes` | `PetType` | `PetType` |
| `updatePetType(id, petType)` | PUT | `/pettypes/{id}` | `PetType` | `PetType` |
| `deletePetType(id)` | DELETE | `/pettypes/{id}` | — | `number` |

### VetService (`src/app/vets/vet.service.ts`) — `/vets`

| 메서드 | HTTP | 경로 | 요청 본문 | 응답 타입 |
|--------|------|------|-----------|-----------|
| `getVets()` | GET | `/vets` | — | `Vet[]` |
| `getVetById(id)` | GET | `/vets/{id}` | — | `Vet` |
| `addVet(vet)` | POST | `/vets` | `Vet` | `Vet` |
| `updateVet(id, vet)` | PUT | `/vets/{id}` | `Vet` | `Vet` |
| `deleteVet(id)` | DELETE | `/vets/{id}` | — | `number` |

### SpecialtyService (`src/app/specialties/specialty.service.ts`) — `/specialties`

| 메서드 | HTTP | 경로 | 요청 본문 | 응답 타입 |
|--------|------|------|-----------|-----------|
| `getSpecialties()` | GET | `/specialties` | — | `Specialty[]` |
| `getSpecialtyById(id)` | GET | `/specialties/{id}` | — | `Specialty` |
| `addSpecialty(specialty)` | POST | `/specialties` | `Specialty` | `Specialty` |
| `updateSpecialty(id, specialty)` | PUT | `/specialties/{id}` | `Specialty` | `Specialty` |
| `deleteSpecialty(id)` | DELETE | `/specialties/{id}` | — | `number` |

## 네스팅된 하위 리소스 패턴

펫 추가와 방문 추가는 최상위 `/pets`, `/visits`가 아니라 **owner/pet 하위 경로**로 POST한다:

- `POST /owners/{ownerId}/pets` — PetService.addPet
- `POST /owners/{ownerId}/pets/{petId}/visits` — VisitService.addVisit

수정/삭제는 최상위 `/pets/{id}`, `/visits/{id}`를 사용한다. 이 비대칭은 백엔드 REST 설계와 동일하다.

## 에러 처리 계약

- 모든 서비스 메서드는 `catchError(this.handlerError(...))`를 파이프한다 (`error.service.ts`의 `HttpErrorHandler.createHandleError`).
- 실패 시 각 메서드는 기본값(빈 배열, 캐스팅된 빈 객체, 입력 자체 등)을 방출하여 컴포넌트가 예외 없이 렌더를 계속하도록 설계되어 있다.

## 참고

- 엔드포인트 총계: **6개 리소스군, 30개 호출 지점**.
- 백엔드 스키마/유효성 검증 세부(상태 코드 의미, 필드 제약)는 spring-petclinic-rest 측 문서 참조 — quick 스캔 범위 외.
