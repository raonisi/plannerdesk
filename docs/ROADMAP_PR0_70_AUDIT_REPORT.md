# PlannerDesk PR0~70 전체 개발 현황 실사 보고서

## 1. 결론

* 전체 진행률: 약 65% (핵심 기능 및 MVP 골격 완성)
* 완료 PR/기능군 수: 10개 이상 (보험사/청구서류/지식문서 DB, Auth, Admin 권한/Bulk/대시보드 등)
* 부분 완료 PR 수: 2개 (공시·약관, 고객 안내 문구 - Public은 정적 렌더링, Admin은 라우트만 열림)
* 미완료 PR 수: 다수 (커뮤니티, 설계사 Q&A, AI 답변 보조 등 Phase 3~4 기능)
* 재설계 필요 PR 수: 1개 (Correction Request - Client-only 임시안보다는 DB 기반 정식 플로우로 통합 요망)
* 보류 PR 수: 다수 (보험금 산출 로직, 의료자료 직접 업로드 등 안전·컴플라이언스 리스크가 큰 기능)
* 즉시 수정 필요 P0: 없음 (현재 main 브랜치 및 Production 안정성 확보)
* 다음 개발 추천: `DisclosureLinks` 및 `MessageTemplates`의 DB 스키마 도입 및 관리자 CRUD 활성화

## 2. 현재 production 상태

| Route | 상태 | 문제 여부 | 근거 |
|---|---|---|---|
| `/` (홈) | 200 정상 | 없음 | SSR 및 정적 에셋 로드 완료, Unified Search 정상 노출 |
| `/directory` | 200 정상 | 없음 | Insurer DB 연동 완료, 클라이언트 즐겨찾기 정상 |
| `/claim-documents` | 200 정상 | 없음 | ClaimDocument DB 연동 완료 |
| `/work-tools` | 200 정상 | 없음 | 정적 데이터 및 클라이언트 계산기 작동 중 |
| `/disclosure-links` | 200 정상 | 없음 | 정적 데이터 기반 목록 렌더링 정상 |
| `/message-templates` | 200 정상 | 없음 | 정적 데이터 기반 렌더링 정상 |
| `/knowledge` | 200 정상 | 없음 | KnowledgeArticle DB 연동 완료 |
| `/admin` | 401/200 정상 | 없음 | 미인증 시 로그인 리다이렉트, 권한 검증 정상 |
| `/admin/insurers` | 200 정상 | 없음 | DB CRUD 및 Bulk 검수 작동 완료 |
| `/admin/knowledge` | 200 정상 | 없음 | DB CRUD, Import 스크립트 및 Bulk 작동 완료 |

## 3. 기능별 구현 현황

| 기능 | public 화면 | admin 화면 | DB | 권한 | 배포 | 상태 | 근거 |
|---|---|---|---|---|---|---|---|
| 보험사 디렉토리 | 정상 | 정상 (CRUD+Bulk) | `Insurer` 완료 | 적용 | 완료 | 완료 | `app/directory`, `schema.prisma` |
| 청구서류 관리 | 정상 | 정상 (CRUD+Bulk) | `ClaimDocument` 완료 | 적용 | 완료 | 완료 | `app/claim-documents`, `schema.prisma` |
| 주요업무링크 | 정상 | 없음 (기획 외) | 없음 (정적) | 없음 | 완료 | 완료 | `app/work-tools` 정적 파일 |
| 지식 아카이브 | 정상 | 정상 (CRUD+Bulk) | `KnowledgeArticle` 완료 | 적용 | 완료 | 완료 | `app/knowledge`, DB 마이그레이션 적용됨 |
| 공시·약관 링크 | 정상 (정적) | 라우트만 (준비중) | 없음 | 적용 | 완료 | 부분 완료 | `app/admin/disclosure-links` 준비 중 상태 |
| 고객 안내 문구 | 정상 (정적) | 라우트만 (준비중) | 없음 | 적용 | 완료 | 부분 완료 | `app/admin/message-templates` 준비 중 상태 |
| 커뮤니티 / Q&A | 없음 | 없음 | 없음 | 없음 | 없음 | 미완료 | 기획 단계 보류 |
| AI 답변 보조 | 없음 | 없음 | 없음 | 없음 | 없음 | 보류 | 선행 정책 필요 |

## 4. PR0~70 개발 현황 매트릭스

| PR / 작업군 | 작업명 | 계획 목표 | 실제 구현 상태 | main 반영 | Prod 배포 | 상태 분류 | 근거 | 후속 조치 |
|---|---|---|---|---|---|---|---|---|
| PR-35 | Correction Request | 클라이언트 기반 수정 요청 MVP | 구현 안 됨 | 아니오 | 아니오 | 재설계 필요 | `PRODUCT_ROADMAP.md` | DB 기반 정식 플로우로 재설계 |
| PR-37~39 | ClaimDocument DB/CRUD | 청구서류 DB 연결 및 관리자 화면 | DB, 관리자, Public 연결 완료 | 예 | 예 | 완료 | `schema.prisma`, `app/admin/claim-documents` | 유지보수 |
| PR-40 | 운영 안정성 QA | MVP 배포 점검 및 Railway 설정 | 적용 완료 | 예 | 예 | 완료 | `docs/RAILWAY_HARDENING.md` | 패스 |
| Auth/RBAC | 권한 및 인증 | Google OAuth, Admin 권한 가드 | Auth.js, Super/Content Admin | 예 | 예 | 완료 | `app/api/auth`, `lib/auth` | 패스 |
| Knowledge DB | 지식문서 아카이브 | 지식문서 CRUD, Import, DB | 완료 | 예 | 예 | 완료 | `KnowledgeArticle` 모델 | 패스 |
| Bulk Actions | 관리자 일괄 작업 | 공통 Bulk 기반 및 도메인별 적용 | 3개 도메인 완료, 2개 준비중 | 예 | 예 | 부분 완료 | `dashboard-status.ts` | 2개 도메인 활성화 대기 |
| Dashboard UX | 관리자 대시보드 | 상태 라벨링, 오류 방지 UX 고도화 | 적용 완료 | 예 | 예 | 완료 | `AdminShell.tsx` | 패스 |
| Disclosure DB | 공시·약관 DB화 | 공시/약관 DB 모델 및 관리자 | 정적 렌더링 유지 | 아니오 | 아니오 | 미완료 | DB 스키마 누락 | 신규 PR 배정 |

## 5. 완료된 핵심 기능

* **보험사 디렉토리**: 보험사 정보 조회, 관리자 CRUD, 일괄 검수 및 게시(Bulk Publish), 권한/검수 상태 분리 로직 완전 구동.
* **청구서류**: 카테고리별/보험사별 서류 분류, DB 조회, Draft 비노출 보안 처리.
* **주요업무링크**: 클라이언트 계산기 10종 및 정적 링크 집합 완성.
* **Auth/Admin**: Google OAuth 세션 기반 인증 및 `super_admin`, `content_admin` Role 적용 완료.
* **KnowledgeArticle**: DB 스키마 완료, 초안 30개 Import 스크립트 작성 및 배포 성공, Public SSR 노출 연동.
* **Bulk 기능**: 보험사, 청구서류, 지식아카이브에 대한 선택적 검수/공개/보관 일괄 처리 완비.
* **관리자 UX**: 사용 가능/설정 필요/준비 중 상태 표출 로직 및 빈 화면, 에러 핸들링 폴백 완료.

## 6. 부분 완료 기능

* **공시·약관 (Disclosure Links)**: Public 화면은 정적 데이터(`lib/content`)로 정상 서비스 중이나, 관리자 화면은 뼈대(UI)만 있고 저장 및 DB 구조가 미완성입니다. 후속 DB 스키마 연동 PR이 필요합니다.
* **고객 안내 문구 (Message Templates)**: Public 화면 서비스 중이나, 관리를 위한 DB 모델 부재. 위험 문구/의료 요청 필터링 등 보안 정책 로직 구현을 위한 백엔드 PR이 필요합니다.

## 7. 미완료 기능

* 커뮤니티 (Planner Community)
* 설계사 Q&A 포럼
* 실무 노하우(UGC) 공유
* 지식 아카이브 기반 AI 답변 보조 체계
* CorrectionRequest (수정 요청 처리) 관리자 큐

## 8. 재설계 필요 기능

* **CorrectionRequest**: 원래 PR-35에서 DB 없는 Client-only 복사본 형태로 기획되었으나, 확장성과 관리 편의를 위해 "정식 DB 큐(Queue) 모델"을 통한 편집자 검수 워크플로우로 방향을 재설정하는 것이 바람직합니다.

## 9. 안전성 검수

* **Auth/RBAC**: Server Actions 단에서 권한 확인 로직 정상 가동.
* **public visibility**: `isPublished=false` 및 `status=draft` 레코드는 DB Query에서 안전하게 필터링됨.
* **개인정보/의료자료/파일 업로드**: 관련 스키마가 존재하지 않으며 기능이 원천 차단되어 안전.
* **보험금 판단/손해사정 오인**: 정책 UI 가이드(안전문구) 적용 완료.
* **AI/RAG/vector**: 미적용 (안전).
* **secret/env**: UI 및 Error Boundary에서 시스템 내부 스택 노출 차단 성공.

## 10. 남은 개발 우선순위

* **P0**: (없음) 현재 Production 치명적 결함 및 보안 리스크 제로 상태.
* **P1 (운영 기능 미완성 보완)**: 
  * `DisclosureLink` DB 스키마 적용 및 관리자 CRUD 활성화
  * `MessageTemplate` DB 스키마 적용 및 위험 문구 필터링 구현
* **P2 (UX/품질)**: 
  * Public 지식 아카이브 통합 검색 및 필터 강화
  * 관리자 수정 요청(Correction Request) DB Queue 파이프라인 개발
* **P3 (확장 및 고도화)**: 
  * 설계사 인증 기반 커뮤니티 모델 기획
  * 승인된 지식 기반 AI/RAG 참조 엔진

## 11. 새 개발계획 제안

* **PR-71**: [DB/Admin] Add `DisclosureLink` DB model and admin CRUD
  * 목표: 정적 공시/약관 데이터를 PostgreSQL로 마이그레이션.
  * 위험도: 낮음
  * 선행 조건: 없음
  * 검수 모델: 3.1 Pro High (스키마, 마이그레이션 검토)
* **PR-72**: [DB/Admin] Add `MessageTemplate` DB model and policy guards
  * 목표: 고객 문구 데이터 DB화 및 금지 표현 필터 적용.
  * 위험도: 중간 (금지 표현 정책)
  * 선행 조건: 없음
  * 검수 모델: 3.1 Pro High
* **PR-73**: [Feature] Add `CorrectionRequest` DB queue
  * 목표: 클라이언트 복사가 아닌 사내 큐 방식의 정보 수정 요청 창구 구축.
  * 위험도: 낮음
  * 선행 조건: PR-71, 72 완료
  * 검수 모델: 3.5 Flash High
* **PR-74**: [Public] Implement Global Search & Filters
  * 목표: 보험사, 서류, 지식을 아우르는 통합 검색(Elastic 또는 Postgres Full-text) 도입.
  * 위험도: 중간 (쿼리 최적화)
  * 선행 조건: 없음
  * 검수 모델: 3.1 Pro High
* **PR-75**: [Auth/Community] Introduce Planner Verification Flow
  * 목표: 익명 사용자와 인증 설계사를 분리하기 위한 인증 스키마 개발.
  * 위험도: 높음 (개인정보보호)
  * 선행 조건: 정책 팀의 데이터 보관 정책 확정
  * 중단 조건: 정책 가이드라인 미비 시

## 12. 다음 5개 PR 추천

1. **PR-71**: 공시/약관 데이터 모델(DisclosureLink) 도입 및 관리자 기능 활성화
2. **PR-72**: 고객 문구 템플릿(MessageTemplate) 도입 및 보험금 오인 방지 가드레일 개발
3. **PR-73**: 정식 수정 요청 큐(CorrectionRequest) 구축 및 관리자 인박스 개발
4. **PR-74**: Public 플랫폼 전역 통합 검색 로직 및 UI 개선
5. **PR-75**: 보험설계사 자격 인증 모델(Verification Flow) 기초 스키마 설계

## 13. 최종 판단

* **지금 바로 개발 가능한 항목**: `DisclosureLink`, `MessageTemplate` DB 구조화 (PR-71, PR-72).
* **먼저 안정화해야 할 항목**: 없음 (현재 DB 및 Auth 구조 매우 안정적).
* **보류해야 할 항목**: 커뮤니티 글쓰기, 고객 서류 직접 업로드, AI 답변 생성.
* **사용자 승인 필요한 항목**: PR-71, PR-72 진행 착수 승인.
