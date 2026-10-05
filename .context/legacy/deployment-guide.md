# Deployment Guide — Spring Petclinic Angular

## 인프라 요구 사항

- 정적 파일 서빙만 가능하면 됨 (Node 런타임 불필요 — 빌드 산출물은 `dist/` 정적 번들).
- SPA 라우팅 지원: 존재하지 않는 경로는 `index.html`로 리라이트 필요.
- 백엔드 접근성: 브라우저에서 `REST_API_URL`(현행 `http://localhost:9966/petclinic/api/`)에 도달 가능해야 함 — **prod 환경 파일도 localhost로 하드코딩되어 있으므로** 실제 배포 시 리버스 프록시 또는 environment 재빌드 전략 필요.

## 1) Docker 배포 (Dockerfile)

multi-stage 빌드:

```
Stage 1 (build):   node:24-alpine → npm ci → ng build --configuration production → /workspace/dist
Stage 2 (runtime): nginx:1.17.6 → dist/ 를 /usr/share/nginx/html 로 복사
                   listen 80 → 8080 치환, 비root 'nginx' 사용자, healthcheck(nginx status)
```

```bash
docker build -t spring-petclinic-angular:latest .
docker run --rm -p 8080:8080 spring-petclinic-angular:latest   # http://localhost:8080
```

- `NPM_REGISTRY` 빌드 ARG로 사내 레지스트리 주입 가능.
- `DOCKER_HUB`, `NGINX_VERSION`, `NODE_VERSION` ARG로 베이스 이미지 교체 가능.

## 2) Nginx 수동 배포 (README 기준)

1. `ng build --prod --base-href=/petclinic/ --deploy-url=/petclinic/`
2. `/usr/share/nginx/html/petclinic` 디렉터리 생성 후 `dist/` 복사
3. `nginx.conf`에 location 블록 추가:
   ```nginx
   location /petclinic/ {
     alias /usr/share/nginx/html/petclinic/dist/;
     try_files $uri$args $uri$args/ /petclinic/index.html;   # SPA 리라이트
   }
   ```
4. `nginx -s reload` → `http://server_name/petclinic/`

## 3) Apache 수동 배포 (README 기준)

1. 동일 빌드(`--base-href=/petclinic/ --deploy-url=/petclinic/`) 후 `/var/www/html/petclinic`에 복사
2. `httpd.conf`의 `<Directory /var/www/html>`에서 `AllowOverride All` 로 변경
3. `/var/www/html/petclinic/.htaccess` 작성:
   ```apache
   RewriteEngine On
   RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
   RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
   RewriteRule ^ - [L]
   RewriteRule ^ index.html
   ```
4. `systemctl restart httpd`

## CI/CD 파이프라인 (GitHub Actions)

`.github/workflows/angular-ci.yml` — 트리거: `master` branch push / pull_request

| 순서 | 단계 | 명령 |
|------|------|------|
| 1 | 체크아웃 + Node 24 설정 (actions/checkout@v5, setup-node@v5, npm cache) | — |
| 2 | 의존성 설치 | `npm ci` |
| 3 | 프로덕션 빌드 | `npm run build -- --configuration production` |
| 4 | 린트 | `npm run lint` |
| 5 | 단위 테스트 | `npm run test:ci` |
| 6 | Playwright 브라우저 설치 | `npx playwright install --with-deps` |
| 7 | E2E | `npm run e2e` |

모든 단계 실패 시 PR 병합 차단 (단, branch protection 설정은 저장소 설정에 따름).

## 배포 전 체크리스트

- [ ] `environment.prod.ts`의 `REST_API_URL`이 실제 백엔드 주소와 일치하는가? (현행 localhost 하드코딩 — 리버스 프록시 경로로 통일할 것)
- [ ] `--base-href`/`--deploy-url`이 배포 서브경로와 일치하는가?
- [ ] SPA 리라이트(try_files/.htaccess) 설정 확인
- [ ] CI 7단계 그린 확인
