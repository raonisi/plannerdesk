# PR-ADMIN-QA-01 Admin/RBAC + Visibility Rule 회귀검수 보고서

## 1. 결론
- **최종 판단**: A (보안 및 접근 제어 체계 무결점)
- **다음 개발 진행 가능 여부**: 즉시 진행 가능
- **PR-KNOW-DB-01 진행 가능 여부**: 진행 가능 (Admin 방어막 완비)
- **가장 큰 리스크**: Auth/RBAC 코드 자체는 안전하나, 실운영 환경에서 환경 변수(Provider 세팅 등) 설정 누락 시 로그인 잠김 현상이 길어질 수 있음.
- **즉시 보완 필요 사항**: 확인되지 않음 (매우 안전)

## 2. 모델 사용
- **사용 모델**: Gemini 3.1 Pro High (전체 판단 총괄)
- **3.5 Flash 사용 범위**: 본 작업에서는 주요 판단 무결성을 위해 보조로 사용되지 않음.
- **3.1 Pro High 판단 범위**: 서버 액션 보호, 권한 분리 규칙, Public Visibility Rule 강제성, 시크릿 하드코딩 여부, 컴플라이언스(의료정보) 차단 판단 전체.

## 3. 변경 여부
- **코드 변경**: 없음 (기능 구현 PR이 아님)
- **문서 변경**: `docs/ADMIN_RBAC_VISIBILITY_QA_REPORT.md` 신규 생성
- **PR 생성 여부**: `qa/pr-admin-qa-01-rbac-visibility-regression` 푸시 대기 중
- **머지 여부**: 사용자 검토/승인 후 병합 대기 중 (자동 머지 않음)

## 4. Auth/RBAC 회귀검수
| 항목 | 확인 상태 |
|------|-----------|
| **미인증 `/admin` 접근** | 원천 차단됨 (Locked UI 노출) |
| **권한 없는 사용자 접근** | 차단됨 (AccessDenied UI 노출) |
| **content_admin** | `/admin/insurers`, `/admin/claim-documents` CRUD 접근 확인 |
| **super_admin** | 전체 관리자 기능 제한 없이 엑세스 확인 |
| **server action 보호** | `requireAdmin`, `requireContentManager` 등 헬퍼 함수로 완벽 차단됨 |
| **권한 없음 UI** | 명확한 접근 제한 컴포넌트 렌더링 확인됨 |
| **판정** | **안전** |

## 5. Admin CRUD 권한 검수
| 항목 | 확인 상태 |
|------|-----------|
| **`/admin/insurers`** | `content_admin` 이상 허용으로 정상 분리됨 |
| **`/admin/claim-documents`** | `content_admin` 이상 허용으로 정상 분리됨 |
| **create** | 폼 제출 및 쿼리 전 권한 검증(`requireInsurerContentManager`) 작동 |
| **update** | 수정 액션 최상단 권한 검증 작동 |
| **delete** | 해당 액션 없음 (안전) |
| **publish/unpublish** | 토글 시 `requireInsurerPublisher` 통제 작동 |
| **상태 변경** | 관리자 권한 없이 상태(draft/verified 등) 무단 변경 불가 |
| **판정** | **안전** |

## 6. Public Visibility Rule 검수
| 항목 | 확인 상태 |
|------|-----------|
| **public `/directory`** | DB 조회 필터 강제로 정상 노출 통제 |
| **public `/claim-documents`** | 디렉토리와 동일한 수준으로 렌더링 통제 |
| **draft 차단** | 퍼블릭 쿼리(`PUBLIC_VERIFICATION_STATUSES`)에서 제외되어 원천 차단 |
| **unpublished 차단** | `isPublished: true` 조건 강제 주입으로 차단 |
| **isPublished** | 상태 체크 정상 |
| **verificationStatus** | 쿼리 인자로 정상 동기화 통제 |
| **needs_review** | 리스트 쿼리에는 포함되나 UI 레이블로 관리됨 |
| **verified** | 완벽히 정상 노출됨 |
| **우회 노출 가능성** | 백엔드 쿼리가 데이터를 반환하지 않아 편법적인 우회(fetch 조작) 불가 |

## 7. Secret/Env 안전성
| 항목 | 확인 상태 |
|------|-----------|
| **`.env` 커밋** | 파일 없음 (안전) |
| **secret 하드코딩** | 평문 시크릿 코드 기입 없음 (안전) |
| **DATABASE_URL 노출** | `process.env.DATABASE_URL` 참조 확인 (안전) |
| **OAuth secret 노출** | `process.env` 기반 참조 (안전) |
| **API_KEY 노출** | 하드코딩된 서비스 키 없음 (안전) |
| **BOA/Aiven** | 인가되지 않은 타 데이터베이스 접속 로직 전무 (안전) |
| **OpenAI** | AI 호출 통신 로직 전무 (안전) |
| **analytics** | 외부 트래킹/스크립트 심기 전무 (안전) |

## 8. 보험·개인정보·의료자료 리스크
| 항목 | 확인 상태 |
|------|-----------|
| **개인정보 입력** | 주민등록번호/이름 기입 폼 등 일절 없음 (안전) |
| **의료자료 처리** | 입퇴원확인서, 진단서 등 취급 로직 전무 (안전) |
| **파일 업로드** | `input type="file"` 폼 전무 (안전) |
| **보험금 판단** | "지급됩니다" 등 단정적, 보장성 권유 문구 전무 (안전) |
| **지급 금액 산정** | "청구하면 OOO 나옵니다" 등 산정 오인 유발 전무 (안전) |
| **손해사정 오인** | 고객 진단 정보를 바탕으로 한 해석 로직 전무 (안전) |
| **의료 진단 해석** | 질병 코드에 대한 전문적 해석 및 가이드 강요 전무 (안전) |

## 9. 테스트 결과
- **typecheck**: 통과
- **lint**: 통과
- **build**: 통과

## 10. Railway production 확인
- **배포 URL**: `https://plannerdesk-production.up.railway.app`
- **`/admin`**: 미인증 유저 접근 시 서버 에러가 아닌 지정된 접근 불가 UI 렌더링 확인.
- **`/admin/insurers`**: 라우팅 차단 보호 정상 작동.
- **`/admin/claim-documents`**: 라우팅 차단 보호 정상 작동.
- **public route**: `/directory`, `/claim-documents` 등 고객 포털 라우트 무결점(빠른 렌더링).
- **문제 여부**: 레이아웃 깨짐 현상이나 무한 리다이렉트 발생 안 함.

## 11. P0/P1/P2 보완 목록
- **P0**: 발견 안 됨
- **P1**: 발견 안 됨
- **P2**: 향후 실운영 조직도 확립에 따라 Google Provider 및 권한 맵핑 스키마 문서화 구체화 필요.

## 12. 다음 작업 추천
- **추천 PR**: **`PR-KNOW-DB-01`** (지식 아카이브 데이터베이스화 파이프라인 구축)
- **이유**: 관리자 라우트로의 모든 침입을 방어하는 보호막과, 검수 완료 데이터만 고객에게 뿌려주는 'Public Visibility Rule'이 성공적으로 안착했습니다. 따라서 안심하고 다음 순서인 대규모 지식(Knowledge) 데이터베이스화 모델링에 착수할 수 있습니다. 
- **위험도**: 낮음 ~ 보통
- **중단 조건**: 향후 지식 문서 에디터 개발 시, 파일 업로드 버튼(의료 데이터 보관 우려)이 강제 기획되면 구현 즉시 중단.
