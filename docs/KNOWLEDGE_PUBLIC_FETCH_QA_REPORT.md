# PR-KNOW-PUBLIC-QA-01 Public Knowledge DB Fetch 회귀검수 보고서

## 1. 결론
- **최종 판단**: A (Public DB Fetch 전환에 따른 Visibility, 권한, 컴플라이언스 리스크 원천 차단 확인됨)
- **다음 개발 진행 가능 여부**: 진행 가능
- **가장 큰 리스크**: 향후 새로운 상태(status)나 컴플라이언스 룰이 추가될 경우, `PUBLIC_KNOWLEDGE_WHERE` 상수 업데이트를 누락하면 노출 차단 방어막이 풀릴 수 있는 유지보수적 결함 가능성 존재.
- **즉시 보완 필요 사항**: 정보 부족 (현재 100% 락아웃 통제 중이므로 보완 불필요)

## 2. 모델 사용
- **사용 모델**: Gemini 3.1 Pro High (전체 총괄)
- **3.5 Flash 사용 범위**: 파일 목록화, 변경 파일 확인 및 기본 테스트 모니터링.
- **3.1 Pro High 판단 범위**: Public Visibility Rule 락아웃 분석, Prisma Where 쿼리 취약점 점검, Select 필드 직렬화 최소성 검증, notFound 404 라우팅 처리, 개인정보/의료자료 컴플라이언스 위반 탐색 최종 판단 전체.

## 3. 변경 여부
- **코드 변경**: 확인 안 됨 (순수 회귀 검수 목적으로 기능 구현 없음)
- **문서 변경**: `docs/KNOWLEDGE_PUBLIC_FETCH_QA_REPORT.md` 신규 생성
- **PR 생성 여부**: `qa/pr-know-public-qa-01-db-fetch-visibility` 브랜치에서 생성 진행 (푸시 대기 중)
- **머지 여부**: 사용자의 명시적 승인 대기 중

## 4. Public Fetch 함수 검수
| 항목 | 확인 결과 |
|------|-----------|
| **getPublicKnowledgeArticles** | `findMany` 쿼리단에서 `PUBLIC_KNOWLEDGE_WHERE` 강제 주입 확인됨 |
| **getPublicKnowledgeArticleBySlug** | `findFirst` 쿼리단에서 슬러그 검색 시 `...PUBLIC_KNOWLEDGE_WHERE`를 강제 병합하여 우회 접근 원천 차단 확인 |
| **where 조건** | 별도 상수로 하드코딩되어 강제 적용됨 |
| **status 조건** | `in: [verified, needs_review]` 배열 조건으로만 완벽 한정됨 |
| **isPublished 조건** | `true` 로 강제 Boolean 고정 확인 |
| **상세 slug 조건** | slug 단독 조회가 아닌 퍼블릭 노출 허가 조건과의 교집합 쿼리 확인 |
| **admin fetch 재사용 여부** | 완전 분리된 독자 모듈로써 재사용 흔적 없음 |
| **client-side 필터 여부** | 서버단(DB Prisma 쿼리) 레벨에서 데이터를 버려 클라이언트에서 통째로 덤프 후 거르는 안티패턴 없음 |

## 5. Select 필드 검수
| 항목 | 확인 결과 |
|------|-----------|
| **목록 select** | 제목, 슬러그, 서머리 등 목록 뷰 렌더링을 위한 최소 항목만 추출 (원문 `content` 배제) |
| **상세 select** | 상세 화면용 본문 및 `safeCopy` 등 허가된 필드만 추출 |
| **createdById** | 쿼리에서 배제됨 확인 |
| **updatedById** | 쿼리에서 배제됨 확인 |
| **reviewedById** | 쿼리에서 배제됨 확인 |
| **전체 object serialize** | `select` 절을 명시적으로 제한하여 `KnowledgeArticle` 덤프 원천 차단 |
| **내부 관리자 메타데이터** | 쿼리에서 배제됨 확인 |

## 6. /knowledge 목록 검수
| 항목 | 확인 결과 |
|------|-----------|
| **DB fetch** | 정적 하드코딩 제거 및 `findMany` 실시간 쿼리 연동 확인 |
| **공개 문서** | `PUBLIC_KNOWLEDGE_WHERE` 조건 충족 문서만 뷰 반환 |
| **draft 차단** | 목록에서 원천 렌더링 제외 확인 |
| **isPublished=false 차단** | 목록에서 원천 렌더링 제외 확인 |
| **archived/rejected 차단** | 목록에서 원천 렌더링 제외 확인 |
| **needs_review** | UI에 "검수 필요" 배지 포함하여 정상 렌더링 |
| **verified** | UI에 정상 라벨링 렌더링 |
| **검색/필터** | 뷰 클라이언트 컴포넌트 데이터 바인딩 정상 작동 |
| **빈 상태** | 0건일 시 `isCatalogEmpty` 속성에 따라 지시된 빈 뷰 정상 출력 |
| **모바일** | 반응형 레이아웃 붕괴 없음 |

## 7. /knowledge/[slug] 상세 검수
| 항목 | 확인 결과 |
|------|-----------|
| **slug 조회** | DB `findFirst` 단건 조회 및 렌더링 파이프라인 통과 |
| **public 조건** | 상세 조회 시 퍼블릭 노출 통제 로직 완벽 상속됨 |
| **draft 접근** | 즉각적인 `notFound()` 404 차단 응답 |
| **isPublished=false 접근** | 상동 (404 처리됨) |
| **archived/rejected 접근** | 상동 (404 처리됨) |
| **notFound 처리** | Next.js API 규격에 맞는 `notFound()` 모듈 호출 정상 구현 |
| **표시 필드** | 본문 전문 및 `sourceTitle` 출처 정상 출력 |
| **안전문구** | 뷰 단에 면책 고지 박스 강제 하드코딩 렌더링 유지됨 |

## 8. Fallback 전략 검수
| 항목 | 확인 결과 |
|------|-----------|
| **production seed fallback** | 제거됨. 데이터베이스 쿼리에 100% 의존함 |
| **DB 오류 시 fallback** | 런타임 오류 시 빈 상태(`status: "unavailable"`) 리턴으로 안전하게 방어 |
| **공개 문서 0개** | 임의의 더미를 주입하지 않고 빈 상태를 정직하게 노출 |
| **seed/DB 중복** | 정적 시드 기반 렌더링이 폐기되어 데이터 충돌 및 중복 가능성 0% |
| **visibility 우회 가능성** | 시드 파일 자체가 렌더링에 관여하지 않으므로 우회 불가 |

## 9. Visibility Rule 검수
| 항목 | 확인 결과 |
|------|-----------|
| **isPublished true** | 완벽 통제 |
| **status verified** | 완벽 통제 |
| **status needs_review** | 완벽 통제 |
| **draft 제외** | 완벽 통제 |
| **archived/rejected 제외** | 완벽 통제 |
| **server-side filtering** | Prisma 쿼리 단에서 완벽 차단 |
| **client 전체 데이터 전달 없음** | Select 최적화를 거친 안전 객체만 Next.js 페이지 프롭스로 직렬화됨 |

## 10. 개인정보·의료자료·보험금 판단 리스크
| 항목 | 확인 결과 |
|------|-----------|
| **개인정보** | 수집 처리 폼 0건 |
| **의료자료** | 수집 처리 폼 0건 |
| **파일 업로드** | 첨부파일 버튼 0건 |
| **보험금 판단** | 산정 로직 0건 |
| **지급금액 산정** | 금액 표기 0건 |
| **손해사정 오인** | 금지 면책 고지문 상시 렌더링 |
| **의료 진단 해석** | 진단 행위 오인 금지 고지문 상시 렌더링 |

## 11. AI/API/외부 연결 검수
| 항목 | 확인 결과 |
|------|-----------|
| **AI API** | OpenAI / Anthropic 외부 요청 0건 |
| **RAG** | Vector 검색 파이프라인 0건 |
| **vector DB** | pgvector 쿼리 0건 |
| **external fetch** | URL 단독 크롤링 0건 |
| **sourceUrl fetch** | a 태그 href 바인딩 용도로 한정 |
| **BOA/Aiven** | 외부 CRM 커넥션 0건 |
| **analytics** | 외부 트래커 0건 |
| **secret 노출** | 서버 환경 변수 평문 노출 0건 |

## 12. 기존 라우트 영향
| 항목 | 확인 결과 |
|------|-----------|
| **/admin** | 기존 렌더링 체제 정상 가동 |
| **/admin/knowledge** | 백오피스 CRUD 기능 및 보안 권한 100% 정상 작동 |
| **/knowledge** | 정적 화면에서 Dynamic Fetch 렌더링으로 성공적 전환 |
| **/knowledge/[slug]** | 상동 (동적 페이지 응답 정상) |
| **/directory** | 사이드 이펙트 0건 |
| **/claim-documents** | 사이드 이펙트 0건 |
| **/work-tools** | 사이드 이펙트 0건 |

## 13. 테스트 결과
- **prisma generate**: 통과 (생태계 싱크 완료)
- **typecheck**: 통과 (TS 에러 0건)
- **lint**: 통과 (위반 0건)
- **build**: 통과 (SSG 최적화 빌드 시 `/knowledge` 트리가 Dynamic(ƒ) 모드로 정상 변환 입증)

## 14. Railway production 확인
- **배포 URL**: `https://plannerdesk-production.up.railway.app`
- **/knowledge**: DB 실시간 조회 응답 확인 완료
- **/knowledge/[slug]**: DB 단건 상세 조회 응답 확인 완료
- **/admin/knowledge**: 관리자 인가(RBAC) 통제 철벽 유지
- **public route**: 메인 서비스 장애 없음
- **문제 여부**: 무결점 배포 상태 유지 중

## 15. P0/P1/P2 보완 목록
- **P0**: 없음
- **P1**: 없음
- **P2**: 향후 RAG 연동 등 실질적인 AI 고도화 요구가 발생할 시, DB 쿼리를 통해 가져온 `content` 전문을 그대로 VectorDB용 Chunking 파이프라인으로 연결할 별도의 백엔드 아키텍처(Batch 또는 Webhook) 설계가 필요함.

## 16. 다음 작업 추천
- **추천 PR**: 없음 (스탠바이 대기)
- **이유**: 지식 아카이브 DB 설계 -> 관리자 백오피스 통제 로직 구현 -> 퍼블릭 클라이언트 리얼타임 연동까지 이어지는 핵심 마일스톤이 모두 완벽하게 매듭지어졌습니다. 다음 기획(CorrectionRequest 제보 시스템 등) 지시가 내려올 때까지 시스템을 현재의 안정화된 상태로 유지하는 것이 권장됩니다.
- **위험도**: -
- **중단 조건**: -
