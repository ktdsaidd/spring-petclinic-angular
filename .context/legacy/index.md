# Project Documentation Index — Spring Petclinic Angular

> AI 어시스티드 개발을 위한 마스터 진입점. 브라운필드 작업 전 이 문서부터 참조할 것.
> 생성일: 2026-10-04 | 스캔 레벨: quick (패턴 기반) | 워크플로: bmad-document-project initial_scan

## Project Overview

- **Type:** monolith (1 part: `web`)
- **Primary Language:** TypeScript 6.0.3 (Node.js 24.x)
- **Architecture:** Angular NgModule 기반 Feature-Module 레이어링 SPA
- **프로젝트:** Spring Petclinic 데모의 Angular 프론트엔드 — 소유자/펫/방문/수의사/마스터 CRUD 화면. 데이터는 외부 REST 백엔드(spring-petclinic-rest, `:9966`)에 위임하는 클라이언트 전용 앱.

## Quick Reference

- **Tech Stack:** Angular 22.1 + TypeScript 6.0 + RxJS 7.8 + Angular Material 22 + Bootstrap 5.3 + moment
- **Entry Point:** `src/main.ts` → `src/app/app.module.ts` (AppModule)
- **Architecture Pattern:** Feature-Module 레이어링 (app 셸 → 7개 기능 모듈 → 6개 REST 서비스 → HttpClient)
- **상태 관리:** 전역 스토어 없음 (컴포넌트 로컬 상태)
- **인증:** 프론트엔드 측 없음 (백엔드 책임)
- **테스트:** Vitest(jsdom, spec 28개) + Playwright E2E
- **CI:** GitHub Actions (build → lint → test → e2e, Node 24)

### 주요 경로

| 경로 | 내용 |
|------|------|
| `src/app/{feature}/` | 기능 도메인 7종: owners, pets, visits, pettypes, vets, specialties, parts |
| `src/app/error.service.ts` | 전역 HTTP 에러 처리 (모든 서비스 의존) |
| `src/environments/environment*.ts` | `REST_API_URL` 주입 지점 |
| `src/app/testing/` | 단위 테스트 스텁 (router-stubs 등) |

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory-web.md)
- [Development Guide](./development-guide-web.md)
- [Deployment Guide](./deployment-guide.md)
- [API Contracts (소비 계약)](./api-contracts-web.md)
- [Data Models (클라이언트 모델)](./data-models-web.md)

## Existing Documentation

- [README.md](../../README.md) — 설치/개발/빌드/Docker/Nginx/Apache 배포/테스트 명령
- [.github/workflows/angular-ci.yml](../../.github/workflows/angular-ci.yml) — CI 파이프라인 정의
- [docs/](../../docs/) — compodoc 자동 생성 API 문서 (수동 편집 금지, `npx @compodoc/compodoc@2.0.0 -p tsconfig.doc.json -d docs`로 재생성)
- [공식 compodoc 사이트](https://spring-petclinic.github.io/spring-petclinic-angular/)

## Getting Started

```bash
# 1. 백엔드 spring-petclinic-rest 를 :9966 에 기동
nvm use && npm ci
npm start        # http://localhost:4200
```

## AI 어시스티드 개발 가이드

- **새 CRUD 기능 추가**: `src/app/{feature}/` 폴더에 모델+서비스+모듈+라우팅+화면 4종 세트(list/add/edit/detail)를 생성 — 기존 owners/pets 구조를 템플릿으로 답습. 서비스에는 반드시 `catchError(this.handlerError(...))` 패턴 적용.
- **API 확장**: 백엔드 엔드포인트 추가 시 `src/app/{feature}/{entity}.service.ts`에 메서드 추가 + `api-contracts-web.md` 갱신. 모델 변경은 `{entity}.ts` 필드 수정.
- **주의**: `environment.prod.ts`가 localhost로 하드코딩되어 있어 배포 전 재빌드/프록시 전략 필요. `docs/`는 생성물이므로 수정 대상 아님.
- **브라운필드 PRD**: 이 index.md를 PRD 워크플로 입력으로 제공.
