/**
 * PR-UX-01: Static public knowledge catalog — fallback when DB is empty or unavailable.
 */

import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
} from "@prisma/client";

export type KnowledgeFallbackCatalogEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: KnowledgeArticleCategory;
  type: KnowledgeArticleType;
  riskLevel: KnowledgeRiskLevel;
  status: typeof KnowledgeArticleStatus.verified | typeof KnowledgeArticleStatus.needs_review;
  tags: string[];
  workflowLabel?: string;
  safeCopy?: string;
  forbiddenClaims?: string[];
  sourceType: KnowledgeSourceType;
  sourceTitle: string;
  publishedAt: string;
  updatedAt: string;
  sourceCheckedAt: string;
  aiUsable: false;
};

const VERIFIED = "2026-06-03";

export const knowledgeFallbackCatalog: KnowledgeFallbackCatalogEntry[] = [
  {
    id: "kb-fallback-claim-before-check",
    slug: "claim-before-basic-check",
    title: "보험 청구 전 확인해야 할 기본 기준",
    summary:
      "청구 상담 전 보험사별 공식 안내, 필요 서류, 접수 채널을 먼저 확인하는 설계사용 체크 기준입니다.",
    content: [
      "청구 안내는 상품·사고 유형·보험사 기준에 따라 달라질 수 있습니다. PlannerDesk는 참고 경로를 제공할 뿐, 지급 여부나 금액을 판단하지 않습니다.",
      "상담 전에는 보험사 공식 청구 안내, 약관, 필요 서류 목록을 함께 확인하세요. 고객에게는 확인 순서 중심으로 안내하는 것이 안전합니다.",
      "제출 전에는 접수 채널(홈페이지, 고객센터, 우편·팩스 등)과 서류명을 공식 출처로 다시 대조하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.claim,
    type: KnowledgeArticleType.practical_standard,
    riskLevel: KnowledgeRiskLevel.medium,
    status: KnowledgeArticleStatus.verified,
    tags: ["청구", "공식안내", "서류확인"],
    workflowLabel: "청구 실무",
    safeCopy:
      "청구 전에는 보험사 공식 안내에 따라 필요 서류와 접수 방법을 먼저 확인하는 것이 좋습니다. 세부 기준은 상품·사고 유형에 따라 달라질 수 있습니다.",
    forbiddenClaims: ["보험금 받을 수 있습니다", "반드시 청구 가능합니다"],
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 지식 아카이브 (실무 참고)",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-customer-claim-docs",
    slug: "guide-customer-claim-documents",
    title: "고객에게 청구서류를 안내할 때 주의할 점",
    summary:
      "필요 서류를 요청할 때 부담을 줄이고, 공식 기준 재확인이 필요함을 함께 전달하는 안내 순서입니다.",
    content: [
      "고객 안내의 목적은 서류를 많이 받는 것이 아니라, 보험사 기준에 맞는 준비를 돕는 것입니다.",
      "의료기록 원본, 주민등록번호, 계약번호 전체를 메신저로 보내달라고 요청하지 마세요. 필요 범위는 공식 안내를 기준으로 설명하세요.",
      "서류명·제출 방법·접수 채널은 보험사별로 다를 수 있으므로, 안내 전 PlannerDesk 청구서류·보험사 디렉토리와 공식 페이지를 함께 확인하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.claim,
    type: KnowledgeArticleType.checklist,
    riskLevel: KnowledgeRiskLevel.high,
    status: KnowledgeArticleStatus.verified,
    tags: ["고객안내", "청구서류", "민감정보"],
    workflowLabel: "청구 실무",
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 지식 아카이브 (실무 참고)",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-disclosure-before-explain",
    slug: "disclosure-terms-before-explain",
    title: "공시·약관을 고객에게 설명하기 전 확인할 기준",
    summary:
      "비공식 자료 대신 보험사 공식 공시·약관 경로를 우선 확인하는 출처 기준입니다.",
    content: [
      "약관·공시 설명은 보험사 공식 홈페이지, 상품공시실, 통합 약관 페이지를 기준으로 준비하세요.",
      "블로그·카페·타인 요약 자료는 참고용으로만 사용하고, 확정 안내 자료로 사용하지 마세요.",
      "고객에게는 출처와 확인일, 변경 가능성을 함께 안내하는 것이 안전합니다.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.disclosure,
    type: KnowledgeArticleType.link_guide,
    riskLevel: KnowledgeRiskLevel.medium,
    status: KnowledgeArticleStatus.verified,
    tags: ["공시", "약관", "공식링크"],
    workflowLabel: "공시·약관",
    sourceType: KnowledgeSourceType.official,
    sourceTitle: "PlannerDesk 공시·약관 링크센터 연계",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-consult-without-pii",
    slug: "consult-prep-without-sensitive-data",
    title: "고객 개인정보를 받지 않고 상담 준비를 돕는 방법",
    summary:
      "민감정보 입력 없이 상담 범위와 확인 항목을 정리하는 설계사용 준비 기준입니다.",
    content: [
      "PlannerDesk에는 고객 실명, 주민등록번호, 연락처, 계약번호, 진단명, 처방·검사 결과를 저장하지 않습니다.",
      "상담 준비는 '어떤 항목을 확인할지'를 먼저 정리하는 방식이 안전합니다. 예: 가입 유형, 확인하고 싶은 보장 범위, 공식 자료로 대조할 항목.",
      "자료가 필요할 때는 민감정보를 가린 범위에서 확인할 수 있도록 안내하고, 원본은 고객이 선택한 안전한 채널로 받도록 설명하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.operation_safety,
    type: KnowledgeArticleType.practical_standard,
    riskLevel: KnowledgeRiskLevel.high,
    status: KnowledgeArticleStatus.verified,
    tags: ["개인정보", "상담준비", "민감정보"],
    workflowLabel: "운영 안전",
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 운영 안전 기준",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-cancellation-checklist",
    slug: "cancellation-review-checklist",
    title: "해지 전 고객에게 먼저 확인해야 할 기준",
    summary:
      "보장 공백, 환급 구조, 유지 대안, 재가입 조건을 해지 결정 전에 점검하는 체크리스트입니다.",
    content: [
      "해지 상담에서는 특정 선택을 강하게 권유하기보다, 해지·유지 각각의 변화를 함께 확인하는 과정이 우선입니다.",
      "사라지는 보장, 납입 이력, 환급금, 감액·납입유예 가능성, 재가입 시 조건 변경 가능성을 순서대로 정리하세요.",
      "최종 결정은 고객의 선택이며, 상품별 약관과 보험사 공식 안내를 함께 확인해야 합니다.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.cancellation,
    type: KnowledgeArticleType.checklist,
    riskLevel: KnowledgeRiskLevel.high,
    status: KnowledgeArticleStatus.verified,
    tags: ["해지", "계약유지", "보장공백"],
    workflowLabel: "계약 유지",
    safeCopy:
      "해지 여부를 결정하기 전에는 사라지는 보장, 환급금, 감액 가능성, 납입 유지 방법, 재가입 조건을 함께 확인하는 것이 좋습니다.",
    forbiddenClaims: ["지금 해지하면 손해입니다", "무조건 유지해야 합니다"],
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 지식 아카이브 (실무 참고)",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-coverage-review-prep",
    slug: "coverage-review-prep-materials",
    title: "보장 점검 상담 전 정리해야 할 자료",
    summary:
      "점검 미팅 전에 확인할 가입 내용·질문 목록·공식 자료 대조 항목을 정리하는 기준입니다.",
    content: [
      "보장 점검은 상품 권유가 아니라, 현재 가입 구조와 궁금한 항목을 확인하는 시간으로 준비하세요.",
      "미팅 전에는 확인하고 싶은 보장 범위, 중복·공백 여부, 유지 가능성 관련 질문을 목록으로 정리합니다.",
      "상세 조건은 상품 약관과 보험사 공식 자료로 대조하고, 고객에게는 결정을 서두르지 않도록 안내하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.cancellation,
    type: KnowledgeArticleType.checklist,
    riskLevel: KnowledgeRiskLevel.medium,
    status: KnowledgeArticleStatus.needs_review,
    tags: ["보장점검", "상담준비", "약관확인"],
    workflowLabel: "계약 유지",
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 지식 아카이브 (실무 참고)",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-portal-link-check",
    slug: "portal-link-verification",
    title: "보험사 전산 링크 사용할 때 확인할 기준",
    summary:
      "공식 전산·포털 링크 접속 전 브라우저, 팝업, 출처 변경 여부를 확인하는 운영 기준입니다.",
    content: [
      "전산 링크는 보험사 디렉토리에 등록된 공식 URL을 우선 사용하고, 북마크·외부 공유 링크는 주기적으로 대조하세요.",
      "접속 오류 시 브라우저 설정, 팝업 차단, 보안 프로그램, 공식 공지의 URL 변경 여부를 순서대로 확인합니다.",
      "고객 정보를 전산 화면에 불필요하게 입력·저장하지 않도록 업무 환경을 점검하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.plannerdesk_usage,
    type: KnowledgeArticleType.link_guide,
    riskLevel: KnowledgeRiskLevel.low,
    status: KnowledgeArticleStatus.verified,
    tags: ["전산", "링크", "디렉토리"],
    workflowLabel: "운영 안전",
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 보험사 디렉토리 연계",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-customer-copy-caution",
    slug: "customer-message-forbidden-phrases",
    title: "고객 안내문 작성 시 피해야 할 표현",
    summary:
      "지급 단정, 가입 권유, 공포 조장, 민감정보 요청 표현을 피하는 설계사용 안전 기준입니다.",
    content: [
      "고객 안내문은 확인·정리·요청·후속 연락 중심으로 작성하고, 보험금 지급 가능성이나 상품 우월성을 단정하지 마세요.",
      "「지금 안 하면 손해」, 「무조건 유리」, 「보장 확.정.」 같은 표현은 심의·민원 리스크가 큽니다.",
      "병명·진단서·계약번호·주민등록번호를 메신저로 보내달라고 요청하는 문장도 피하세요. 필요 시 범위를 최소화하고 공식 채널을 안내하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.customer_message,
    type: KnowledgeArticleType.safety_boundary,
    riskLevel: KnowledgeRiskLevel.high,
    status: KnowledgeArticleStatus.verified,
    tags: ["고객문구", "금지표현", "심의"],
    workflowLabel: "고객 안내",
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 고객문구 안전 기준",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-sensitive-data-handling",
    slug: "sensitive-data-handling-standard",
    title: "민감정보를 안전하게 다루는 상담 기준",
    summary:
      "의료·신원·계약 식별정보를 수집·전달·저장하지 않는 설계사용 운영 원칙입니다.",
    content: [
      "상담 중 받은 민감정보는 PlannerDesk에 입력·업로드·저장하지 않습니다. 메모 도구에도 주민등록번호, 진단서, 처방전 원본을 남기지 마세요.",
      "필요한 확인은 '어떤 항목을 볼지' 수준으로 정리하고, 원본 자료는 고객이 선택한 안전한 경로로만 전달받도록 안내하세요.",
      "공유·전달 시에도 최소 범위 원칙을 적용하고, 불필요한 제3자 공유를 피하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.operation_safety,
    type: KnowledgeArticleType.safety_boundary,
    riskLevel: KnowledgeRiskLevel.high,
    status: KnowledgeArticleStatus.verified,
    tags: ["민감정보", "개인정보", "운영안전"],
    workflowLabel: "운영 안전",
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 운영 안전 기준",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
  {
    id: "kb-fallback-claim-vs-payout",
    slug: "claim-guidance-vs-payout-judgment",
    title: "보험금 청구 안내와 보험금 지급 판단의 차이",
    summary:
      "청구 준비 안내와 지급 여부·금액 판단을 구분하는 설계사용 경계 기준입니다.",
    content: [
      "청구 안내는 필요 서류, 접수 채널, 공식 확인 순서를 돕는 업무입니다. 지급 판단·금액 산정·손해사정은 보험사 심사 영역입니다.",
      "PlannerDesk는 청구 참고 경로를 제공할 뿐, 지급 가능성을 단정하거나 대리 판단하지 않습니다.",
      "고객 질문에는 확인 순서와 공식 출처 안내 중심으로 응대하고, 결과는 보험사 심사 후 확인해야 함을 분명히 전달하세요.",
    ].join("\n\n"),
    category: KnowledgeArticleCategory.customer_message,
    type: KnowledgeArticleType.safety_boundary,
    riskLevel: KnowledgeRiskLevel.high,
    status: KnowledgeArticleStatus.verified,
    tags: ["청구안내", "지급단정금지", "손해사정"],
    workflowLabel: "고객 안내",
    safeCopy:
      "보험금 지급 여부와 금액은 보험사 심사 후 결정됩니다. 먼저 보험사 공식 기준에 따라 필요한 서류와 접수 방법을 확인해보겠습니다.",
    forbiddenClaims: ["보험금 받을 수 있습니다", "지급됩니다", "청구하면 나옵니다"],
    sourceType: KnowledgeSourceType.internal,
    sourceTitle: "PlannerDesk 지식 아카이브 (실무 참고)",
    publishedAt: VERIFIED,
    updatedAt: VERIFIED,
    sourceCheckedAt: VERIFIED,
    aiUsable: false,
  },
];

/** Draft-only sample id — excluded from public fallback. */
export const knowledgeFallbackDraftSampleSlug = "knowledge-draft-sample-internal";
