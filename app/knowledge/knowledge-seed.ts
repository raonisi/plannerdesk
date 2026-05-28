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
