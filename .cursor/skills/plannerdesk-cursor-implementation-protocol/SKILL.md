---
name: plannerdesk-cursor-implementation-protocol
description: >-
  PlannerDesk token-efficient implementation workflow for Cursor. Use when
  implementing features, fixes, or UI changes on PlannerDesk (admin, directory,
  claim-documents, knowledge, answer-assistant). Cursor implements; Antigravity
  reviews; Codex is limited-review only for high-risk changes. Follow plan →
  implement → validate → report. Also use when the user pastes the Cursor 구현
  요청서 or asks for a structured plan/verify flow without Codex as default QA.
---

# PlannerDesk 토큰 절약형 구현 프로토콜

PlannerDesk(플래너데스크) 기능 구현 시 **이 skill을 먼저 읽고** 아래 순서를 따른다.
`AGENTS.md`와 `.cursor/skills/plannerdesk-agents/`는 제품 경계·전문 렌즈용으로 병행한다.

## 핵심 운영 기준

- **기본 흐름:** Cursor 구현 → Antigravity 검수 → Cursor 수정 반영 → Antigravity 재검수 → 사람 최종 판단
- **Codex 최종검수:** 기본 **사용하지 않음**
- **Codex 제한검수:** DB migration, auth/RBAC, PII, 결제, 운영 데이터, 관리자 권한 노출, 5+ 화면 영향, 대규모 공통 리팩터, 배포 직전 핵심 PR에서만 **고위험 파일/로직만** 검토

## 절대 금지

1. 사용자 승인 없이 commit, push, PR 생성, merge 금지
2. `.env`, `.env.local`, secret, token, 인증키 파일 수정 금지
3. DB migration, schema, auth, permission, 운영 데이터 변경 필요 시 **즉시 중단·보고**
4. `package.json`, lockfile 변경 시 **먼저 사유 보고**
5. 기존 정상 기능 삭제·단순화 명목 제거 금지
6. placeholder, mock을 실제 기능처럼 남기지 않음
7. destructive command 금지
8. 보험 가입 유도, 공포 조장, 과장성 UI 문구 금지
9. Codex 검수를 전제로 한 미완성 구현 남기지 않음

## 1단계: 현재 상태 확인

작업 전 확인:

- 현재 branch, `git status`, 변경 전 working tree
- 관련 route / page / component / API
- 기존 관리자 화면·타입·UI 스타일·검증 명령
- **Codex 제한검수 대상 여부** (아래 판단표)

### Codex 제한검수 검토 필요 조건

다음 **하나라도** 해당하면 최종 보고서 §7에 표시:

- DB migration
- 인증/권한
- 개인정보/민감정보
- 결제
- 운영 데이터 삭제/상태변경
- 관리자 권한 노출 가능성
- 5개 이상 화면 영향
- 대규모 공통 컴포넌트 리팩터링
- 배포 직전 핵심 로직

## 2단계: 구현 전 계획 (코드 수정 전 필수)

```markdown
## 구현 계획

1. 수정 대상 파일
2. 새로 만들 파일
3. 변경하지 않을 파일
4. 데이터 흐름
5. UI 흐름
6. 상태값 처리
7. 예외 처리
8. 검증 방법
9. 예상 리스크
10. Codex 제한검수 필요 여부
```

계획이 불명확하면 **구현하지 말고** 문제를 정리한다.

## 3단계: 구현 기준

- 기존 디자인 시스템·톤 유지 (`lib/design-system`, admin 패턴)
- 관리자 화면: 실무자가 빠르게 판단할 수 있게 단순·명확
- 목록·검색·필터·상태변경 흐름 끊기지 않게
- 일괄등록/검수/상태변경은 공통 패턴 우선
- 보험사별 청구서류: 보험사명 기준 그룹, 필요 시 아코디언/펼침
- 관리자에게 불필요한 상태·특별표기·검수상태는 숨김 또는 제거
- 텍스트/줄바꿈/모바일 가독성 점검
- TypeScript 타입 안정성, `any` 남발 금지, 기존 naming·접근성 유지
- 버튼, 필터, 빈 상태, 오류, 로딩 함께 처리

## 4단계: 자체 검증

```bash
npm run typecheck
npm run lint
npm run build
```

실패 시 분류: 이번 변경 / 기존 오류 / 환경 / 의존성 / 명령 부재 — **숨기지 말고 보고**.

## 5단계: UI/UX 자체 점검

- 첫 화면 행동이 명확한가
- 불필요 정보 과노출 없는가
- 카드·테이블·필터 과밀하지 않은가
- 보험사별 그룹·청구서류 탐색·지식 아카이브 흐름이 자연스러운가
- 좁은 화면·텍스트 깨짐 없는가
- 실제 설계사 업무 흐름과 맞는가

## 6단계: Antigravity 검수 전달 자료

- 작업 목적
- 변경 파일 목록
- 주요 변경 내용
- 검증 명령 결과
- 남은 리스크
- 특별 검수 화면/로직
- Codex 제한검수 필요 여부

## 7단계: 최종 보고서 템플릿

```markdown
# Cursor 구현 보고서

## 1. 작업 결과
- 완료:
- 미완료:
- 보류:

## 2. 변경 파일
| 파일 | 변경 내용 | 이유 |

## 3. 구현 내용
- 핵심 변경 1:
- 핵심 변경 2:
- 핵심 변경 3:

## 4. 검증 결과
| 명령 | 결과 | 비고 |
| npm run typecheck | | |
| npm run lint | | |
| npm run build | | |

## 5. UI/UX 점검
- 개선된 점:
- 남은 문제:
- 추가 개선 제안:

## 6. 리스크
| 리스크 | 영향 | 대응 |

## 7. Codex 제한검수 필요 여부
- 필요 여부:
- 사유:
- 제한검수 대상 파일/로직:

## 8. Antigravity에 넘길 검수 요청
- 집중 검수 항목:
- 배포 전 확인 항목:
- 사람이 직접 확인해야 할 항목:
```

## 최종 원칙

- **기능 구현보다 기존 기능 보존 우선**
- Codex 검수를 기본 전제로 두지 않음
- Cursor 단계에서 최대한 완성도 있게 구현 → Antigravity로 배포 가능성 판단

## 작업 요청서 입력 형식

사용자가 작업명만 주면 아래를 요청한다:

```text
작업명:
대상 기능:
완료 기준:
Antigravity 집중 검수 항목: (선택)
```
