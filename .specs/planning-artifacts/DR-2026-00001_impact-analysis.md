---
sr_id: DR-2026-00001
sr_name: 방문 예약 시 담당 수의사 지정
define_sr: DR-2026-00001_define.md
analysis_date: 2026-10-05
author: 82023013
---

# 방문 예약 시 담당 수의사 지정 기능 추가 — 영향도 분석

## 목차
| § | 섹션 | 한눈에 보기 |
|---|---|---|
| 1 | 문서 개요 | DR-2026-00001 · 종합 영향도 Medium · 작업 3 → 개발 항목 5 · 미결 0 · UI/UX 결정 0 (해결 3) |
| 2 | 요구사항 요약 | 방문 등록 시 수의사 필수 선택 / 방문 목록 수의사 표시 / 방문 수정 시 수의사 변경 |
| 3 | 작업 분해 | TASK 3개 (REQ-001~003 → 1:1) |
| 4 | As-Is / To-Be | 요구사항별 변경점 (소스 확인 완료 — 추정 없음) |
| 5 | 영향도 분석 | 프론트 모델·화면 3종·공유 목록 수정 / 백엔드·DB·배치 변경 없음 / 파급은 SR 대상 내 2곳 |
| 6 | 개발 항목 | DEV 5개 (모델 1 · 화면 3 · 테스트 1) |
| 7 | 영향 요약 및 리스크 | 검증 규칙 화면 분기, 재사용 목록 회귀, 기존 미지정 방문, 백엔드 실제 동작 스모크 확인 |
| 8 | 미결 사항 / 가정 | 미결 0 (해결 2) · UI/UX 결정 0 (해결 3) |
| 9 | 참고 자료 | SR 정의서 + openapi.yml + `.context/legacy/` 전역 문서 + 소스 코드 |

## 1. 문서 개요
| 항목 | 내용 |
|---|---|
| SR ID / 명 | DR-2026-00001 / 방문 예약 시 담당 수의사 지정 기능 추가 |
| 종합 영향도 | Medium (§5.1 최고 등급 — 기존 화면·모델을 기존 패턴 내 수정, SR 밖 파급 없음) |
| 요구사항 → 개발 항목 | 작업 3개 → 개발 항목 5개 |
| 핵심 변경점 | 백엔드 계약에 이미 존재하는 `veterinarianId`/`veterinarian`을 프론트엔드가 전송·소비하기 시작: 방문 등록(필수)·수정(비필수) 화면에 수의사 선택 추가, 공유 방문 목록에 수의사 열 표시. 백엔드·DB·마이그레이션 변경 없음 |
| 미결 사항 | 0 (§8 참조) · UI/UX 결정 0 (§8 참조 — 결정 3건은 §8.2에 기록 완료) |

## 2. 요구사항 요약
- 방문 등록 화면(New Visit)에 담당 수의사 선택 항목을 추가하고, 등록된 수의사 마스터 목록(전체)에서 1명을 **필수** 선택하여 방문 기록에 저장한다 (REQ-001, CQ-001 확정).
- 반려동물별 방문 목록(등록 화면 하위 "Previous Visits" 포함)에 담당 수의사 이름 열을 추가하여 방문 날짜·설명과 함께 즉시 확인 가능하게 한다 (REQ-002).
- 기존 방문의 수정 화면(Edit Visit)에서 담당 수의사를 다른 수의사로 변경(또는 미지정 상태에서 최초 지정)할 수 있게 한다 (REQ-003).
- 기존 방문(수의사 미지정)은 목록에서 공백/"-"로 표시하며 데이터 소급 입력·이관은 하지 않는다 (REQ-002 예외, CQ-004 확정).
- 제외 범위: 수의사별 예약 현황 조회(CQ-003 후속 SR), 수의사 마스터 관리(변경 없음), 기존 데이터 소급 입력(CQ-004).

## 3. 작업 분해
| TASK ID | 원 요구사항 | 내용 | 유형 | 수용 기준 |
|---|---|---|---|---|
| TASK-01 | REQ-001 | 방문 등록 화면에 담당 수의사 선택 항목(등록 수의사 전체 목록 중 1명, 필수)을 추가하고 선택 값을 방문 기록에 저장 | 기능/UI | 수의사를 선택하지 않고 방문 추가를 제출하면 저장이 거부되고 미선택이 표시되며 방문이 등록되지 않는다; 수의사 1명을 선택 후 재제출하면 방문 목록에 선택한 수의사 이름과 함께 방문이 등록된다 |
| TASK-02 | REQ-002 | 반려동물별 방문 목록(이전 방문 목록 포함)에 담당 수의사 이름 열을 추가 표시 | UI | 수의사 지정 방문은 이름이 표시되고, 미지정(기존) 방문은 수의사 칸이 공백/"-"로 표시되며 날짜·설명 등 다른 정보는 그대로 유지된다 |
| TASK-03 | REQ-003 | 방문 수정 화면(Edit Visit)에 담당 수의사 선택 항목을 제공하여 변경(또는 미지정→지정) 저장 | 기능/UI | 수의사 A로 등록된 기존 방문의 수정 화면에서 B로 변경 저장하면 방문 목록에서 해당 방문의 담당 수의사가 B로 표시된다. 수정 화면의 수의사 선택은 **필수 아님**(2026-10-04 사용자 결정 — 미지정 저장 허용) |

- 분해 근거: REQ-001~003 각각이 "단일 동작 + 단일 대상"(선택 저장 / 목록 표시 / 변경 저장)이므로 1 REQ = 1 TASK. 수용 기준은 SR §4의 검수 기준 원문을 시험 가능한 형태로 재정리한 것(추정 아님).
- REQ-003의 "수정 화면 필수 여부"는 대화형 확인으로 **해결**: 수정 화면은 필수 아님(§8.1-1 해결 기록 참조).

## 4. As-Is / To-Be

### TASK-01: 방문 등록 화면에 담당 수의사 선택 추가 (REQ-001)
- **As-Is:** 방문 등록 화면(New Visit, `VisitAddComponent`)은 Date(matDatepicker)와 Description 두 입력만 존재하는 template-driven 폼이며, 제출 시 `VisitService.addVisit()`이 `POST /owners/{ownerId}/pets/{petId}/visits`로 `Visit`(id/date/description/pet/petId?)만 전송한다. 담당 수의사 입력 항목도 모델 필드도 없고, 수의사 목록(VetService)을 이 화면에서 참조하지 않는다. 백엔드 계약은 이미 `VisitFields.veterinarianId`(선택 필드)를 수신한다.
- **To-Be:** 폼에 "담당 수의사" 선택 항목을 추가한다. 선택 목록은 `VetService.getVets()`가 반환하는 등록된 수의사 전체이며, 제출 본문에 선택한 수의사의 `veterinarianId`를 포함한다. **필수 입력**: 미선택 시 저장이 거부되고 미선택임이 화면에 표시된다(기존 Date/Description의 required + invalid-feedback 패턴과 동일한 화면 처리).
- **변경점:** 수의사 입력 항목 없음(백엔드 필드 미전송) → 필수 선택 항목 추가 + `veterinarianId` 전송.
- **As-Is 출처:**
  - `src/app/visits/visit-add/visit-add.component.html` (L31-60: Date/Description 폼, hidden id/pet)
  - `src/app/visits/visit-add/visit-add.component.ts#onSubmit()` (L79-94)
  - `src/app/visits/visit.service.ts#addVisit()` (L56-64)
  - `src/app/visits/visit.ts` (L25-31: 모델에 수의사 필드 없음)
  - `.context/api-contracts/openapi.yml` `VisitFields.veterinarianId` (L2281-2287: 백엔드 수신 가능, required는 description뿐)

### TASK-02: 방문 목록에 담당 수의사 이름 열 표시 (REQ-002)
- **As-Is:** 방문 목록은 공유 컴포넌트 `VisitListComponent`가 렌더하며 열은 "Visit Date / Description / Actions" 3개뿐이다. 이 컴포넌트는 (a) 보호자 상세의 반려동물별 방문 목록(`OwnerDetail → PetList → VisitList`, `pet.visits` 입력)과 (b) 방문 등록 화면 하위 "Previous Visits"(`currentPet.visits` 입력) 두 곳에서 재사용된다. 방문 데이터는 `GET /owners/{id}` 응답의 `Owner.pets[].visits[]`에 중첩되어 오며, 백엔드 계약상 각 Visit은 readOnly `veterinarian`(Vet 객체 중첩)을 포함할 수 있으나 프론트 모델·템플릿은 이를 무시한다.
- **To-Be:** 목록에 "수의사" 열을 추가하여 지정 방문은 `veterinarian`의 이름을 표시하고, 미지정(기존) 방문은 공백/"-"로 표시한다. 두 재사용 지점(보호자 상세 방문 목록, Previous Visits) 모두 동일 컴포넌트이므로 자동으로 함께 반영된다. 기존 데이터는 변경하지 않는다.
- **변경점:** 수의사 열 없음 → 열 추가 + 미지정 건 placeholder 표시.
- **As-Is 출처:**
  - `src/app/visits/visit-list/visit-list.component.html` (L19-35: 3개 열)
  - `src/app/owners/owner-detail/owner-detail.component.html` (L51-53) → `src/app/pets/pet-list/pet-list.component.html` (L37) → `app-visit-list` 호출 체인
  - `src/app/visits/visit-add/visit-add.component.html` (L62-63: Previous Visits)
  - `.context/api-contracts/openapi.yml` `Visit.veterinarian` (L2312-2315, readOnly), `Owner.pets` (L2055-2061)

### TASK-03: 방문 수정 화면에서 담당 수의사 변경 (REQ-003)
- **As-Is:** 방문 수정 화면(Edit Visit, `VisitEditComponent`)은 `GET /visits/{id}`로 방문을 선로드한 뒤 TASK-01과 동일한 Date/Description 폼을 표시하고, 저장 시 `VisitService.updateVisit()`이 `PUT /visits/{id}`로 방문 전체를 전송한다. 수의사 항목은 없다. 백엔드 수정 계약(`VisitFields`)은 `veterinarianId`를 수신한다.
- **To-Be:** 수정 화면 폼에 담당 수의사 선택 항목을 추가하여 등록된 수의사 목록 중 다른 수의사로 변경(또는 미지정 상태에서 최초 지정) 저장할 수 있게 한다. 저장 후 방문 목록에 변경된 수의사가 즉시 반영된다. **수정 화면의 수의사 선택은 필수 아님** — 2026-10-04 대화형 확인으로 확정(미선택 저장 허용, §8.1-1).
- **변경점:** 수의사 변경 불가 → 수정 화면에서 수의사 변경/최초 지정 가능.
- **As-Is 출처:**
  - `src/app/visits/visit-edit/visit-edit.component.html` (L31-60)
  - `src/app/visits/visit-edit/visit-edit.component.ts#onSubmit()` (L80-90)
  - `src/app/visits/visit.service.ts#updateVisit()` (L66-71)
  - `.context/api-contracts/openapi.yml` `PUT /visits/{visitId}` requestBody = `VisitFields` (L1247-1253)

## 5. 영향도 분석

### 5.1 영향 프로그램/모듈
| 프로그램/모듈 ID | 명칭 | 변경 유형(신규/수정/삭제) | 변경 내용 | 관련 TASK | 영향도 | 출처 |
|---|---|---|---|---|---|---|
| `src/app/visits/visit.ts` | Visit 클라이언트 모델 | 수정 | 백엔드 계약과 동일하게 수의사 필드 추가: 요청용 `veterinarianId?: number`, 응답 중첩용 `veterinarian?: Vet`(필드 구성은 백엔드 `VisitFields.veterinarianId`/`Visit.veterinarian`에 대응) | TASK-01,02,03 | Medium | `visit.ts#Visit` (L25-31), openapi.yml `VisitFields`/`Visit` |
| `src/app/visits/visit-add/visit-add.component.ts` | VisitAddComponent | 수정 | `VetService` 주입 + 진입 시 수의사 목록(`getVets()`) 로드, 폼 값에 수의사 선택 반영 | TASK-01 | Medium | `visit-add.component.ts` (L50-77) |
| `src/app/visits/visit-edit/visit-edit.component.ts` | VisitEditComponent | 수정 | `VetService` 주입 + 수의사 목록 로드, 기존 방문의 수의사 초기 표시, 변경 저장 | TASK-03 | Medium | `visit-edit.component.ts` (L49-90) |
| `src/app/visits/visit.service.ts` | VisitService | 변경 없음 | addVisit/updateVisit은 `Visit` 객체 전체를 본문으로 전송하므로 모델에 `veterinarianId`가 추가되면 그대로 전달 — 서비스 코드 수정 불요 | TASK-01,03 | Low (변경 없음 확인) | `visit.service.ts#addVisit/#updateVisit` (L56-71) |
| `src/app/vets/vet.service.ts` | VetService | 변경 없음 | `getVets()`(GET /vets)를 선택 목록 소스로 그대로 재사용 | TASK-01,03 | Low (변경 없음 확인) | `vet.service.ts#getVets` (L43-48) |
| `src/app/visits/visits.module.ts` | VisitsModule | 수정(경미) | 방문 화면이 VetService를 직접 주입받게 되면 모듈 provider/import 연결 확인 필요 — 기존 owners/pettypes 화면의 타 도메인 서비스 참조 전례는 없어 신규 패턴 (VetModule import 없이 provider 등록만으로 가능한지 개발 시 확인) | TASK-01,03 | Medium | `visits.module.ts` (L28,68) |
| `src/app/visits/visit-list/visit-list.component.html` | VisitListComponent(공유 목록) | 수정 | 수의사 열 추가(§5.6 참조자 2곳 모두 SR 대상 내 → SR 밖 회귀 없음, 직접 수정) | TASK-02 | Medium | §5.2, §5.6 |

### 5.2 영향 화면/UI
| 화면 ID | 화면명 | 변경 내용 | 관련 TASK | 출처 |
|---|---|---|---|---|
| `app-visit-add` (VisitAddComponent, 라우트 `visits/add`) | 방문 등록 (New Visit) | 폼에 "담당 수의사" 선택 항목 **추가(필수)** — 등록된 수의사 전체 목록 중 1명, 미선택 시 제출 거부·미선택 표시. 하위 "Previous Visits" 목록도 수의사 열 변경에 자동 포함 | TASK-01 | `visit-add.component.html` (L31-63) |
| `app-visit-list` (VisitListComponent) | 반려동물별 방문 목록 | "Visit Date / Description / Actions" 3열 → 수의사 이름 열 추가. 미지정 방문은 공백/"-" 표시 | TASK-02 | `visit-list.component.html` (L19-35) |
| `app-visit-edit` (VisitEditComponent, 라우트 `visits/:id/edit`) | 방문 수정 (Edit Visit) | 폼에 "담당 수의사" 선택 항목 **추가(필수 아님 — 2026-10-04 확정)**, 기존 지정 수의사 초기 표시 | TASK-03 | `visit-edit.component.html` (L31-60) |
| `app-pet-list` (PetListComponent) | Pets and Visits 내 반려동물 행 | 자체 코드 변경 없음 — 하위 `app-visit-list` 재사용으로 수의사 열 표시가 자동 반영(검증 대상) | TASK-02 | `pet-list.component.html` (L37) |
| `app-owner-detail` (OwnerDetailComponent) | 보호자 상세 (Pets and Visits) | 자체 코드 변경 없음 — `app-pet-list` 재사용 체인으로 자동 반영(검증 대상) | TASK-02 | `owner-detail.component.html` (L51-53) |

### 5.3 영향 데이터(DB)
| 테이블 | 컬럼 | 변경 유형 | 변경 내용 | 관련 TASK | 출처 |
|---|---|---|---|---|---|
| N/A (프론트엔드) | N/A | N/A | 본 저장소는 DB/마이그레이션 없음. 방문-수의사 관계 저장(visits 테이블 컬럼 등)은 백엔드(spring-petclinic-rest) 책임이며, 백엔드 계약에 이미 `veterinarianId`/`veterinarian`이 존재하여 백엔드 변경 없음(2026-10-04 사용자 결정). 프론트 측 데이터 구조 영향은 §5.1 Visit 모델 참조 | TASK-01,02,03 | `data-models-web.md` "마이그레이션 전략: 해당 없음", openapi.yml `VisitFields`/`Visit` |

### 5.4 영향 인터페이스/연계
| 인터페이스 ID | 연계 대상 | 변경 내용 | 관련 TASK | 출처 |
|---|---|---|---|---|
| `POST /owners/{ownerId}/pets/{petId}/visits` (addVisitToOwner) | spring-petclinic-rest | **엔드포인트·스키마 변경 없음** — 요청 본문(`VisitFields`)에 선택 필드 `veterinarianId`를 전송 시작하는 것뿐. 백엔드 스키마 이미 수신 가능 | TASK-01 | openapi.yml (L528-585, L2263-2289), `visit.service.ts#addVisit` |
| `PUT /visits/{visitId}` (updateVisit) | spring-petclinic-rest | 변경 없음 — 요청 본문 `VisitFields`에 `veterinarianId` 포함하여 전송 | TASK-03 | openapi.yml (L1231-1253), `visit.service.ts#updateVisit` |
| `GET /owners/{id}` (getOwner) | spring-petclinic-rest | 변경 없음 — 응답 `pets[].visits[].veterinarian`(readOnly 중첩 객체)을 프론트가 소비 시작(현재 무시) | TASK-02 | openapi.yml `Owner.pets`/`Visit.veterinarian` (L2312-2315), `owner.service.ts#getOwnerById` |
| `GET /vets` (listVets) | spring-petclinic-rest | 변경 없음 — 방문 화면에서 선택 목록 소스로 호출 추가(기존 VetList 화면 외 소비자 증가) | TASK-01,03 | openapi.yml (L1595-1628), `vet.service.ts#getVets` |
| 검증 책임 | N/A | 필수 검증은 프론트 폼(CQ-001)에서 수행, 백엔드 검증 보강 없음(2026-10-04 사용자 결정, §8.1-2 해결 기록) | TASK-01 | openapi.yml `VisitFields.required=[description]` |

### 5.5 영향 배치/권한/마이그레이션/설정/비기능
| 구분(배치/권한/마이그레이션/설정/비기능) | 대상 | 변경 내용 | 관련 TASK |
|---|---|---|---|
| 배치/스케줄러 | N/A | 프론트엔드 SPA — 배치 없음 | N/A |
| 권한/보안 | N/A | 프론트엔드 인증/권한 코드 없음(백엔드 책임), SR 적용 사용자도 "전체 사용자 — 권한 구분 없음" | N/A |
| 데이터 마이그레이션 | N/A | 기존 방문 소급 입력 없음(CQ-004 확정). 프론트 마이그레이션 자산 없음 | TASK-02 |
| 설정/환경 | `src/environments/environment*.ts` | 변경 없음 — REST_API_URL 동일 | N/A |
| 비기능 | 방문 화면 진입 시 `GET /vets` 추가 호출 1건 | 등록/수정 화면 진입 시 수의사 마스터 1회 로드 — 경미 (백엔드 ETag/304 캐시 동작은 백엔드 현행 계약) | TASK-01,03 |

### 5.6 타 기능 파급 영향
| 공통/공유 모듈 | 영향 호출부 | 파급 내용 | 관련 TASK |
|---|---|---|---|
| `VisitListComponent` (공유 UI 컴포넌트) | ① `pet-list.component.html` L37 (보호자 상세 Pets and Visits) ② `visit-add.component.html` L63 (Previous Visits) — grep 전 트리 확인 결과 이 2곳이 전부 | 열 추가가 두 재사용 지점 모두에 동시 반영. **두 지점 모두 SR 적용 대상 화면이므로 SR 밖 회귀 없음.** `@Input() visits` 시그니처 불변 → 부모 코드 수정 불요 | TASK-02 |
| `Visit` 모델 (`visit.ts`) | `pet.ts` L24 (`Pet.visits: Visit[]`), visit 모듈 내부 컴포넌트 일체 | 선택(`?`) 필드 추가이므로 기존 참조 전부 하위 호환 — 필드 미사용 코드(pet-list 등) 컴파일/런타임 영향 없음 | TASK-01,02,03 |
| `VisitService` | visit-list/add/edit 컴포넌트 + spec 스텁 (grep 확인: visits 모듈 외 소비자 없음) | 서비스 메서드 서명 변경 없음 → 파급 없음 | N/A |
| `VetService.getVets()` | 기존: VetListComponent. 신규: VisitAdd/VisitEdit에서 호출 추가 | VetService 자체 변경 없음 — 소비자만 증가. 수의사 마스터 화면 동작 영향 없음 | TASK-01,03 |
| 단위 테스트 스텁 (`visit-add/edit/list.component.spec.ts`의 VisitServiceStub, `visit.service.spec.ts`) | 동일 파일들 | 모델 필드·주입 변경에 따라 spec 스텁/모킹 갱신 필요 (테스트 자산, §6 개발 항목에 포함) | TASK-01,02,03 |

## 6. 개발 항목
(위 영향도 분석을 통합한 구현 가능한 작업 단위)
| 개발 항목 ID | 개발 항목(작업 단위) | 유형(화면/로직/DB/IF/배치/공통) | 변경 유형(신규/수정/삭제) | 대상 ID | 관련 TASK | 출처 |
|---|---|---|---|---|---|---|
| DEV-01 | Visit 모델에 수의사 필드 추가 — `veterinarianId?: number`(요청용), `veterinarian?: Vet`(응답 중첩용). 백엔드 `VisitFields`/`Visit` 스키마에 정합 | 공통(모델) | 수정 | `src/app/visits/visit.ts` | TASK-01,02,03 | §5.1, §5.4 |
| DEV-02 | 방문 등록 화면에 담당 수의사 필수 선택 항목 추가 — `VetService.getVets()`로 목록 로드, required 검증 + 미선택 invalid-feedback 표시, 제출 본문에 `veterinarianId` 포함 | 화면 | 수정 | `visit-add.component.ts/.html` (+ `visits.module.ts` provider 연결 확인) | TASK-01 | §5.1, §5.2 |
| DEV-03 | 방문 목록에 수의사 이름 열 추가 — 지정 건 이름 표시, 미지정 건 공백/"-" placeholder. 재사용 지점(보호자 상세·Previous Visits) 자동 반영 검증 포함 | 화면 | 수정 | `visit-list.component.html` (검증: `pet-list`, `visit-add` 하위) | TASK-02 | §5.2, §5.6 |
| DEV-04 | 방문 수정 화면에 담당 수의사 선택 항목 추가(필수 아님) — 수의사 목록 로드, 기존 지정 수의사 초기 표시, 변경/미지정 저장 시 `veterinarianId` 전송 | 화면 | 수정 | `visit-edit.component.ts/.html` | TASK-03 | §5.1, §5.2 |
| DEV-05 | 방문 단위 테스트 갱신 — visit-add/edit/list spec의 스텁·모킹에 수의사 필드/주입 반영, 필수 검증(미선택 저장 거부)·목록 표시 케이스 추가 | 공통(테스트) | 수정 | `visit-add.component.spec.ts`, `visit-edit.component.spec.ts`, `visit-list.component.spec.ts`, `visit.service.spec.ts` | TASK-01,02,03 | §5.6 |

- 통합 판단: 백엔드 변경 없음(§5.3/§5.4)이므로 DB/IF/배치 개발 항목 없음. 화면 3종(DEV-02~04)은 각 화면 컴포넌트가 독립 수정 단위이므로 분리. DEV-01은 3개 화면이 함께 의존하는 최우선 선행 항목.
- 공유 요소 권고: `VisitListComponent`는 참조자 2곳이 모두 SR 대상 내 화면으로 확인되어 "SR 대상 밖 사용 없는 공유 아님" 판정(§5.6) → 가드·분리 권고 불요, 직접 수정.

## 7. 영향 요약 및 리스크
| 영역 | 영향 범위 | 리스크 | 완화 방안 |
|---|---|---|---|
| 화면(방문 등록/수정) | 등록·수정 2화면 폼 — 기존 template-driven 폼 패턴 내 추가 | 미선택 검증이 등록 화면에만 적용돼야 하나 수정 화면은 비필수라 화면별 검증 규칙이 분기됨 — 실수로 수정 화면에 required를 걸면 기존 미지정 방문 편집이 차단될 수 있음 | 본 분석서 §4 TASK-03에 "수정 화면 필수 아님(2026-10-04 확정)" 명시, DEV-05 단위 테스트에 "미지정 저장 허용" 케이스 포함 |
| 공유 목록 컴포넌트 | `VisitListComponent` 재사용 2곳(보호자 상세 Pets and Visits, Previous Visits) — 모두 SR 대상 내 | 열 추가로 인한 시그니처 변경은 없으나, 두 화면 회귀 미검증 시 표시 깨짐 가능 | Playwright E2E/Vitest로 두 재사용 지점 표시 회귀 확인(DEV-03, DEV-05) |
| 데이터(기존 방문) | 기존 방문 데이터 미지정 상태 유지(CQ-004) | `veterinarian` 중첩 객체 누락(null/undefined) 시 템플릿 바인딩 오류 | `veterinarian?.` 안전 내비게이션 + placeholder 분기, 미지정 방문 포함 목록 테스트 |
| 연계(백엔드) | spring-petclinic-rest 4개 엔드포인트 소비 변경(전송/소비 시작만, 스키마 변경 없음) | 백엔드 `veterinarianId` 영속·반환 동작이 계약대로 실제 동작하지 않으면 기능 미작동(백엔드 저장소 본 워크스페이스 외부 — As-Is 미확인). 백엔드 서버 측 필수 검증 없음(범위 제외 결정) | 개발 착수 전 `GET /owners/{id}` 응답에 `veterinarian` 필드가 실제로 오는지 백엔드 현행 버전에서 스모크 확인; 미작동 시 백엔드 후속 SR으로 분리 |
| 권한/배치/마이그레이션/설정 | N/A | 없음 | N/A |
| 테스트 자산 | visit 모듈 spec 4종 | 스텁 미갱신 시 CI(test:ci) 실패 | DEV-05에서 spec 갱신, CI 게이트(build→lint→test→e2e)로 검증 |

## 8. 미결 사항 / 가정

### 8.1 분석 미결 / 가정
- [x] ~~REQ-003 — 방문 수정 화면(Edit Visit)의 담당 수의사 필수 여부 미확정 (SR §4.3 CQ 미확인)~~ — **해결(2026-10-04 / 사용자 결정):** 수정 화면은 필수 아님 — 수의사 미선택(미지정) 상태 저장 허용. 등록 화면(REQ-001)만 필수(CQ-001 유지). **반영:** §3 TASK-03 수용 기준, §4 TASK-03 To-Be.
- [x] ~~(확인필요) 백엔드가 `veterinarianId` 누락/미선택 제출을 서버 측에서 거부(400)하는지 OpenAPI상 확인 불가 — 프론트 필수 검증만으로 충분한지 확인 필요~~ — **해결(2026-10-04 / 사용자 결정):** 이번 SR은 프론트엔드 폼 필수 검증(CQ-001)만으로 요구 충족. 백엔드(spring-petclinic-rest) 변경 없음 — 백엔드 검증 보강은 범위 제외. **반영:** §5.4 연계 코멘트, §7 리스크.

### 8.2 UI/UX 결정 항목 (설계/개발 단계 판단 — 분석 미결 카운트와 별도)
- [x] (UI/UX) ~~방문 등록 화면 — 담당 수의사 선택 요소(위젯·문구·표기·정렬)~~ — **결정(2026-10-05 / 사용자 결정):** 위젯 `mat-select` 사용. 라벨/미선택 error 메시지는 현행 화면 패턴과 동일(영문 "Vet is required" 스타일 — 기존 "Date is required"/"Description is required" 규칙 답습). 선택 목록 표기는 "이름 성" 순서. 목록 정렬은 이름(firstName) 기준. **반영:** §6 DEV-02 구현 참고.
- [x] (UI/UX) ~~방문 수정 화면 — 수의사 선택 요소(일관성·초기 표시·지정 해제)~~ — **결정(2026-10-05 / 사용자 결정):** 등록 화면과 동일 위젯/문구로 일관성 유지. 기존 지정 수의사는 초기 선택 상태로 표시(변경 가능), **지정 해제(미지정 저장) 가능** — 비필수 확정(§8.1-1)과 정합. **반영:** §6 DEV-04 구현 참고.
- [x] (UI/UX) ~~방문 목록(`app-visit-list`) — 수의사 열(헤더 문구·placeholder·열 위치)~~ — **결정(2026-10-05 / 사용자 결정):** 열 헤더는 현행 목록 헤더 패턴과 동일하게 영문("Vet" 스타일). 미지정 placeholder는 "-". 열 위치는 Description 앞(Visit Date → Vet → Description → Actions). **반영:** §6 DEV-03 구현 참고.

## 9. 참고 자료

- **SR (요구사항정의서):** `DR-2026-00001_define.md` (작성일 2026-10-04, 작성자 82023013)
- **reference/에 해당하는 전역 문서** — 본 프로젝트는 `features/`+`reference/` 폴더 대신 `.context/legacy/`에 BMAD document-project 산출물이 존재:
  - `index.md` — 마스터 진입점, 기술 스택·주요 경로 요약
  - `project-overview.md` — 프로젝트 목적·기술 스택 (클라이언트 전용 SPA 확인)
  - `architecture.md` — Feature-Module 레이어링, Resolver 패턴, 에러 파이프
  - `component-inventory-web.md` — 컴포넌트 22개 인벤토리 (visits 3화면, owner-detail 포함)
  - `api-contracts-web.md` — 프론트 소비 REST 계약 30개 호출 지점 (VisitService 5개 포함)
  - `data-models-web.md` — 클라이언트 모델 6종 (Visit: id/date/description/pet/petId? — 수의사 필드 없음 확인)
  - `source-tree-analysis.md` — 디렉터리 트리·엔트리 포인트
- **추가 문서 (사용자 지정):** `.context/api-contracts/openapi.yml` — 백엔드(spring-petclinic-rest) OpenAPI 3.0.1 계약 전문. 핵심 확인 사항: `VisitFields.veterinarianId`(선택, int32), `Visit.veterinarian`(Vet 객체 중첩, readOnly)이 이미 백엔드 계약에 존재 → 백엔드 API 변경 없이 프론트엔드만으로 구현 가능한 범위임을 확인하는 근거
- **features/ (읽은 기능 문서 + 사유):** N/A — 매핑되는 기능 문서 없음 (`.context/legacy/`의 전역 문서로 대체)
- **source code:** (As-Is 확인·파급 추적·타깃 확용으로 참조 — 진입점→심볼 호출 체인 확인 완료)
  - `src/app/visits/visit.ts#Visit`, `src/app/visits/visit.service.ts#addVisit/#updateVisit`
  - `src/app/visits/visit-add/visit-add.component.ts#onSubmit` + `.html`, `src/app/visits/visit-edit/visit-edit.component.ts#onSubmit` + `.html`, `src/app/visits/visit-list/visit-list.component.html`
  - `src/app/owners/owner-detail/owner-detail.component.html` → `src/app/pets/pet-list/pet-list.component.html` → `app-visit-list` (재사용 체인)
  - `src/app/vets/vet.service.ts#getVets`, `src/app/vets/vet.ts#Vet`, `src/app/visits/visits.module.ts`, `src/app/visits/visits-routing.module.ts`
  - grep 전 트리: `app-visit-list` 참조자, `VisitService` 참조자, `Visit` 모델 import자
