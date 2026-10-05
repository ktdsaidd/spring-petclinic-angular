# Data Models — Spring Petclinic Angular (frontend)

> 스캔 레벨: quick. 이 프로젝트는 **프론트엔드이므로 DB 스키마/마이그레이션이 존재하지 않는다**. 아래는 백엔드 REST 응답을 매핑하기 위한 클라이언트 사이드 모델 클래스(순수 TS 인터페이스성 클래스) 목록이다. 영속성·제약·마이그레이션은 spring-petclinic-rest(백엔드)의 책임이다.

## 모델 목록 (`src/app/{feature}/{model}.ts`)

### Owner (`src/app/owners/owner.ts`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 식별자 |
| `firstName` | `string` | 이름 |
| `lastName` | `string` | 성 (검색 키: `GET /owners?lastName=`) |
| `address` | `string` | 주소 |
| `city` | `string` | 도시 |
| `telephone` | `string` | 전화번호 |
| `pets` | `Pet[]` | 소유 펫 목록 (중첩) |

### Pet (`src/app/pets/pet.ts`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 식별자 |
| `ownerId` | `number` | 소유자 FK |
| `name` | `string` | 펫 이름 |
| `birthDate` | `string` | 생일 (문자열; moment로 포맷 처리) |
| `type` | `PetType` | 펫 종류 (중첩) |
| `owner` | `Owner` | 소유자 (역참조, 양방향) |
| `visits` | `Visit[]` | 방문 기록 (중첩) |

### Visit (`src/app/visits/visit.ts`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 식별자 |
| `date` | `string` | 방문일 (문자열) |
| `description` | `string` | 기술/소견 |
| `pet` | `Pet` | 대상 펫 (중첩) |
| `petId` | `number?` | 선택적 펫 FK |

### PetType (`src/app/pettypes/pettype.ts`)

| 필드 | 타입 |
|------|------|
| `id` | `number` |
| `name` | `string` |

### Vet (`src/app/vets/vet.ts`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 식별자 |
| `firstName` | `string` | 이름 |
| `lastName` | `string` | 성 |
| `specialties` | `Specialty[]` | 전문 분야 (중첩) |

### Specialty (`src/app/specialties/specialty.ts`)

| 필드 | 타입 |
|------|------|
| `id` | `number` |
| `name` | `string` |

## 관계 다이어그램 (클라이언트 모델 기준)

```
Owner 1 ──── * Pet 1 ──── * Visit
  │              │
  └── pets[]     ├── type ──> PetType (1:1 참조)
                 └── owner ─> Owner (양방향 역참조)

Vet * ──── * Specialty   (Vet.specialties[])
```

- Owner ↔ Pet: 양방향 (`Owner.pets[]` ↔ `Pet.owner`) + 단방향 FK (`Pet.ownerId`)
- Pet ↔ Visit: 양방향 (`Pet.visits[]` ↔ `Visit.pet`) + 선택 FK (`Visit.petId?`)
- Vet ↔ Specialty: 단방향 집합 (`Vet.specialties[]`)

## 마이그레이션 전략

**해당 없음 (프론트엔드).** `migrations/`, `prisma/`, ORM 설정 등 schema_migration_patterns 무매칭. 스키마 변경은 백엔드(spring-petclinic-rest)에서 수행되며, 프론트엔드는 모델 클래스 필드 수정으로만 반영된다.

## 주의 사항

- `birthDate`, `date`는 `string`으로 선언되어 있고 `moment` + `@angular/material-moment-adapter`로 날짜 UI를 처리한다 — 백엔드 직렬화 포맷(ISO 등)과 어댑터 포맷이 일치해야 한다.
- 모델은 검증 로직을 갖지 않는다 — 폼 검증은 컴포넌트 측 Angular Reactive/Template Forms가 담당 (quick 스캔 범위 외 세부).
