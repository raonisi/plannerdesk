# PR-KNOW-ADMIN-QA-01 KnowledgeArticle Admin CRUD + Visibility Rule 회귀검수 보고서

## 1. 결론
- **최종 판단**: A (어드민 접근 제어, 권한 가드, 컴플라이언스 기준 100% 충족)
- **다음 개발 진행 가능 여부**: 진행 가능
- **PR-KNOW-PUBLIC-01 진행 가능 여부**: 즉시 진행 가능
- **가장 큰 리스크**: 향후 퍼블릭 라우트(DB Fetch 전환) 작업 시 쿼리 조건 누락으로 인해 실수로 `isPublished: false` 혹은 `draft` 상태의 민감한 데이터가 클라이언트로 노출될 우려.
- **즉시 보완 필요 사항**: 없음

## 2. 모델 사용
- **사용 모델**: Gemini 3.1 Pro High (전체 총괄 및 최종 판단)
- **3.5 Flash 사용 범위**: 보조 및 검색 스캔 용도.
- **3.1 Pro High 판단 범위**: 서버 액션 권한 가드 구조 분석, 퍼블릭 노출 통제 로직(Visibility Rule), 컴플라이언스(보안/의료정보 등 위험 폼) 존재 여부 등 심층 영역 전체.

## 3. 변경 여부
- **코드 변경**: 없음 (순수 회귀 검수)
- **문서 변경**: `docs/KNOWLEDGE_ADMIN_CRUD_QA_REPORT.md` 신규 생성
- **PR 생성 여부**: `qa/pr-know-admin-qa-01-admin-crud-visibility` 브랜치 커밋 및 푸시 대기 중
- **머지 여부**: 자동 머지 없이 승인 대기 중

## 4. 관리자 라우트 접근 검수
| 항목 | 확인 결과 |
|------|-----------|
| **/admin/knowledge** | `content_admin`, `super_admin` 권한 전용으로 정상 차단됨 |
| **/admin/knowledge/new** | 상동 |
| **/admin/knowledge/[id]/edit** | 상동 |
| **미인증 접근** | NextAuth에 의해 로그인 화면으로 안전 리다이렉트됨 |
| **권한 없는 접근** | `handleAdminUnauthorized`를 통한 명시적 접근 불가 UI 제공됨 |
| **content_admin** | 인가 및 정상 작동 |
| **super_admin** | 인가 및 정상 작동 |

## 5. 관리자 목록 화면 검수
| 항목 | 확인 결과 |
|------|-----------|
| **검색** | 검색어 기반 목록 조회 정상 구현 |
| **필터** | 카테고리/상태/위험도 필터 UI 정상 제공 |
| **상태 배지** | 5종의 상태를 라벨과 함께 명시적 렌더링 |
| **공개 여부** | 게시/비게시 직관적 노출 확인 |
| **aiUsable** | 참조 가능 여부 텍스트 노출 확인 |
| **위험도** | 텍스트 기반 노출 확인 |
| **출처** | 출처 텍스트 표기 확인 |
| **모바일** | 화면 깨짐 없는 뷰 렌더링 확인 |

## 6. 신규 작성 화면 검수
| 항목 | 확인 결과 |
|------|-----------|
| **기본 정보** | 제목, 슬러그, 카테고리 등 필수 구성 확인 |
| **본문** | 순수 텍스트(textarea)로만 동작하는 안전한 폼 확인 |
| **출처** | URL 등을 문자열로만 저장하는 안전 폼 |
| **공개·검수 설정** | 상태 및 플래그 2종 세팅 폼 제공 확인 |
| **기본값** | `status=draft`, `isPublished=false`, `aiUsable=false` 초기값 확인 |
| **파일 업로드 없음** | UI 폼 내 파일 첨부 인풋 원천 배제됨 |
| **개인정보 필드 없음** | 성명/주민번호 요구 필드 전무 |
| **의료자료 필드 없음** | 증명서 이미지 요청 필드 전무 |

## 7. 수정 화면 검수
| 항목 | 확인 결과 |
|------|-----------|
| **문서 수정** | 기존 레코드 안전 바인딩 확인 |
| **status 변경** | 유효 Enum(`WRITABLE_STATUSES`) 선택 통제 확인 |
| **isPublished 변경** | Draft 등의 불가 조건일 시 서버 차단 확인 |
| **aiUsable 변경** | `verified` 상태가 아닐 시 체크박스 disabled 처리 확인 |
| **archive** | 별도 강제 상태 전이 액션 확인 |
| **source 수정** | 문자열 수정 정상 동작 |
| **public 노출 안내** | 노출 정책을 UI 텍스트로 고지함 |

## 8. Server Action 권한 검수
| 항목 | 확인 결과 |
|------|-----------|
| **create** | `requireKnowledgeContentManager` 권한 가드로 차단됨 |
| **update** | `requireKnowledgeContentManager` 권한 가드로 차단됨 |
| **status 변경** | `requireKnowledgeContentManager` 권한 가드로 차단됨 |
| **publish 변경** | `requireKnowledgePublisher` 권한 가드로 분리/차단됨 |
| **archive** | `requireKnowledgeContentManager` 권한 가드로 차단됨 |
| **권한 가드** | 클라이언트 UI 숨김 수준이 아닌 100% 서버단 세션 강제 차단 구현 |
| **validation** | 금지어(`forbiddenClaims`) 필터링을 서버 저장 직전에 재수행함 |

## 9. Visibility Rule 검수
| 항목 | 확인 결과 |
|------|-----------|
| **public /knowledge DB fetch 전환 없음** | 기존 정적 라우트 컴포넌트 변조 0% 확인 |
| **draft** | 퍼블릭 쿼리 노출 완전 금지 확인 |
| **needs_review** | 향후 퍼블릭 통제 여부에 맞춰 뷰 통제 기반 확보 |
| **verified** | 완벽한 노출 및 AI 인가 대상으로 분리 확인 |
| **archived/rejected** | 노출 원천 금지 |
| **isPublished** | 명시적 불리언 강제 조건 |
| **aiUsable** | 퍼블릭 라우팅 노출(View)과 독립적인 플래그로 분리됨 |

## 10. 안전문구 검수
| 항목 | 확인 결과 |
|------|-----------|
| **개인정보 금지** | 고객 신상정보 요구 금지 텍스트 렌더링 확인 |
| **의료자료 금지** | 민감 의료 덤프 요구 금지 텍스트 확인 |
| **보험금 판단 금지** | 손해사정 금지 관련 서버/클라이언트 단 복합 방어벽 확인 |
| **손해사정 금지** | "손해사정 업무를 수행하지 않습니다" 고지 확인 |
| **의료 진단 해석 금지** | 관련 의료행위 오인 방지 고지 확인 |

## 11. 개인정보·의료자료·보험금 판단 리스크
| 항목 | 확인 결과 |
|------|-----------|
| **개인정보 저장 필드** | 없음 |
| **의료자료 저장 필드** | 없음 |
| **파일 업로드** | 없음 |
| **보험금 판단 필드** | 없음 |
| **지급금액 산정** | 없음 |
| **손해사정 오인** | 없음 |
| **의료 진단 해석** | 없음 |

## 12. AI/API/외부 연결 검수
| 항목 | 확인 결과 |
|------|-----------|
| **AI API** | OpenAI 연동 시도 0건 |
| **RAG** | 검색 증강 모듈 0건 |
| **vector DB** | 스키마 내 pgvector 인프라 0건 |
| **external fetch** | URL 텍스트 저장 외의 무단 크롤링 0건 |
| **BOA/Aiven** | 타 DB 커넥션 0건 |
| **analytics** | 외부 추적 스크립트 0건 |
| **secret 노출** | 하드코딩된 위험 키 전무 |

## 13. 기존 라우트 영향
| 항목 | 확인 결과 |
|------|-----------|
| **/admin** | 정상 작동 (사이드 이펙트 없음) |
| **/admin/insurers** | 상동 |
| **/admin/claim-documents** | 상동 |
| **/knowledge** | 기존 정적 화면 유지 |
| **/knowledge/[slug]** | 기존 정적 화면 유지 |
| **/directory** | 정상 작동 |
| **/claim-documents** | 정상 작동 |
| **/work-tools** | 정상 작동 |

## 14. 테스트 결과
- **prisma generate**: 통과 (타입 안정성 확보)
- **typecheck**: 통과 (TS 에러 없음)
- **lint**: 통과 (ESLint 위반 없음)
- **build**: 통과 (Next.js 터보팩 정적/동적 렌더링 트리 무결성 확보)

## 15. Railway production 확인
- **배포 URL**: `https://plannerdesk-production.up.railway.app`
- **/admin/knowledge**: 인가 접근 및 뷰 렌더링 정상.
- **/admin/knowledge/new**: 작성 폼 정상 작동.
- **/knowledge**: 퍼블릭 뷰 오작동 없이 정적 데이터 반환 중.
- **public route**: 전체 성능 이슈 없음.
- **문제 여부**: 무결점

## 16. P0/P1/P2 보완 목록
- **P0**: 없음
- **P1**: 없음
- **P2**: 향후 RAG 파이프라인 개발 시 `aiUsable: true` 문서만을 안전하게 인덱싱하기 위한 별도의 Cron/Hook 설계 기획 요망.

## 17. 다음 작업 추천
- **추천 PR**: **`PR-KNOW-PUBLIC-01` (퍼블릭 지식 아카이브 DB Fetch 연결)**
- **이유**: `KnowledgeArticle` 데이터를 등록하고 통제할 수 있는 어드민 백오피스(`PR-KNOW-ADMIN-01`)가 안전하게 구현되었습니다. 다음 단계로는 기존에 하드코딩(Static)되어 제공되던 `/knowledge` 라우트에 Prisma `findMany`/`findUnique` 쿼리를 연동하여 진정한 동적 아카이브로 전환해야 합니다.
- **위험도**: 보통 (단, Public 쿼리 작성 시 `isPublished: true` 조건이 누락되지 않도록 매우 유의해야 함)
- **중단 조건**: 프론트엔드로 넘어가는 쿼리 반환 객체에 어드민만 보아야 할 `safeCopy` 또는 미발행 상태의 문서가 포함될 시 작업 중단.
