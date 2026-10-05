# Project Overview — Spring Petclinic Angular

## 프로젝트 목적

Spring Petclinic(수의 클리닉 데모 시스템)의 **Angular 프론트엔드 SPA**. 소유자·펫·방문·수의사 및 마스터 데이터(펫 종류, 전문 분야)의 관리 화면을 제공하며, 모든 데이터 조작은 외부 REST 백엔드 [spring-petclinic-rest](https://github.com/spring-petclinic/spring-petclinic-rest) (`http://localhost:9966/petclinic/api/`)에 위임한다. **클라이언트 전용** — 서버 로직/DB/인증 없음.

## 기술 스택 요약

| 항목 | 값 |
|------|-----|
| 프레임워크 | Angular 22.1 (NgModule 아키텍처) |
| 언어 | TypeScript 6.0.3 / Node.js 24.x |
| UI | Angular Material 22 + Bootstrap 5.3 |
| 데이터 | RxJS 7.8 Observable + HttpClient (REST/JSON) |
| 테스트 | Vitest(jsdom) 단위 + Playwright E2E |
| CI/CD | GitHub Actions + Docker(node build → nginx serve) |

## 아키텍처 분류

- **저장소 유형**: monolith (1 part: `web`)
- **프로젝트 타입**: web (SPA 클라이언트)
- **패턴**: Feature-Module 레이어링 — app 셸 → 7개 기능 모듈 → 6개 REST 서비스 → HttpClient → 외부 백엔드
- **상태 관리**: 전역 스토어 없음 (컴포넌트 로컬 상태 + 서비스 호출)

## 산출 문서 안내

| 문서 | 내용 |
|------|------|
| [architecture.md](./architecture.md) | 아키텍처 종합 (레이어 다이어그램, 테스트/배포 전략, 주목점) |
| [source-tree-analysis.md](./source-tree-analysis.md) | 주석 디렉터리 트리, 엔트리 포인트, 통합 지점 |
| [component-inventory-web.md](./component-inventory-web.md) | UI 컴포넌트 22개 목록 |
| [api-contracts-web.md](./api-contracts-web.md) | 소비하는 REST 엔드포인트 30개 계약 |
| [data-models-web.md](./data-models-web.md) | 클라이언트 모델 6종과 관계 |
| [development-guide-web.md](./development-guide-web.md) | 개발 환경·명령어·테스트 |
| [deployment-guide.md](./deployment-guide.md) | Docker/Nginx/Apache 배포, CI 파이프라인 |

## 시작하기 (Getting Started)

```bash
# 1. 백엔드 선행 기동 (spring-petclinic-rest, :9966)
# 2. 프론트엔드
nvm use && npm ci
npm start          # http://localhost:4200
```

자세한 절차는 [development-guide-web.md](./development-guide-web.md) 참조.
