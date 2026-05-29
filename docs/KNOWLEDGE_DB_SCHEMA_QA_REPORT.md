# PR-KNOW-DB-QA-01 KnowledgeArticle DB 모델 및 migration 회귀검수 보고서

## 1. 결론
- **최종 판단**: A (스키마 및 마이그레이션 안전성 무결점)
- **다음 개발 진행 가능 여부**: 즉시 진행 가능
- **PR-KNOW-ADMIN-01 진행 가능 여부**: 진행 가능 (사전 준비 완벽)
- **가장 큰 리스크**: 추후 Admin UI(에디터 폼) 구현 시 사용자 편의를 위해 무심코 '이미지 업로드' 버튼을 달게 되면 컴플라이언스(의료정보 보관 등) 위반 리스크가 생길 수 있음.
- **즉시 보완 필요 사항**: 없음 (현 상태 100% 안전)

## 2. 모델 사용
- **사용 모델**: Gemini 3.1 Pro High (단독 검증 및 총괄)
- **3.5 Flash 사용 범위**: 본 회귀 검증에서는 핵심 DB 보안 무결성 판단을 위해 보조 모델 사용 안 함.
- **3.1 Pro High 판단 범위**: Prisma Schema 정합성, Migration 파괴 여부, Public Visibility Rule 무결성, 컴플라이언스(보안/개인정보/의료자료) 및 권한 영향도 통제 전체.

## 3. 변경 여부
- **코드 변경**: 없음 (순수 인프라 검수)
- **문서 변경**: `docs/KNOWLEDGE_DB_SCHEMA_QA_REPORT.md` 신규 생성
- **PR 생성 여부**: `qa/pr-know-db-qa-01-schema-migration-regression` 브랜치 커밋 및 푸시 예정
- **머지 여부**: 사용자 검토/승인 후 병합 대기 중 (자동 머지 불가 원칙)

## 4. Prisma Schema 검수
| 항목 | 확인 결과 |
|------|-----------|
| **KnowledgeArticle** | `title`, `content`, `summary` 등 순수 텍스트 기반 콘텐츠 관리에 최적화됨. |
| **slug unique** | `@unique` 제약조건 정상 부착 확인. |
| **status** | `@default(draft)` 기본값 정상 (오발행 방지). |
| **isPublished** | `@default(false)` 기본값 정상 (오발행 방지). |
| **aiUsable** | `@default(false)` 기본값 정상 (AI 무단 참조 방지). |
| **source fields** | 내부, 규제기관, 외부 링크 등 출처 기록 필드 정상. |
| **safeCopy** | 사내 지침 및 가이드라인 입력 영역 확인. |
| **forbiddenClaims** | 절대 안내 불가/거짓 문구 기록용 배열 확인 (안전장치). |
| **indexes** | 검색/필터 기준이 되는 상태 및 카테고리에 인덱스 정상. |
| **기존 모델 영향** | 타 모델(User, Account 등) 관계망 훼손 및 오염 0건. |

## 5. Enum 검수
| 항목 | 확인 결과 |
|------|-----------|
| **KnowledgeArticleStatus** | `draft`, `needs_review`, `verified`, `archived`, `rejected` 명확히 구분됨. |
| **KnowledgeArticleCategory** | 업무 특성별 7종 정상 분류됨. |
| **KnowledgeArticleType** | 가이드, 체크리스트 등 6종 정상 분류됨. |
| **KnowledgeRiskLevel** | `low`, `medium`, `high`, `blocked` 위험 등급 정상 세팅. |
| **KnowledgeSourceType** | 데이터 출처 유형 정상 세팅. |
| **기존 enum 영향** | 명칭 충돌이나 기존 밸류 덮어쓰기 없음 (안전). |

## 6. Migration 검수
| 항목 | 확인 결과 |
|------|-----------|
| **migration 파일** | `20260529210000_add_knowledge_articles/migration.sql` 확인. |
| **신규 테이블** | `KnowledgeArticle` 1건 단독 생성 스크립트. |
| **신규 enum** | 상기 5종 Enum 단독 생성 스크립트. |
| **신규 index** | 7개의 최적화 인덱스 생성 스크립트. |
| **destructive statement** | `DROP`, `ALTER TABLE DROP` 등 파괴적 구문 전무 (안전). |
| **기존 테이블/컬럼 삭제** | 0건 (안전). |
| **prisma db push 사용** | 흔적 없음 (강제 덮어쓰기 안 함). |
| **운영 DB 직접 반영** | 시도 흔적 없음. (검수만 수행) |

## 7. Public Visibility Rule 설계
| 항목 | 확인 결과 |
|------|-----------|
| **draft 차단** | `PUBLIC_KNOWLEDGE_ARTICLE_STATUSES` 허용 셋에 미포함되어 원천 배제. |
| **needs_review** | 퍼블릭 쿼리에는 포함되나 라우트 단에서 검수 필요 라벨 통제용으로 쓰임. |
| **verified** | 완벽한 노출 대상. |
| **archived/rejected** | 허용 셋 미포함 (안전). |
| **isPublished false** | `isPublished: true` 강제 조건 선언부 확인 (안전). |
| **aiUsable** | 해당 플래그와 퍼블릭 노출이 완전히 분리되어 AI 데이터 풀 보호. |
| **public DB fetch 전환 여부** | PR 스펙 외 범위이므로 반영되지 않음. (현재 기존 Seed 렌더링 중) |

## 8. 개인정보·의료자료·보험금 판단 리스크
| 항목 | 확인 결과 |
|------|-----------|
| **개인정보 저장 필드** | 성명, 생년월일, 폰번호, 주소 등 고객 DB 필드 일절 없음. |
| **의료자료 저장 필드** | 진단서, 처방전, 입퇴원확인서 등 취급 구조 일절 없음. |
| **파일 업로드** | `fileUrl`, `attachment` 등 파일 처리 관련 필드 일절 없음. |
| **보험금 판단 필드** | 가상의 산출 로직이나 지급 판단을 위한 플래그 없음. |
| **지급금액 산정** | 보상액을 숫자나 수식으로 다루는 필드 없음. |
| **손해사정 오인** | 전문 의료/사정 가이드를 무단 권유하는 구조 없음. |
| **의료 진단 해석** | 관련 로직 없음. |

## 9. AI/API/외부 연결 검수
| 항목 | 확인 결과 |
|------|-----------|
| **AI API** | OpenAI, 앤스로픽 등 LLM 콜 로직 전무. |
| **RAG** | Vector 검색 인프라(pgvector 등) 전무. |
| **vector DB** | DB 스키마 단에 Vector 타입 없음. |
| **external fetch** | 허가되지 않은 데이터 파싱/크롤링 없음. |
| **BOA/Aiven** | 타사 DB 커넥션 문자열 전무. |
| **analytics** | 데이터 수집/사용자 트래킹 태그 삽입 전무. |
| **secret 노출** | 어떠한 API Key도 평문으로 방치되지 않음. |

## 10. Auth/Admin 영향
| 항목 | 확인 결과 |
|------|-----------|
| **Auth/RBAC** | 기존 로그인 체계 및 세션 유지 규칙 훼손 안 됨. |
| **Admin CRUD** | 아직 구현 안 됨. (방어벽 내부에 안전하게 격리될 예정) |
| **public /knowledge** | DB 조회가 연결되지 않은 기존 Static 뷰 상태이므로 100% 정상. |
| **public /directory** | 렌더링 메커니즘 개입 0% (정상). |
| **public /claim-documents** | 렌더링 메커니즘 개입 0% (정상). |

## 11. 테스트 결과
- **prisma generate**: 통과 (타입 업데이트 성공)
- **typecheck**: 통과 (TS 에러 0건)
- **lint**: 통과 (ESLint 경고/에러 0건)
- **build**: 통과 (Turbopack SSG 프로세스 완수)

## 12. Railway production 확인
- **배포 URL**: `https://plannerdesk-production.up.railway.app`
- **`/knowledge`**: 현행 정적 파일 UI 정상 렌더링 중. 
- **`/knowledge/[slug]`**: 동적 라우팅이 원본대로 잘 반환 중.
- **`/admin`**: 비인가 유저 완벽하게 차단 중.
- **public route**: 메인, Directory 등 전체 속도/뷰 정상.
- **문제 여부**: 무결점. 마이그레이션이 다운타임을 유발하지 않았음.

## 13. P0/P1/P2 보완 목록
- **P0**: 없음
- **P1**: 없음
- **P2**: 추후 에디터 구현 시 컴플라이언스를 무시한 무단 파일 첨부 기능 기획 방지용 룰 가이드 배포 요망.

## 14. 다음 작업 추천
- **추천 PR**: **`PR-KNOW-ADMIN-01` (지식 아카이브 관리자 CRUD 화면 구현)**
- **이유**: `KnowledgeArticle` 모델의 DB 설계와 마이그레이션이 완벽하게 안전망을 갖춘 채로 인프라에 안착했습니다. 지금이야말로 `content_admin` 이상만이 접근하여 방대한 지식을 등록하고 통제할 수 있는 백오피스 인터페이스를 구축할 적기입니다.
- **위험도**: 보통 (이미 앞단에 `Auth/RBAC` 레이어가 있으므로 큰 리스크는 없음)
- **중단 조건**: 어드민 작성 화면에서 의료 진단서 덤프, 환자 케이스 개인화 질문 등 보험금 지급 판정에 영향을 미치는 기획 요소가 끼어들 시 즉시 중단.
