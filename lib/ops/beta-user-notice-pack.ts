/**
 * Beta user notice pack templates (PR-153). Copy/docs only — no send, role, or allowlist changes.
 */

import { BETA_USER_FORBIDDEN_PHRASES } from "@/lib/ops/limited-beta-readiness";
import {
  PR152_OPEN_CRITICAL_COUNT,
  PR152_OPERATOR_VERDICTS,
  type OperatorReadiness,
} from "@/lib/ops/beta-operator-checklist";

export const PR153_SCOPE_NOTICE =
  "제한 베타 사용자에게 전달할 안내문 템플릿 세트입니다. 실제 이메일·SMS·카카오·Slack·webhook 발송, beta user·role·allowlist·운영 DB 변경은 포함하지 않습니다.";

export const PR153_FORBIDDEN_DOC_CONTENT =
  "안내문에 고객 실명·연락처·계약번호·상담 원문·secret·allowlist 실값·가격 확정을 넣지 않습니다.";

export type NoticePackStatus = "drafted" | "conditional" | "pending" | "blocked";

export const NOTICE_PACK_STATUS_LABEL: Record<NoticePackStatus, string> = {
  drafted: "작성됨",
  conditional: "조건부",
  pending: "대기",
  blocked: "차단",
};

export const PR153_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr152",
    condition: "PR152 Conditional Ready 이상",
    result: PR152_OPERATOR_VERDICTS.checklistPrepared,
    met: PR152_OPERATOR_VERDICTS.checklistPrepared !== "not_ready",
  },
  {
    id: "crit",
    condition: "PR152 Critical(정적) 0개",
    result: String(PR152_OPEN_CRITICAL_COUNT),
    met: PR152_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "high",
    condition: "High 리스크 보완 분리",
    result: "PR142·PR148·약관 미확정",
    met: true,
  },
  {
    id: "pr151",
    condition: "PR151 dry-run 반영",
    result: "체크리스트·고지 연계",
    met: true,
  },
  {
    id: "pr150",
    condition: "PR150 제한 베타 No-Go 아님",
    result: "conditional_go",
    met: true,
  },
  {
    id: "pr147",
    condition: "PR147 데이터 책임",
    result: "인라인 고지·템플릿",
    met: true,
  },
  {
    id: "pr148",
    condition: "PR148 AA 제한",
    result: "verified+allowlist",
    met: true,
  },
  {
    id: "pr143",
    condition: "PR143 지원·장애",
    result: "playbook",
    met: true,
  },
  {
    id: "send",
    condition: "실제 발송 없이 템플릿만",
    result: "문서·admin",
    met: true,
  },
] as const;

export const NOTICE_PACK_COMPOSITION: readonly {
  id: string;
  name: string;
  purpose: string;
  whenToUse: string;
  noticeId: string;
}[] = [
  { id: "1", name: "베타 시작 안내", purpose: "제한 베타 성격 안내", whenToUse: "초대 또는 첫 안내 전", noticeId: "beta_start" },
  { id: "2", name: "기능 범위 안내", purpose: "사용 가능/보류 기능", whenToUse: "첫 접속 전", noticeId: "feature_scope" },
  { id: "3", name: "개인정보 입력 금지", purpose: "PII·민감정보 차단", whenToUse: "상시", noticeId: "pii_forbidden" },
  { id: "4", name: "데이터 책임 고지", purpose: "공식 출처 확인", whenToUse: "공개 정보 사용 전", noticeId: "data_responsibility" },
  { id: "5", name: "청구서류 고지", purpose: "지급 비확정", whenToUse: "청구서류 조회 전", noticeId: "claim_documents" },
  { id: "6", name: "Answer Assistant 안내", purpose: "제한·최종 판단 아님", whenToUse: "AI 사용 전", noticeId: "answer_assistant" },
  { id: "7", name: "오류 제보 안내", purpose: "고객정보 제외 제보", whenToUse: "오류 발견 시", noticeId: "error_report" },
  { id: "8", name: "점검·장애 안내", purpose: "일시 제한·중단", whenToUse: "장애 발생 시", noticeId: "maintenance" },
  { id: "9", name: "접근 해제 안내", purpose: "운영 판단 시 해제", whenToUse: "접근 제한 시", noticeId: "access_revoked" },
  { id: "10", name: "베타 종료 안내", purpose: "종료·후속", whenToUse: "운영 종료 시", noticeId: "beta_end" },
  { id: "11", name: "유료화 오해 방지", purpose: "결제·유료화 아님", whenToUse: "필요 시", noticeId: "no_payment" },
  { id: "12", name: "변경 사항 안내", purpose: "기능·정책 변경", whenToUse: "업데이트 시", noticeId: "policy_change" },
] as const;

export type BetaUserNotice = {
  id: string;
  title: string;
  body: string;
};

export const BETA_USER_NOTICES: readonly BetaUserNotice[] = [
  {
    id: "beta_start",
    title: "PlannerDesk 제한 베타 이용 안내",
    body: `PlannerDesk는 설계사 업무를 돕기 위해 준비 중인 제한 베타 서비스입니다.

현재 제공되는 정보는 검수된 공개 정보와 운영자가 정리한 기준을 중심으로 제공됩니다.
정식 출시 서비스가 아니며, 일부 기능은 운영 안정성 확인을 위해 제한될 수 있습니다.

이용 전 꼭 확인해 주세요.
1. 고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.
2. 청구서류와 업무 링크는 보험사 정책과 공식 페이지 변경에 따라 달라질 수 있습니다.
3. 보험금 지급 여부는 약관, 사고 내용, 제출 서류, 보험사 심사 기준에 따라 달라질 수 있으며 PlannerDesk에서 확정하지 않습니다.
4. Answer Assistant는 별도 허용된 사용자에게만 제한적으로 제공됩니다.
5. 운영 리스크가 확인되면 일부 기능 또는 베타 접근이 일시 중단될 수 있습니다.`,
  },
  {
    id: "feature_scope",
    title: "제한 베타 기능 범위 안내",
    body: `이번 제한 베타에서는 검수된 공개 정보 중심의 기능만 제한적으로 확인할 수 있습니다.

이용 가능 범위:
· 보험사 디렉터리
· 청구서류 확인
· 업무 링크 확인
· 지식 아카이브
· 공개 정보 기반 검색
· 일부 설계사 업무 보조 화면

보류 또는 제한 범위:
· 관리자 기능
· 일괄 등록·일괄 상태 변경
· 운영 이슈·변경 이력·관리자 리포트
· 결제·구독·유료화 기능
· 전체 회원가입 확대
· Answer Assistant 일반 공개

Answer Assistant는 베타 접근자 전체에게 자동 제공되지 않습니다.
별도 verified planner 기준과 allowlist 기준을 충족한 사용자에게만 제한적으로 제공됩니다.`,
  },
  {
    id: "pii_forbidden",
    title: "개인정보·민감정보 입력 금지 안내",
    body: `PlannerDesk 제한 베타에서는 고객정보와 민감정보 입력을 금지합니다.

입력하면 안 되는 정보:
· 고객명 · 주민번호 · 연락처 · 주소
· 계약번호 · 보험증권 번호
· 병력 상세 · 진단명 원문 · 검사 결과 원문
· 상담 녹취 원문 · 카카오톡 상담 원문 전체
· 가족정보 · 계좌정보 · 결제정보
· 신분증 이미지 · 보험증권 이미지
· secret, token, env, API key

오류 제보나 피드백을 남길 때도 고객정보는 모두 제거하고, 상황만 비식별 요약으로 전달해 주세요.`,
  },
  {
    id: "data_responsibility",
    title: "데이터 최신성·공식 출처 확인 안내",
    body: `PlannerDesk의 정보는 설계사 업무를 돕기 위한 참고 자료입니다.

보험사 정보, 청구서류, 업무 링크, 지식 아카이브 내용은 보험사 정책, 상품 기준, 공식 페이지 변경, 운영 검수 상태에 따라 달라질 수 있습니다.

따라서 실제 고객 안내나 서류 제출 전에는 반드시 보험사 공식 안내, 약관, 공시자료, 내부 기준을 다시 확인해 주세요.

잘못된 정보나 만료된 링크를 발견하면 고객정보를 제외하고 오류 제보 기준에 따라 알려주세요.`,
  },
  {
    id: "claim_documents",
    title: "청구서류 확인 전 유의사항",
    body: `청구서류는 보험사, 상품, 사고 내용, 보장 항목, 심사 기준에 따라 달라질 수 있습니다.

PlannerDesk에서 제공하는 청구서류 정보는 확인을 돕기 위한 참고 자료이며, 보험금 지급 여부를 확정하지 않습니다.

최종 제출 전에는 반드시 해당 보험사의 공식 안내와 약관 기준을 확인해 주세요.

보험금 지급 여부는 약관, 사고 내용, 제출 서류, 보험사 심사 기준에 따라 달라질 수 있습니다.`,
  },
  {
    id: "answer_assistant",
    title: "Answer Assistant 제한 이용 안내",
    body: `Answer Assistant는 허용된 사용자에게만 제한적으로 제공되는 상담 준비 보조 기능입니다.

이 기능은 보험금 지급 여부, 가입, 해지, 법률·의료·세무 판단을 확정하지 않습니다.
최종 판단은 약관, 공시자료, 보험사 심사 기준, 공식자료를 확인해야 합니다.

입력 금지:
· 고객명 · 주민번호 · 연락처 · 계약번호 · 병력
· 진단명 원문 · 상담 원문 전체
· 보험증권 이미지 · 신분증 이미지 · 계좌정보 · 결제정보

출력 결과는 상담 보조용 초안이며, 실제 고객 안내 전 반드시 검토해 주세요.
개인정보 입력, 지급 여부 단정, 가입·해지 유도, 공포 조장 표현이 발견되면 즉시 사용을 중단하고 운영자에게 알려주세요.`,
  },
  {
    id: "error_report",
    title: "오류 제보 안내",
    body: `PlannerDesk 이용 중 잘못된 정보, 만료된 링크, 화면 오류, 접근 오류를 발견하면 운영 기준에 따라 제보해 주세요.

제보 시 포함하면 좋은 정보:
· 발생 화면 · 문제 유형
· 어떤 행동 후 발생했는지
· 기대한 결과 · 실제 발생한 문제
· 고객정보를 제거한 비식별 요약

제보 시 포함하면 안 되는 정보:
· 고객명 · 주민번호 · 연락처 · 계약번호 · 병력
· 진단명 원문 · 상담 원문 전체 · 계좌정보 · 결제정보
· secret, token, env, API key

미검수 데이터 노출, 관리자 정보 노출, 개인정보 저장 위험, Answer Assistant 위험 답변은 즉시 중단 검토 대상입니다.`,
  },
  {
    id: "maintenance",
    title: "기능 점검 안내",
    body: `일부 기능의 안정성 확인을 위해 제한 베타 이용이 일시적으로 제한될 수 있습니다.

점검 대상:
· 공개 정보 조회 · 청구서류 확인 · 업무 링크
· 검색 기능 · Answer Assistant 제한 기능

점검 중에는 일부 화면이 보이지 않거나 접근이 제한될 수 있습니다.
확인되지 않은 정보는 공개 전 검수 후 반영됩니다.

개인정보와 민감정보는 점검 요청이나 오류 제보에 포함하지 말아 주세요.`,
  },
  {
    id: "access_revoked",
    title: "제한 베타 접근 변경 안내",
    body: `운영 안정성, 보안 기준, 개인정보 보호 기준, 기능 범위 조정에 따라 제한 베타 접근이 일시 중단되거나 해제될 수 있습니다.

접근 변경 사유 예시:
· 개인정보 또는 민감정보 입력 위험
· 관리자 기능 접근 시도 · 계정 공유 의심
· Answer Assistant 제한 우회 시도
· 운영 리스크 발생 · 장기 미사용 · 베타 운영 범위 변경

접근 변경은 서비스 안정성과 정보 보호를 위한 조치이며, 필요한 경우 운영 기준에 따라 재검토될 수 있습니다.`,
  },
  {
    id: "beta_end",
    title: "제한 베타 종료 안내",
    body: `PlannerDesk 제한 베타 운영이 종료됩니다.

베타 기간 동안 확인된 피드백, 오류, 사용성 개선 의견은 후속 개선 항목으로 정리됩니다.
정식 공개 여부, 기능 확대 여부, 유료화 여부는 별도 검토 후 결정됩니다.

베타 종료 후 일부 기능은 접근이 제한될 수 있습니다.
고객정보와 민감정보는 베타 피드백이나 종료 의견에도 포함하지 말아 주세요.`,
  },
  {
    id: "no_payment",
    title: "결제·유료화 관련 안내",
    body: `현재 제한 베타는 결제나 유료 구독 서비스가 아닙니다.

PlannerDesk는 현재 외부 제한 베타 준비와 운영 안정성 확인 단계에 있으며, 가격표, 결제, 환불, 구독, 유료 권한 부여는 제공되지 않습니다.

향후 유료화 여부는 약관, 개인정보처리방침, 환불정책, 고객지원, 결제 보안, 세금·정산 기준을 별도로 검토한 뒤 결정됩니다.

현재 단계에서 결제정보, 카드정보, 계좌정보를 입력하거나 전달하지 마세요.`,
  },
  {
    id: "policy_change",
    title: "제한 베타 변경 사항 안내",
    body: `PlannerDesk 제한 베타 운영 기준 또는 기능 범위가 일부 변경될 수 있습니다.

변경될 수 있는 항목:
· 공개 정보 범위 · 청구서류 표시 기준 · 업무 링크 상태
· 검색 결과 표시 기준 · Answer Assistant 제한 운영 기준
· 오류 제보 기준 · 접근 제한 기준

변경 사항은 운영 안정성, 정보 정확성, 개인정보 보호 기준을 우선하여 반영됩니다.
확인되지 않은 정보는 임의로 공개하지 않습니다.`,
  },
] as const;

/** Phrases that must not appear in any notice body (static lint). */
export const NOTICE_PACK_FORBIDDEN_PHRASES: readonly string[] = [
  ...BETA_USER_FORBIDDEN_PHRASES,
  "보험금 지급 확정",
  "무조건 지급",
  "최신 정보 100% 보장",
  "AI가 최종 판단",
  "고객정보를 입력하면 더 정확",
  "상담 원문을 그대로 넣어",
  "유료 결제 후 사용",
  "환불 보장",
  "누구나 가입 가능",
  "전체 기능 즉시 사용",
  "관리자 기능 체험",
  "운영 DB",
  "AUTH_SECRET",
] as const;

export const NOTICE_FORBIDDEN_EXPRESSIONS: readonly {
  phrase: string;
  reason: string;
}[] = [
  { phrase: "정식 출시 완료", reason: "제한 베타 단계와 충돌" },
  { phrase: "누구나 가입 가능", reason: "회원가입 확대 아님" },
  { phrase: "전체 기능 즉시 사용", reason: "보류 기능 존재" },
  { phrase: "보험금 지급 확정", reason: "심사 기준에 따름" },
  { phrase: "무조건 지급", reason: "단정 위험" },
  { phrase: "이 서류만 내면 됩니다", reason: "청구서류 변경 가능" },
  { phrase: "최신 정보 100% 보장", reason: "최신성 보장 불가" },
  { phrase: "AI가 최종 판단", reason: "AA는 보조 기능" },
  { phrase: "고객정보를 입력하면 정확", reason: "PII 유도" },
  { phrase: "상담 원문을 그대로 넣어", reason: "원문·PII 위험" },
  { phrase: "유료 결제 후 사용", reason: "결제 없음" },
  { phrase: "환불 보장", reason: "환불정책 미확정" },
  { phrase: "관리자 기능 체험", reason: "외부 사용자 금지" },
  { phrase: "운영 DB", reason: "내부 정보 노출" },
  { phrase: "secret/token/env", reason: "보안정보 노출" },
] as const;

export const PR153_PACK_VERDICTS = {
  noticePackPrepared: "conditional_ready" as OperatorReadiness,
  pr154Entry: "conditional_ready" as OperatorReadiness,
  externalSend: "not_ready" as OperatorReadiness,
  overallUntilCodex: "conditional_ready" as OperatorReadiness,
} as const;

export const PR153_OPEN_CRITICAL_COUNT = 0;

export const PR154_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR154", title: "Public Smoke Expansion", purpose: "public smoke", risk: "High", codex: "조건부" },
  { id: "PR155", title: "Admin Access Regression", purpose: "admin 회귀", risk: "Critical", codex: "필수" },
  { id: "PR156", title: "AA Red-Team Test", purpose: "AI safety", risk: "Critical", codex: "필수" },
  { id: "PR157", title: "Beta Launch Decision", purpose: "실행 여부", risk: "Critical", codex: "필수" },
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Incident Drill", purpose: "장애 리허설", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "보험금 지급 확정 표현",
  "최신성 100% 보장",
  "AI 최종 판단 표현",
  "PII 입력 유도",
  "AA 제한 고지",
  "데이터·청구 책임 고지",
  "오류 제보 PII 제외",
  "점검·장애 내부정보 노출",
  "발송·role·allowlist 부재",
  "PR154 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "README 취향",
  "UI 미세 취향",
] as const;

export const PR153_LINKED_HUBS = [
  "PR-152-BETA-OPERATOR-CHECKLIST-OPS.md",
  "PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-148-AI-LIMITED-BETA-POLICY-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-142-TERMS-PRIVACY-PLAN-OPS.md",
] as const;

/** All notice bodies joined for static forbidden-phrase scan. */
export function getAllNoticeText(): string {
  return BETA_USER_NOTICES.map((n) => `${n.title}\n${n.body}`).join("\n");
}
