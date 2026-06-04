/**
 * Support & incident playbook copy (PR-143). Ops standards only — no tickets, no outbound send.
 */

export const PR143_SCOPE_NOTICE =
  "고객지원·장애 대응 **운영 기준**입니다. 문의 폼, ticket/incident DB, 이메일·SMS·Slack·webhook, CS 툴 연동은 구현하지 않습니다.";

export const PR143_FORBIDDEN_RECORD_CONTENT =
  "운영 기록에 고객정보·상담 원문·secret·token·env·stack trace 원문을 넣지 않습니다.";

export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";

export const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export const SUPPORT_SCOPE_ROWS: readonly {
  id: string;
  item: string;
  pr143: string;
  forbidden: string;
}[] = [
  { id: "report", item: "오류 제보", pr143: "문서·OPS Registry", forbidden: "문의 폼" },
  { id: "feature-q", item: "기능 문의", pr143: "대응 기준", forbidden: "채팅 상담" },
  { id: "data", item: "데이터 오류", pr143: "PR-129 분류", forbidden: "운영 DB 직접 수정" },
  { id: "links", item: "링크 오류", pr143: "PR-134", forbidden: "자동 크롤" },
  { id: "claim", item: "청구서류 오류", pr143: "출처 확인·후속 PR", forbidden: "즉시 단정" },
  { id: "auth", item: "권한 문제", pr143: "Critical 분류", forbidden: "role 직접 수정" },
  { id: "aa", item: "Answer Assistant", pr143: "PR-137·PR-148", forbidden: "공개 확대" },
  { id: "notice", item: "장애 공지", pr143: "문구 후보만", forbidden: "자동 발송" },
  { id: "channel", item: "지원 채널", pr143: "후보 정리", forbidden: "외부 CS 툴" },
] as const;

/** Aligns with PR-129-ISSUE-SEVERITY.md — PR143 playbook layer. */
export const SEVERITY_ROWS: readonly {
  severity: IssueSeverity;
  criteria: string;
  response: string;
  action: string;
}[] = [
  {
    severity: "critical",
    criteria:
      "public 노출·권한 우회·secret·운영 DB·PII 저장·AA 우회",
    response: "즉시",
    action: "중단/rollback/긴급 PR",
  },
  {
    severity: "high",
    criteria: "잘못된 청구정보·핵심 기능·링크 반복·AI safety·admin 오류",
    response: "빠른 조치",
    action: "후속 PR·베타 보류",
  },
  {
    severity: "medium",
    criteria: "데이터 일부·UX·검색 일부·모바일 일부",
    response: "운영 루틴",
    action: "개선 PR/backlog",
  },
  {
    severity: "low",
    criteria: "오탈자·여백·라벨",
    response: "정기",
    action: "backlog",
  },
  {
    severity: "info",
    criteria: "문의·제안·피드백",
    response: "기록",
    action: "PR 후보",
  },
] as const;

export const INCIDENT_RESPONSE_STEPS: readonly {
  step: number;
  title: string;
  detail: string;
}[] = [
  { step: 1, title: "접수", detail: "유형·화면·재현·영향 (PII 제거)" },
  { step: 2, title: "분류", detail: "Critical/High/Medium/Low/Info" },
  { step: 3, title: "격리", detail: "public·권한·AI 즉시 제한 검토" },
  { step: 4, title: "확인", detail: "route·visibility·권한·데이터·metadata 로그" },
  { step: 5, title: "조치", detail: "문구·데이터 PR·rollback·disable" },
  { step: 6, title: "검증", detail: "lint/typecheck/test/smoke" },
  { step: 7, title: "공지", detail: "안전 문구만 (자동 발송 없음)" },
  { step: 8, title: "기록", detail: "PR-129 Registry·metadata" },
  { step: 9, title: "재발 방지", detail: "테스트·체크리스트" },
  { step: 10, title: "종료", detail: "재확인 완료" },
] as const;

export const CRITICAL_RESPONSE_ROWS: readonly {
  situation: string;
  action: string;
}[] = [
  { situation: "미검수/비공개 public 노출", action: "공개 중단·visibility 점검" },
  { situation: "관리자 정보 public 노출", action: "접근 차단·rollback 검토" },
  { situation: "권한 우회", action: "route 제한·RBAC 검수" },
  { situation: "개인정보·민감정보 저장 위험", action: "기능 중단·저장 경로 검토" },
  { situation: "secret/token/env 노출", action: "노출 차단·rotation 검토" },
  { situation: "운영 DB 직접 영향", action: "즉시 중단·변경 범위 확인" },
  { situation: "AA allowlist 우회", action: "AI disable 검토" },
  { situation: "보험금 지급 확정 문구", action: "즉시 문구 수정" },
  { situation: "destructive bulk 오작동", action: "중단·rollback 확인" },
] as const;

export const USER_NOTICE_GOOD: readonly string[] = [
  "일부 기능 점검으로 인해 잠시 이용이 제한될 수 있습니다.",
  "확인 중인 정보는 공개 전 검수 후 반영됩니다.",
  "청구서류와 링크 정보는 공식 출처 기준으로 재확인 중입니다.",
  "개인정보와 민감정보는 입력하지 말아 주세요.",
  "오류 제보 시 고객명, 주민번호, 연락처, 계약번호 등은 제외해 주세요.",
  "현재 제한 베타 단계로, 일부 기능은 보류될 수 있습니다.",
] as const;

export const USER_NOTICE_FORBIDDEN: readonly string[] = [
  "운영 DB 오류",
  "권한 우회 발생",
  "secret 노출",
  "token 누락",
  "보험금 지급 확정",
  "무조건 지급",
  "고객정보를 보내주세요",
  "주민번호를 알려주세요",
  "정식 서비스 장애",
  "유료 고객 보상 확정",
] as const;

/** Document-only report template — no form implementation in PR143. */
export const REPORT_FORM_FIELDS: readonly {
  field: string;
  rule: string;
  piiRisk: boolean;
}[] = [
  { field: "발생 화면", rule: "페이지·기능명", piiRisk: false },
  { field: "문제 유형", rule: "데이터·링크·권한·검색·UI·AI", piiRisk: false },
  { field: "재현 조건", rule: "행동 순서", piiRisk: false },
  { field: "기대/실제 동작", rule: "요약", piiRisk: false },
  { field: "심각도 추정", rule: "운영자 재분류", piiRisk: false },
  { field: "고객정보 포함", rule: "**포함 금지**", piiRisk: true },
  { field: "처리 상태", rule: "접수~재확인 완료", piiRisk: false },
] as const;

export const REPORT_FORM_FORBIDDEN_INPUTS: readonly string[] = [
  "고객명",
  "주민번호",
  "연락처",
  "주소",
  "계약번호",
  "보험증권 번호",
  "병력·진단 원문",
  "상담 원문 전체",
  "계좌·결제정보",
  "secret/token/env",
] as const;

export const ROLLBACK_DISABLE_ROWS: readonly {
  situation: string;
  action: string;
}[] = [
  { situation: "visibility guard 문제", action: "배포 보류·rollback" },
  { situation: "admin route public 접근", action: "즉시 rollback 후보" },
  { situation: "AA 우회·audit 원문 위험", action: "AI disable" },
  { situation: "PII 저장 위험", action: "기능 중단" },
  { situation: "청구정보 반복 오류", action: "데이터 수정 PR·기능 제한" },
  { situation: "링크 오류 반복", action: "PR-134·링크 제한" },
  { situation: "검색 미검수 노출", action: "PR-132·검색 제한" },
  { situation: "bulk 오작동", action: "bulk 제한·PR107/139" },
  { situation: "운영자 대응 불가", action: "제한 베타 중단" },
] as const;

export const OPS_RECORD_RULES: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "이슈 ID", allowed: "OPS-YYYY-NNN", forbidden: "고객 식별자" },
  { field: "발생 시각·영역·심각도·상태", allowed: "metadata", forbidden: "—" },
  { field: "원인·조치 요약", allowed: "비식별 요약", forbidden: "secret·stack public" },
  { field: "사용자 제보", allowed: "비식별 요약만", forbidden: "원문 전체" },
] as const;

export const PR143_DEFERRED_IMPLEMENTATION = [
  "문의/티켓 폼 UI",
  "ticket·incident Prisma model",
  "이메일·SMS·Slack·webhook 알림",
  "외부 헬프데스크 연동",
] as const;

export const PR143_LINKED_DOCS = [
  "PR-129-OPERATIONAL-ISSUES-OPS.md",
  "PR-129-PII-AND-SENSITIVE-DATA-RULES.md",
  "PR-141-BETA-HALT-CRITERIA.md",
  "PR-115-LIMITED-RELEASE-FINAL-OPS.md",
  "PR-137-ROLLBACK-DISABLE.md",
] as const;
