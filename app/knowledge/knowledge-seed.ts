export type KnowledgeCategory =
  | "보험사 전산·업무 포털"
  | "청구서류·접수 기준"
  | "공시·약관·공식 링크"
  | "고객 안내문·응대 문구"
  | "계약관리·유지 실무"
  | "고지·심사 전 확인"
  | "운영 안전·금지 영역"
  | "PlannerDesk 사용법";

export type KnowledgeType =
  | "FAQ"
  | "실무 기준"
  | "안내문 샘플"
  | "체크리스트"
  | "링크 가이드"
  | "안전 경계"
  | "운영 가이드";

export type KnowledgeStatus = "draft" | "needs_review" | "verified" | "archived";
export type KnowledgeRiskLevel = "low" | "medium" | "high";

export interface KnowledgeSeedItem {
  id: string;
  slug?: string;
  title: string;
  category: KnowledgeCategory;
  type: KnowledgeType;
  summary: string;
  status: KnowledgeStatus;
  riskLevel: KnowledgeRiskLevel;
  aiUsable: boolean;
  tags: string[];
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  "보험사 전산·업무 포털",
  "청구서류·접수 기준",
  "공시·약관·공식 링크",
  "고객 안내문·응대 문구",
  "계약관리·유지 실무",
  "고지·심사 전 확인",
  "운영 안전·금지 영역",
  "PlannerDesk 사용법",
];

export const KNOWLEDGE_SEED_ITEMS: KnowledgeSeedItem[] = [
  {
    id: "knowledge-1",
    title: "보험사 전산 접속 링크가 열리지 않을 때 먼저 확인할 것",
    category: "보험사 전산·업무 포털",
    type: "FAQ",
    summary:
      "브라우저, 팝업 차단, 보안 프로그램, 공식 링크 변경 여부를 순서대로 확인합니다.",
    status: "needs_review",
    riskLevel: "low",
    aiUsable: false,
    tags: ["전산", "브라우저", "헬프데스크", "링크오류"],
  },
  {
    id: "knowledge-2",
    title: "전산 헬프데스크와 고객센터의 차이",
    category: "보험사 전산·업무 포털",
    type: "FAQ",
    summary:
      "설계사용 전산 문의와 고객 상담 문의를 구분해 업무 시간을 줄입니다.",
    status: "needs_review",
    riskLevel: "low",
    aiUsable: false,
    tags: ["헬프데스크", "고객센터", "전산"],
  },
  {
    id: "knowledge-3",
    title: "청구서류는 어디서 확인해야 하나요?",
    category: "청구서류·접수 기준",
    type: "링크 가이드",
    summary:
      "PlannerDesk 자료와 보험사 공식 안내를 함께 확인하는 기준을 정리합니다.",
    status: "needs_review",
    riskLevel: "medium",
    aiUsable: false,
    tags: ["청구서류", "공식출처", "보험사확인"],
  },
  {
    id: "knowledge-4",
    title: "실손 청구 기본서류 안내 기준",
    category: "청구서류·접수 기준",
    type: "실무 기준",
    summary:
      "실손 청구 시 기본서류와 추가서류를 구분해 안내하는 흐름을 정리합니다.",
    status: "needs_review",
    riskLevel: "high",
    aiUsable: false,
    tags: ["실손", "청구서류", "고객안내"],
  },
  {
    id: "knowledge-5",
    title: "약관 링크는 어디서 확인하는 것이 안전한가요?",
    category: "공시·약관·공식 링크",
    type: "링크 가이드",
    summary:
      "보험사 공식 홈페이지, 상품공시, 약관 페이지를 우선 확인하는 기준을 정리합니다.",
    status: "needs_review",
    riskLevel: "medium",
    aiUsable: false,
    tags: ["약관", "공시", "공식링크"],
  },
  {
    id: "knowledge-6",
    title: "고객에게 청구서류를 요청할 때 쓰는 안내 기준",
    category: "고객 안내문·응대 문구",
    type: "안내문 샘플",
    summary:
      "고객에게 필요한 서류를 요청할 때 부담 없이 안내하는 문장 구조를 정리합니다.",
    status: "needs_review",
    riskLevel: "high",
    aiUsable: false,
    tags: ["고객안내문", "청구서류", "응대문구"],
  },
  {
    id: "knowledge-7",
    slug: "insurance-claim-answer-boundary",
    title: "고객이 “보험금 받을 수 있나요?”라고 물을 때 답변 기준",
    category: "고객 안내문·응대 문구",
    type: "안전 경계",
    summary:
      "지급 여부와 금액은 보험사 심사 후 결정된다는 안전한 응대 기준을 정리합니다.",
    status: "needs_review",
    riskLevel: "high",
    aiUsable: false,
    tags: ["보험금판단", "고객응대", "안전문구"],
  },
  {
    id: "knowledge-8",
    slug: "cancellation-before-checklist",
    title: "보험 해지 전 먼저 확인할 5가지 기준",
    category: "계약관리·유지 실무",
    type: "체크리스트",
    summary:
      "보장 공백, 환급금, 감액, 납입유예, 재가입 조건을 먼저 확인합니다.",
    status: "needs_review",
    riskLevel: "high",
    aiUsable: false,
    tags: ["해지", "감액", "계약유지"],
  },
  {
    id: "knowledge-9",
    slug: "hypertension-disclosure-check",
    title: "고혈압약 복용 중 고지 전 확인할 항목",
    category: "고지·심사 전 확인",
    type: "체크리스트",
    summary:
      "청약서 질문, 진단·투약 기간, 최근 병원 이력 확인 기준을 정리합니다.",
    status: "needs_review",
    riskLevel: "high",
    aiUsable: false,
    tags: ["고지", "심사", "투약", "건강고지"],
  },
  {
    id: "knowledge-10",
    title: "검수 완료와 검수 필요 배지는 어떻게 봐야 하나요?",
    category: "PlannerDesk 사용법",
    type: "FAQ",
    summary:
      "verified와 needs_review의 의미를 구분해 자료 신뢰도를 확인하는 방법을 안내합니다.",
    status: "needs_review",
    riskLevel: "low",
    aiUsable: false,
    tags: ["검수상태", "사용법", "신뢰도"],
  },
];

export interface KnowledgeDetailItem extends KnowledgeSeedItem {
  slug: string;
  body: string[];
  checkSteps: string[];
  sourceNote: string;
  officialSourceUrl?: string;
  aiRestrictionNote: string;
  relatedLinks: Array<{ href: string; label: string }>;
  forbiddenClaims: string[];
  safeCopy: string;
  lastReviewedAt: string | null;
}

const COMMON_RELATED_LINKS: Array<{ href: string; label: string }> = [
  { href: "/directory", label: "보험사 디렉토리" },
  { href: "/claim-documents", label: "청구서류 라이브러리" },
  { href: "/disclosure-links", label: "공시·약관 링크센터" },
  { href: "/message-templates", label: "고객 안내문 템플릿" },
  { href: "/knowledge", label: "지식 아카이브 목록" },
];

export const KNOWLEDGE_DETAIL_ITEMS: KnowledgeDetailItem[] = [
  {
    ...KNOWLEDGE_SEED_ITEMS[6],
    slug: "insurance-claim-answer-boundary",
    body: [
      "고객의 질문 의도는 보통 '내 상황에서 청구 가능성이 있는지'를 빠르게 알고 싶다는 점에 있습니다.",
      "하지만 지급 여부와 금액은 보험사 심사, 약관, 제출 서류, 사고 사실관계에 따라 결정되므로 설계사나 플랫폼이 단정해서는 안 됩니다.",
      "따라서 응대의 중심은 판단이 아니라 확인 순서 안내(필요서류, 공식 접수 채널, 약관 확인)로 두어야 합니다.",
    ],
    checkSteps: [
      "질문 목적을 먼저 확인하고, 지급 단정 답변은 제공하지 않음을 안내합니다.",
      "고객에게 필요한 서류와 공식 접수 채널(보험사 홈페이지, 고객센터, 청구 안내)을 우선 안내합니다.",
      "상품별 약관과 보험사 심사 기준 확인이 필요하다는 점을 명확히 전달합니다.",
      "필요 시 /claim-documents, /disclosure-links의 공식 경로를 함께 안내합니다.",
    ],
    sourceNote: "지식 아카이브 seed 샘플. 공식 출처 확인 및 관리자 검수 전.",
    aiRestrictionNote: "검수 완료 전에는 AI 답변 보조의 근거 문서로 사용하지 않습니다.",
    relatedLinks: COMMON_RELATED_LINKS,
    forbiddenClaims: [
      "보험금 받을 수 있습니다",
      "지급됩니다",
      "청구하면 나옵니다",
      "이 서류면 충분합니다",
    ],
    safeCopy:
      "보험금 지급 여부와 금액은 보험사 심사 후 결정됩니다. 먼저 보험사 공식 기준에 따라 필요한 서류와 접수 방법을 확인해보겠습니다.",
    lastReviewedAt: null,
  },
  {
    ...KNOWLEDGE_SEED_ITEMS[7],
    slug: "cancellation-before-checklist",
    body: [
      "해지 상담에서는 단일 결론을 제시하기보다, 해지 시 발생하는 변화와 유지 대안을 함께 확인하는 과정이 우선입니다.",
      "특히 보장 공백, 환급 구조, 감액 또는 납입유예 가능성, 재가입 조건은 사전에 반드시 점검해야 합니다.",
      "설계사는 고객 의사결정을 돕는 정보를 제공하되, 특정 선택을 강하게 유도하지 않는 중립적 설명이 필요합니다.",
    ],
    checkSteps: [
      "해지 시 사라지는 보장과 남는 보장을 먼저 구분합니다.",
      "해지환급금과 납입 이력에 따른 영향(손실 가능성 포함)을 확인합니다.",
      "감액, 감액완납, 납입유예 같은 유지 대안을 함께 검토합니다.",
      "재가입 시 조건 변경 가능성(심사, 보험료, 보장 제한)을 안내합니다.",
      "고객 상황에 맞는 선택은 보험사 기준과 약관 확인 후 결정하도록 안내합니다.",
    ],
    sourceNote: "지식 아카이브 seed 샘플. 공식 출처 확인 및 관리자 검수 전.",
    aiRestrictionNote: "검수 완료 전에는 AI 답변 보조의 근거 문서로 사용하지 않습니다.",
    relatedLinks: COMMON_RELATED_LINKS,
    forbiddenClaims: [
      "무조건 유지해야 합니다",
      "지금 해지하면 손해입니다",
      "반드시 갈아타야 합니다",
    ],
    safeCopy:
      "해지 여부를 결정하기 전에는 사라지는 보장, 환급금, 감액 가능성, 납입 유지 방법, 재가입 조건을 함께 확인하는 것이 좋습니다.",
    lastReviewedAt: null,
  },
  {
    ...KNOWLEDGE_SEED_ITEMS[8],
    slug: "hypertension-disclosure-check",
    body: [
      "고지·심사 전 확인은 의료 판단이 아니라 청약서 질문 기준에 맞춘 사실 확인 과정입니다.",
      "복용 약물, 진단 시점, 최근 병원 이력은 사실 그대로 정리해야 하며, 인수 결과를 사전에 단정해서는 안 됩니다.",
      "고객에게는 '보험사 심사 후 결정' 원칙을 명확히 안내하고, 필요 시 공식 채널 확인을 병행합니다.",
    ],
    checkSteps: [
      "청약서 질문 항목에서 관련 병력·투약 항목을 먼저 확인합니다.",
      "진단 시점, 투약 기간, 최근 병원 방문/검사 이력을 사실 기준으로 정리합니다.",
      "고객이 제출할 자료 범위를 보험사 공식 안내 기준으로 확인합니다.",
      "가입 가능/거절/할증 등 결과 예측은 하지 않고 심사 후 결정 원칙을 안내합니다.",
    ],
    sourceNote: "지식 아카이브 seed 샘플. 공식 출처 확인 및 관리자 검수 전.",
    aiRestrictionNote: "검수 완료 전에는 AI 답변 보조의 근거 문서로 사용하지 않습니다.",
    relatedLinks: COMMON_RELATED_LINKS,
    forbiddenClaims: [
      "고혈압약 먹어도 가입됩니다",
      "이 정도면 고지 안 해도 됩니다",
      "할증 없습니다",
      "거절 안 됩니다",
    ],
    safeCopy:
      "고혈압약 복용 이력이 있다면 청약서 질문 기준, 진단·투약 기간, 최근 병원 이력을 먼저 확인해야 합니다. 인수 조건은 보험사 심사 후 결정됩니다.",
    lastReviewedAt: null,
  },
];

export const KNOWLEDGE_DETAIL_SLUGS = KNOWLEDGE_DETAIL_ITEMS.map(
  (item) => item.slug,
);

export function getKnowledgeDetailBySlug(slug: string): KnowledgeDetailItem | null {
  return KNOWLEDGE_DETAIL_ITEMS.find((item) => item.slug === slug) ?? null;
}
