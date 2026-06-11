# PR-BS-07 PWA Install UX Review

## 1. 목적

설계사가 모바일에서 PlannerDesk를 반복 방문할 때 **홈화면 추가·재방문 UX**를 안전하게 안내하고, PWA 도입 전 현재 구조를 문서화한다. 앱스토어 배포·네이티브 전환·service worker 캐시는 범위 밖이다.

## 2. 이번 PR의 범위

- PWA/manifest/metadata/service worker **현황 조사**
- 설치 안내 copy·접이식 UI (`lib/pwa/install-ux-copy.ts`, `HomeScreenInstallNotice`)
- public home·planner work-tools(인증 후) 안내 카드
- 정적 테스트·본 문서

## 3. 이번 PR에서 하지 않는 것

- `app/manifest.ts` / `public/manifest.json` 신규 생성
- favicon·apple-touch-icon asset 추가 (현재 repo에 브랜드 icon 파일 없음)
- service worker·offline cache·push notification
- `beforeinstallprompt` 자동 호출·강제 install prompt
- analytics·개인정보 수집 추가
- Auth/RBAC·public visibility guard 변경
- package.json / lockfile / DB schema 변경

## 4. 현재 PWA 구조 조사

| 항목 | 현재 상태 |
| --- | --- |
| `app/manifest.ts` | **없음** |
| `public/manifest.json` | **없음** |
| `app/layout.tsx` metadata | title·description·openGraph·metadataBase만 존재 |
| theme_color / viewport PWA | **미설정** |
| `public/icons/*` | **없음** (favicon·apple-icon 미확인) |
| service worker | **없음** (`serviceWorker`·`beforeinstallprompt` 코드 없음) |
| install prompt | **없음** → 이번 PR은 안내형 copy만 |

## 5. 홈화면 추가 UX 기준

- 브라우저 메뉴 기반 **수동** 홈화면 추가 안내
- 로그인·권한 기준 유지 명시
- 고객정보·상담 원문 미저장 안내
- 오프라인·푸시 미제공 명시
- planner 로그인 시 즐겨찾기·최근 업무와 연계 안내 (권한 우회 없음)

## 6. Public / Planner / Admin 노출 기준

| 기능 | Public | Planner | Admin |
| --- | --- | --- | --- |
| 홈화면 추가 안내 | O | O | O |
| PWA 설치 안내 | O (일반) | O (+ 반복 업무 힌트) | O |
| Work Tools 바로가기 암시 | X | work-tools 페이지 내 안내만 | — |
| Answer Assistant 바로가기 암시 | X | X | — |
| Admin 바로가기 | X | X | O |

## 7. Manifest / Metadata 검토 기준 (후속 PR)

후속 manifest PR 시:

| 항목 | 기대 |
| --- | --- |
| `start_url` | `/` (public 홈) |
| `scope` | `/` — admin/planner/work-tools를 start_url로 쓰지 않음 |
| `icons` | **자체 브랜드 asset 준비 후** 추가 |
| `description` | 과장·기능 확정·보험금 판단 표현 금지 |

현재 `app/layout.tsx` description은 기존 랜딩 copy이며 이번 PR에서 변경하지 않는다.

## 8. 설치 안내 문구 기준

허용: `lib/pwa/install-ux-copy.ts` — 홈화면 추가 가능, 브라우저별 차이, 권한 유지, PII 미저장.

금지: `PWA_INSTALL_FORBIDDEN_PHRASES` — 앱 설치 완료·오프라인 최신 보장·무로그인 설계사 기능·AA/Work Tools 무제한 사용·고객정보 저장 유도.

## 9. Service Worker / Cache No-Go 기준

- service worker 신규 구현 금지 (이번 PR)
- offline cache·push notification 금지
- install prompt 강제 실행 금지
- 캐시 전략 변경은 **별도 Codex 제한검수 PR**

## 10. 테스트 기준

- `tests/ops/pwa-install-ux.test.ts` — 구조 조사·SW 없음·UI 연결
- `tests/public/pwa-copy-safety.test.ts` — 금지 문구·권한 우회 표현
- `tests/ops/manifest-safety.test.ts` — manifest 미존재·위험 start_url 없음

## 11. 후속 PR 후보

| PR | 내용 |
| --- | --- |
| PR-BS-07-B | 자체 브랜드 icon asset + `app/manifest.ts` (start_url `/`) |
| PR-BS-07-C | service worker·offline (Codex 제한검수 필수) |
| PR-135 연계 | 홈화면 + 즐겨찾기 반복 사용 UX |

## 12. 최종 결론

PlannerDesk는 **아직 PWA manifest·service worker가 없다**. PR-BS-07은 **안내형 홈화면 추가 UX**와 **No-Go·후속 조건 문서화**로 반복 방문 UX를 안전하게 개선한다. 실제 PWA shell은 icon asset과 manifest 전용 후속 PR로 분리한다.
