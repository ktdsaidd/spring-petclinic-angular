---
title: '방문 예약 시 담당 수의사 지정 (DR-2026-00001)'
type: 'feature'
created: '2026-10-05'
status: 'done'
baseline_commit: '1ea93e63c27a9812d607c3e40ec41d5757784b4c'
context:
  - '{project-root}/.specs/planning-artifacts/DR-2026-00001_define.md'
  - '{project-root}/.specs/planning-artifacts/DR-2026-00001_impact-analysis.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 방문 등록/수정 화면에 담당 수의사 입력이 없고 방문 목록에 수의사가 표시되지 않아, 접수 데스크가 수의사를 설명란 수기 입력·별도 장부로 관리하고 있다. 백엔드 계약(`VisitFields.veterinarianId`, `Visit.veterinarian`)은 이미 준비되어 있고 프론트엔드만 이를 전송·소비하지 않는다.

**Approach:** 프론트엔드 전용 변경 — `Visit` 모델에 수의사 필드를 추가하고, 등록 화면(필수)·수정 화면(비필수)에 수의사 선택 항목을, 공유 방문 목록에 수의사 열을 추가한다. 백엔드·DB·서비스 레이어 변경 없음.

## Boundaries & Constraints

**Always:**
- 등록 화면(VisitAdd)의 수의사 선택은 **필수** — 미선택 시 제출 거부 + 기존 Date/Description과 동일한 `is-invalid`/`invalid-feedback` 패턴으로 "Vet is required" 표시 (CQ-001).
- 수정 화면(VisitEdit)의 수의사 선택은 **비필수** — 미지정 저장 허용 (2026-10-04 사용자 결정). 수정 화면에 required를 걸지 않는다.
- 방문 목록(VisitList)에서 미지정 방문의 수의사 칸은 `"-"` 표시. `veterinarian?.` 안전 내비게이션 필수.
- 수의사 선택 목록은 `VetService.getVets()` 전체 목록, firstName 오름차순 정렬, 표기는 "이름 성"(firstName lastName).
- 열 위치: Visit Date → Vet → Description → Actions. 헤더 문구 "Vet".
- 선택 위젯은 `mat-select` (2026-10-05 사용자 결정).
- 기존 방문 데이터 소급 입력·이관 없음 (CQ-004).

**Ask First:**
- `visits.module.ts`에 `MatSelectModule` import로 해결되지 않는 모듈 연결 문제(순환 import 등)가 발생할 경우.
- 백엔드가 실제 응답에 `veterinarian` 객체를 반환하지 않는 경우가 스모크 확인에서 확인될 경우.

**Never:**
- 백엔드(spring-petclinic-rest)·DB·마이그레이션·`visit.service.ts`·`vet.service.ts` 수정.
- 수의사별 예약 현황 조회 (CQ-003 후속 SR), 수의사 마스터 관리 변경.
- reactive form 전환, 기존 template-driven 폼 패턴 이탈.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 등록-수의사 선택 제출 | Date/Description 입력 + 수의사 1명 선택 | `veterinarianId` 포함 POST, 방문 목록에 수의사 이름 표시 | N/A |
| 등록-수의사 미선택 제출 | Date/Description만 입력 | 저장 거부, "Vet is required" 표시, 방문 미등록 | 폼 required 검증 (프론트 전용) |
| 목록-미지정 기존 방문 | `veterinarian` 누락(null/undefined) 방문 행 | 수의사 칸 `"-"`, 날짜·설명 그대로 | 안전 내비게이션 |
| 수정-미지정→지정 | 기존 미지정 방문에서 수의사 선택 저장 | `veterinarianId` 포함 PUT, 목록에 즉시 반영 | N/A |
| 수정-수의사 해제 | 선택 해제 후 저장 | 미지정(`veterinarianId` 미포함/undefined) 저장 허용 | 검증 없음(비필수) |

</frozen-after-approval>

## Code Map

- `src/app/visits/visit.ts` — Visit 인터페이스 (id/date/description/pet/petId?) — 수의사 필드 추가 대상
- `src/app/visits/visit-add/visit-add.component.ts/.html` — template-driven 폼, onSubmit이 `visitForm.value`를 `addVisit()`으로 전송
- `src/app/visits/visit-edit/visit-edit.component.ts/.html` — 동일 폼 패턴, `updateVisit(id, visit)`
- `src/app/visits/visit-list/visit-list.component.html` — 공유 목록 3열(Visit Date/Description/Actions), 재사용 2곳(owner-detail 체인, visit-add Previous Visits)
- `src/app/visits/visits.module.ts` — providers: VisitService; MatSelectModule 미import(VetsModule에만 존재)
- `src/app/vets/vet.service.ts#getVets(): Observable<Vet[]>`, `vet.ts#Vet{id,firstName,lastName,specialties}`
- `src/app/visits/visit.service.ts` — addVisit/updateVisit은 Visit 객체 전체 전송 → 수정 불요
- spec 4종 (`visit-add/edit/list.component.spec.ts`, `visit.service.spec.ts`) — Vitest, VisitServiceStub 존재, VetService 모킹 없음

## Tasks & Acceptance

**Execution:**
- [x] `src/app/visits/visit.ts` — `veterinarianId?: number` (요청용), `veterinarian?: Vet` (응답 중첩용) 추가 (DEV-01)
- [x] `src/app/visits/visits.module.ts` — `MatSelectModule` import 추가 (DEV-02 선행)
- [x] `src/app/visits/visit-add/visit-add.component.ts` — VetService 주입, ngOnInit에서 `getVets()` 로드 후 firstName 정렬, onSubmit 시 `veterinarianId` 전송 보장 (DEV-02)
- [x] `src/app/visits/visit-add/visit-add.component.html` — "Vet" mat-select 추가(name="veterinarianId", required, `#veterinarianId="ngModel"`, is-invalid/invalid-feedback "Vet is required", option 표기 "이름 성") (DEV-02)
- [x] `src/app/visits/visit-edit/visit-edit.component.ts` — VetService 주입, 수의사 목록 로드, 선로드된 방문의 기존 수의사 초기 표시 (DEV-04)
- [x] `src/app/visits/visit-edit/visit-edit.component.html` — 동일 mat-select 추가하되 **required 없음** (DEV-04)
- [x] `src/app/visits/visit-list/visit-list.component.html` — "Vet" 열 추가(Visit Date 뒤), `{{ visit.veterinarian?.firstName }} {{ visit.veterinarian?.lastName }}`, 미지정 시 "-" (DEV-03) — 구현 시 `<tbody>` 명시 래핑 추가(jsdom 테스트 렌더링 안정성)
- [x] spec 4종 갱신 — visit-add/edit spec에 VetServiceStub(getVets → Vet[] mock) provider 추가, 등록 미선택 검증·목록 표시 케이스 테스트 (DEV-05)

**Acceptance Criteria:**
- Given 방문 등록 화면, when 수의사 미선택으로 제출, then 저장이 거부되고 "Vet is required"가 표시되며 방문이 등록되지 않는다.
- Given 수의사를 선택한 방문 등록, when 제출, then 방문 목록에 선택한 수의사 이름이 표시된다.
- Given 수의사 지정/미지정 방문이 혼재한 목록, when 렌더링, then 지정 건은 이름, 미지정 건은 "-"가 표시되고 날짜·설명은 유지된다.
- Given 수의사 A로 등록된 방문, when 수정 화면에서 B로 변경 저장, then 목록에 B가 표시된다.
- Given 미지정 방문, when 수정 화면에서 수의사 선택 없이 저장, then 저장이 허용된다.

## Design Notes

수정 화면의 mat-select는 초기값이 기존 `visit.veterinarian?.id`와 바인딩되어 지정 수의사가 선택 상태로 표시된다. 등록 화면만 required, 수정 화면은 required 없음 — 동일 위젯·문구이나 검증 규칙만 분기.

mat-select + ngModel 바인딩 예시:

```html
<select matNativeControl id="vet" name="veterinarianId" class="form-select" required
        [(ngModel)]="visit.veterinarianId" #veterinarianId="ngModel">
  <option [ngValue]="undefined" disabled>Select a vet</option>
  <option *ngFor="let vet of vets" [ngValue]="vet.id">{{ vet.firstName }} {{ vet.lastName }}</option>
</select>
```

## Verification

**Commands:**
- `npm run build` -- expected: 빌드 성공
- `npm run lint` -- expected: 오류 없음
- `npm run test:ci` -- expected: visit 모듈 spec 전부 통과

**Manual checks:**
- 백엔드(:9966) 기동 후 등록→목록→수정 왕복에서 수의사 전송/표시/변경 확인 (openapi 계약상 `veterinarian` 반환 — 미반환 시 Ask First)

## Suggested Review Order

**수의사 필드 계약 (모델)**

- 백엔드 `VisitFields`/`Visit`과 정합하는 선택 필드 2종 — 전체 변경의 기반
  `[visit.ts:32](../../src/app/visits/visit.ts#L32)`

**방문 등록 — 필수 선택 (REQ-001)**

- VetService 주입 후 진입 시 수의사 목록 로드·firstName 정렬
  `[visit-add.component.ts:68](../../src/app/visits/visit-add/visit-add.component.ts#L68)`
- required select + "Vet is required" invalid-feedback — 기존 Date/Description 검증 패턴 답습
  `[visit-add.component.html:43](../../src/app/visits/visit-add/visit-add.component.html#L43)`

**방문 수정 — 비필수·초기 표시 (REQ-003)**

- 선로드 방문의 `veterinarian?.id ?? veterinarianId` 이중 폴백 초기화
  `[visit-edit.component.ts:72](../../src/app/visits/visit-edit/visit-edit.component.ts#L72)`
- 동일 위젯·문구이되 required 없음 — 미지정 저장 허용 (2026-10-04 확정)
  `[visit-edit.component.html:43](../../src/app/visits/visit-edit/visit-edit.component.html#L43)`

**방문 목록 — 수의사 열 (REQ-002)**

- Visit Date→Vet→Description→Actions 열 배치, 안전 내비게이션 + "-" placeholder
  `[visit-list.component.html:31](../../src/app/visits/visit-list/visit-list.component.html#L31)`

**테스트 (DEV-05)**

- 등록: VetServiceStub·정렬·required·payload 검증
  `[visit-add.component.spec.ts:124](../../src/app/visits/visit-add/visit-add.component.spec.ts#L124)`
- 수정: 비필수·초기 선택 검증
  `[visit-edit.component.spec.ts:127](../../src/app/visits/visit-edit/visit-edit.component.spec.ts#L127)`
- 목록: 지정/미지정 표시 분기 검증
  `[visit-list.component.spec.ts:114](../../src/app/visits/visit-list/visit-list.component.spec.ts#L114)`
