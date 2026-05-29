// Starter knowledge drafts for admin import (PR-KNOW-IMPORT-01).
// Not auto-published; import script forces draft + isPublished=false + aiUsable=false.

import type {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
} from "@prisma/client";

export interface KnowledgeStarterDraft {
  title: string;
  slug: string;
  summary: string;
  category: KnowledgeArticleCategory;
  type: KnowledgeArticleType;
  riskLevel: KnowledgeRiskLevel;
  status: KnowledgeArticleStatus;
  isPublished: boolean;
  aiUsable: boolean;
  sourceType: KnowledgeSourceType;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceCheckedAt: string | null;
  workflowLabel: string | null;
  tags: string[];
  content: string;
  safeCopy: string;
  forbiddenClaims: string[];
}

const DRAFT_DEFAULTS = {
  status: "draft" as const,
  isPublished: false,
  aiUsable: false,
  sourceCheckedAt: null,
};

export const knowledgeStarterDrafts: KnowledgeStarterDraft[] = [
  {
    ...DRAFT_DEFAULTS,
    title: "실손 청구 전 확인할 기본서류",
    slug: "actual-expense-claim-basic-documents",
    summary: "실손 청구 상담 시 보험사·상품별로 달라지는 기본서류 확인 순서를 정리합니다. 지급 여부는 보험사 심사 후 결정됩니다.",
    category: "claim",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "청구 실무",
    tags: ["실손","청구서류","기본서류","공식확인"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 실손(실손의료비) 청구 안내는 상품·가입 시기·사고 경위·치료 형태에 따라 필요 서류가 달라질 수 있습니다. PlannerDesk는 보험금 지급 여부를 판단하지 않으며, 보험금 지급 금액을 산정하지 않습니다.

확인 순서 제안:
1. 해당 보험사 공식 청구 안내·약관·상품설명서에서 실손 관련 서류 목록을 확인합니다.
2. \`/claim-documents\`와 보험사 디렉토리 청구 링크를 함께 대조합니다.
3. 고객에게는 “필요 서류는 보험사 기준 확인 후 안내” 원칙으로 전달합니다.
4. 진단서·처방전·영수증 등 의료기록 **원본**은 PlannerDesk에 입력·업로드하지 않습니다.

공식 출처와 상품별 약관 확인이 필요합니다. 보험금 지급 여부와 지급 금액은 보험사 심사 후 결정됩니다.`,
    safeCopy: `실손 청구에 필요한 서류는 가입하신 상품과 보험사 기준에 따라 달라질 수 있습니다. 먼저 보험사 공식 청구 안내를 확인한 뒤, 필요 서류 목록을 순서대로 안내드리겠습니다. 최종 지급 여부는 보험사 심사 후 결정됩니다.`,
    forbiddenClaims: ["지급됩니다","받을 수 있습니다","청구하면 나옵니다","이 서류면 충분합니다","진단서를 올려주세요","주민등록번호를 입력하세요"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "입원 청구 시 자주 필요한 서류 기준",
    slug: "hospitalization-claim-document-checklist",
    summary: "입원 치료 관련 청구 상담에서 확인할 서류 범주와 공식 안내 경로를 체크리스트로 정리합니다.",
    category: "claim",
    type: "checklist",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "청구 실무",
    tags: ["입원","청구서류","체크리스트"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 입원 청구에 필요한 서류는 입원 기간, 진료 형태, 실손/입원담보 구성, 보험사별 접수 방식에 따라 다릅니다.

체크리스트(확인 항목):
- [ ] 보험사 공식 청구 안내 URL·고객센터 안내 확인
- [ ] 청구서·위임장 등 양식 최신 버전 여부
- [ ] 입원 확인 서류 범주(진료비 영수증, 입퇴원 확인 등) — **상품별 상이**
- [ ] 접수 채널(팩스, 우편, 모바일, 방문) 확인
- [ ] 고객 의료기록 원본을 메신저·이메일로 받지 않기

PlannerDesk는 손해사정 업무를 수행하지 않으며, 의료 진단을 해석하지 않습니다. 공식 안내 기준으로 확인해야 합니다.`,
    safeCopy: `입원 관련 청구 서류는 상품과 보험사 기준에 따라 달라집니다. 공식 청구 안내를 확인한 후 필요한 서류와 접수 방법을 안내드리겠습니다. 처리 결과는 보험사 심사 후 안내됩니다.`,
    forbiddenClaims: ["입원하면 받을 수 있습니다","이 서류만 있으면 됩니다","청구하면 나옵니다","검사결과지를 업로드하세요","확정입니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "통원·약제비 청구 기본 흐름",
    slug: "outpatient-pharmacy-claim-flow",
    summary: "통원·약제비 청구 상담 시 확인 순서와 보험사별 차이를 안내하는 실무 흐름입니다.",
    category: "claim",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "청구 실무",
    tags: ["통원","약제비","청구흐름"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 통원·약제비 청구는 실손 담보 구조, 기간·한도, 본인부담금 처리 방식에 따라 안내 내용이 달라집니다.

기본 흐름:
1. 증상·치료 사실관계는 고객 설명으로 파악하되, **의료 판단은 하지 않습니다**.
2. 보험사 공식 안내에서 통원·약제 관련 서류·접수 방법을 확인합니다.
3. 영수증·진료비 세부 내역 등 필요 범위를 **공식 기준**으로 안내합니다.
4. 청구 진행 상황은 보험사 심사·접수 완료 후 확인하도록 안내합니다.

고객 개인정보와 의료자료는 입력하거나 업로드하지 않습니다.`,
    safeCopy: `통원·약제비 청구는 가입 상품과 보험사 기준에 따라 필요 서류와 접수 방법이 다릅니다. 공식 안내 확인 후 순서대로 안내드리며, 지급 여부는 보험사 심사 후 결정됩니다.`,
    forbiddenClaims: ["약만 받으면 청구됩니다","통원비는 무조건 나옵니다","처방전 없어도 됩니다","고객 자료를 업로드하세요","예상 지급액"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "수술 청구 전 확인해야 할 서류 구분",
    slug: "surgery-claim-document-separation",
    summary: "수술 관련 청구에서 수술 확인·입원·실손 서류를 구분해 확인하는 기준입니다.",
    category: "claim",
    type: "checklist",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "청구 실무",
    tags: ["수술","청구서류","구분"],
    content: `본 자료는 보험설계사 실무 참고용입니다. “수술” 담보와 “입원·실손” 담보가 동시에 적용될 수 있어, 서류 범주를 혼동하기 쉽습니다.

구분 확인:
- 수술 관련 담보: 수술명·수술일·수술 확인 서류 범주 — **약관 확인**
- 입원 연계: 입퇴원·입원 기간 확인 서류
- 실손 연계: 진료비 영수증·세부내역 등
- 보험사별 추가 양식(동의서, 위임장 등)

수술의 의학적 필요성이나 지급 적격성은 설계사가 판단하지 않습니다. 보험사별 기준 확인이 필요합니다.`,
    safeCopy: `수술 청구에 필요한 서류는 상품 구성에 따라 달라질 수 있습니다. 수술·입원·실손 관련 항목을 구분해 공식 안내 기준으로 확인해 드리겠습니다.`,
    forbiddenClaims: ["수술했으면 받을 수 있습니다","수술비는 이만큼 나옵니다","수술 기록만 있으면 충분합니다","진단 해석상","손해사정 결과상"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "진단비 청구 안내 시 피해야 할 표현",
    slug: "diagnosis-benefit-claim-wording-safety",
    summary: "진단비·질병 담보 청구 안내 시 사용하지 말아야 할 표현과 대체 안내 방향을 정리합니다.",
    category: "claim",
    type: "safety_boundary",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안전 경계 초안",
    sourceUrl: null,
    workflowLabel: "청구 실무",
    tags: ["진단비","안전문구","금지표현"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 진단비 청구 상담은 질병명·진단 시점·대기기간·면책·감액·담보 가입 여부 등 **약관·심사 요소**가 복합적으로 작용합니다.

피해야 할 안내 방향:
- 특정 질병명으로 지급 가능 여부 단정
- 진단서 내용에 대한 의학적 해석
- “이 병명이면 나온다/안 나온다” 식 표현
- 고객에게 진단서·검사지 업로드 요구

대체 방향:
- 보험사 공식 안내·약관·청구서류 기준 확인
- 접수 후 심사 결과 안내
- 필요 서류는 공식 목록 기준으로만 안내

PlannerDesk는 의료 진단을 해석하지 않습니다.`,
    safeCopy: `진단 관련 보험금은 가입 담보·약관·고지·심사 기준에 따라 달라집니다. 필요 서류와 접수 방법은 보험사 공식 안내를 확인한 뒤 안내드리며, 지급 여부는 심사 후 결정됩니다.`,
    forbiddenClaims: ["이 병명이면 진단비 나옵니다","암이면 받을 수 있습니다","진단서 보내주시면 확인해 드립니다","거절됩니다","가입됩니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "최근 3개월 고지 질문 이해 기준",
    slug: "disclosure-recent-3-months-guide",
    summary: "청약서 최근 3개월 관련 질문을 고객에게 설명할 때의 확인 순서와 단정 금지 기준입니다.",
    category: "underwriting",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "고지·심사",
    tags: ["고지","3개월","청약서"],
    content: `본 자료는 보험설계사 실무 참고용입니다. “최근 3개월” 범위는 상품·보험사·질문 문구마다 세부 정의가 다를 수 있습니다.

확인 순서:
1. 해당 상품 청약서 질문 문구와 안내장을 그대로 확인
2. 진료·투약·검사·입원 등 어떤 항목이 포함되는지 **질문 기준**으로 설명
3. 고객에게 사실 확인을 돕되, **고지 생략 가능 여부는 단정하지 않음**
4. 인수 결과(표준체·할증·거절 등)는 보험사 심사 후 결정 안내

공식 출처 확인이 필요합니다.`,
    safeCopy: `최근 3개월 관련 질문은 청약서 문구 기준으로 함께 확인하는 것이 좋습니다. 답변 내용은 사실에 맞게 정리하시고, 최종 인수 조건은 보험사 심사 후 결정됩니다.`,
    forbiddenClaims: ["고지 안 해도 됩니다","병원 안 갔으면 무조건 No","가입됩니다","거절 안 됩니다","이렇게 쓰면 통과됩니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "최근 1년 검사·재검·추가검사 고지 기준",
    slug: "disclosure-1-year-exam-recheck",
    summary: "최근 1년 내 검사·재검·추가검사 관련 고지 질문 이해와 확인 포인트를 정리합니다.",
    category: "underwriting",
    type: "checklist",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "고지·심사",
    tags: ["고지","검사","재검"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 검사·재검·추가검사 항목은 질문 문구와 결과 통보 여부에 따라 고지 범위가 달라질 수 있습니다.

체크:
- [ ] 1년 기준 시작일(청약일·질문 정의) 확인
- [ ] 검사 종류(건강검진, 병원 검사, 추적 검사 등) 질문별 구분
- [ ] 결과 통보·소견 존재 여부 — **질문 문구 기준**
- [ ] 고객이 기억하기 어려운 항목은 일정·기관·목적 사실 확인 지원
- [ ] 검사지·결과지 원본 수집 금지(PlannerDesk·개인 메신저)

의료 판단이 아닌 **사실 확인** 중심으로 상담합니다.`,
    safeCopy: `최근 1년 검사·재검 관련 내용은 청약서 질문에 맞춰 차근히 확인해 주시면 됩니다. 인수 결과는 보험사 심사 후 안내됩니다.`,
    forbiddenClaims: ["검사했어도 고지 불필요","정상이면 괜찮습니다","이상 없으면 가입됩니다","진단서 올려주세요","확정입니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "최근 5년 입원·수술·계속치료 확인 기준",
    slug: "disclosure-5-year-hospitalization-surgery",
    summary: "5년 이내 입원·수술·계속치료 고지 질문 확인 순서와 주의점을 정리합니다.",
    category: "underwriting",
    type: "checklist",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "고지·심사",
    tags: ["고지","5년","입원","수술"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 5년 범위 질문은 치료 이력이 길어 누락이 발생하기 쉬워 **사실 확인**에 시간이 필요합니다.

확인 포인트:
- 입원·수술: 시기, 기간, 원인(질문이 요구하는 수준까지만)
- 계속치료: 통원·투약·물리치료 등 질문 정의 확인
- 타 병원·타과 이동 이력 누락 방지
- 고객에게 “치료 중단 여부” 사실 확인

인수 가능 여부는 설계사가 판단하지 않습니다. 보험사 심사 후 결정됩니다.`,
    safeCopy: `최근 5년 치료 이력은 청약서 질문 범위에 맞춰 차근히 확인해 주세요. 최종 인수 조건은 보험사 심사 후 결정됩니다.`,
    forbiddenClaims: ["5년 전이라 괜찮습니다","입원했어도 말 안 해도 됩니다","수술 기록 없어도 됩니다","가입 보장됩니다","거절 안 됩니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "약 복용 중인 고객 상담 시 확인 순서",
    slug: "disclosure-medication-counseling-order",
    summary: "약물 복용·처방 관련 고지 상담에서 확인할 사실 항목과 금지 표현을 정리합니다.",
    category: "underwriting",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "고지·심사",
    tags: ["고지","약물","복용"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 약물 복용 고지는 약명·기간·목적·처방/자가복용 구분 등 질문마다 다릅니다.

확인 순서:
1. 청약서 질문에서 요구하는 범위 확인
2. 약명·복용 기간·복용 이유(고객 진술) 사실 정리
3. 처방전·약봉투 사진 요청은 **최소화** — 필요 시 고객이 직접 청약서 작성
4. 약 효능·부작용·질병명 추정 등 **의료 해석 금지**

PlannerDesk는 의료 진단을 해석하지 않습니다.`,
    safeCopy: `복용 중인 약은 청약서 질문에 맞춰 약명과 기간을 정리해 주시면 됩니다. 인수 조건은 보험사 심사 후 결정됩니다.`,
    forbiddenClaims: ["혈압약 먹어도 가입됩니다","고지 안 해도 됩니다","처방전 보내주세요","이 약이면 거절됩니다","진단상 문제없음"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "건강검진 이상소견 안내 시 금지 표현",
    slug: "health-checkup-abnormal-finding-wording",
    summary: "건강검진 이상소견 관련 고지·상담 시 사용하지 말아야 할 표현을 정리합니다.",
    category: "underwriting",
    type: "safety_boundary",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안전 경계 초안",
    sourceUrl: null,
    workflowLabel: "고지·심사",
    tags: ["건강검진","이상소견","금지표현"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 건강검진 소견은 후속 검사·추적 관찰·질문 문구와 연결되어 고지 범위가 넓어질 수 있습니다.

금지 방향:
- 소견 내용으로 질병 예후 단정
- “괜찮으니 고지 불필요” 안내
- 검사결과지·판독문 업로드 요구(PlannerDesk)
- 인수·거절 결과 예측

대체:
- 소견 통보 사실·시기·추가 검사 여부 **사실 확인**
- 청약서 질문과 대조
- 보험사 심사 후 결정 안내`,
    safeCopy: `건강검진 소견은 청약서 질문과 함께 확인하는 것이 좋습니다. 추가 검사·통보 여부를 정리해 주시면 심사 과정에서 검토됩니다.`,
    forbiddenClaims: ["이상소견 없으면 가입됩니다","고지 안 해도 됩니다","검사결과지 올려주세요","암 가능성","진단 해석"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "보험 해지 전 확인해야 할 5가지",
    slug: "cancellation-five-checkpoints",
    summary: "해지 상담 전 보장 공백·환급·대안·재가입 조건을 확인하는 5가지 체크포인트입니다.",
    category: "cancellation",
    type: "checklist",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "계약 유지",
    tags: ["해지","체크리스트","보장공백"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 해지는 고객 선택을 존중하되, **결과에 대한 단정·강요**는 피합니다.

5가지 확인:
1. 해지 시 사라지는 보장 vs 유지되는 보장
2. 해지환급금·납입 이력에 따른 금전적 영향(손실 가능성 포함)
3. 감액·감액완납·납입유예 등 유지 대안 검토 여부
4. 재가입 시 심사·보험료·보장 제한 가능성
5. 해지 의사 최종 확인(본인 의사)

PlannerDesk는 특정 선택(해지/유지)을 강요하지 않습니다.`,
    safeCopy: `해지 전에는 사라지는 보장, 환급금, 다른 유지 방법, 재가입 조건을 함께 확인하시는 것이 좋습니다. 결정은 고객님께서 하시면 됩니다.`,
    forbiddenClaims: ["지금 해지하면 손해입니다","무조건 유지하세요","해지하면 안 됩니다","환급금 이만큼 나옵니다","반드시 갈아타야 합니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "감액·감액완납·납입유예 차이",
    slug: "premium-reduction-deferral-difference",
    summary: "보험료 부담 완화 수단인 감액·감액완납·납입유예의 차이를 중립적으로 설명하는 FAQ입니다.",
    category: "cancellation",
    type: "faq",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "계약 유지",
    tags: ["감액","납입유예","FAQ"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 세 제도는 상품·보험사·계약 상태에 따라 적용 가능 여부와 효과가 다릅니다.

개념 정리(일반적):
- **감액**: 보험가입금액(보장) 조정 — 약관·심사 확인 필요
- **감액완납**: 일시적 완납 형태 — 상품별 정의 확인
- **납입유예**: 보험료 납입 일시 유예 — 기간·이자·보장 영향 확인

공식 약관·보험사 안내로 확인해야 합니다. 특정 방법이 고객에게 “유리하다”고 단정하지 않습니다.`,
    safeCopy: `보험료 부담을 줄이는 방법은 여러 가지가 있으며, 상품마다 적용 조건이 다릅니다. 약관과 보험사 안내를 확인한 뒤 선택지를 비교해 보시면 좋겠습니다.`,
    forbiddenClaims: ["납입유예 하면 무조건 좋습니다","감액하면 손해 없습니다","이 방법이 정답입니다","해지보다 무조건 낫습니다","가입 유지 보장됩니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "실효와 부활 상담 시 확인할 기준",
    slug: "lapse-reinstatement-counseling-guide",
    summary: "실효·부활(효력 회복) 상담 시 확인할 약관·절차·고객 안내 포인트입니다.",
    category: "cancellation",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "계약 유지",
    tags: ["실효","부활","유지"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 실효·부활 규정은 상품·경과 기간·납입 이력에 따라 다릅니다.

확인:
- 실효 시점·사유(미납 등) 사실 확인
- 부활 가능 기간·절차·추가 납입 요건 — **약관**
- 부활 시 보장 재개 범위·면책·고지 재확인 필요 여부
- 부활 불가 시 대안(신규 가입 등) — **심사 후**`,
    safeCopy: `실효·부활 가능 여부는 가입 상품 약관과 보험사 기준으로 확인이 필요합니다. 절차와 필요 서류를 안내드리겠습니다.`,
    forbiddenClaims: ["부활하면 무조건 됩니다","실효돼도 보장 그대로","고지 안 해도 부활됩니다","확정 부활","거절 없음"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "자동대출납입 안내 시 주의할 표현",
    slug: "automatic-premium-loan-wording-safety",
    summary: "자동대출납입(APL 등) 안내 시 이자·보장·환급에 대한 단정을 피하는 기준입니다.",
    category: "cancellation",
    type: "safety_boundary",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안전 경계 초안",
    sourceUrl: null,
    workflowLabel: "계약 유지",
    tags: ["자동대출납입","안전문구"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 자동대출납입은 계약 유지에 도움이 될 수 있으나, **이자·대출잔액·보장·환급금 영향**은 약관·상품별로 다릅니다.

주의:
- “당장 납입 부담 없음”만 강조하지 않기
- 장기 이자·환급금 감소 가능성 설명(약관 기준)
- 대안(납입유예·감액 등)과 비교 — **강요 없이**`,
    safeCopy: `자동대출납입은 상품 약관에 따라 이자와 보장·환급에 영향을 줄 수 있습니다. 약관 확인 후 장단점을 함께 검토해 보시면 좋겠습니다.`,
    forbiddenClaims: ["이자 없습니다","무조건 유리합니다","환급금 그대로","하면 손해 없음","안 하면 실효 확정"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "보험료 부담 고객에게 먼저 물어볼 질문",
    slug: "premium-burden-intake-questions",
    summary: "보험료 부담 상담에서 고객 상황을 파악하기 위한 중립 질문 목록입니다.",
    category: "cancellation",
    type: "faq",
    riskLevel: "low",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "계약 유지",
    tags: ["보험료","상담","질문"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 보험료 부담 원인(소득 변화·다계약·납입 주기 등)을 파악해 **선택지**를 정리합니다.

질문 예시:
- 일시적 어려움인지, 지속적인 부담인지
- 우선 유지하려는 계약이 있는지
- 납입 주기·납입 방법 변경 검토 여부
- 감액·납입유예·해지 중 어떤 방향을 고려 중인지

해결책 단정·상품 전환 강요는 하지 않습니다.`,
    safeCopy: `보험료 부담 상황을 조금 더 알려주시면, 약관 범위 안에서 확인할 수 있는 방법을 함께 정리해 드리겠습니다.`,
    forbiddenClaims: ["갈아타야 합니다","해지하세요","이 상품이 답입니다","보험료 깎아드립니다","무조건 유지"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "약관 확인이 필요한 상담 상황",
    slug: "when-policy-terms-review-needed",
    summary: "약관·특약 확인이 특히 필요한 상담 상황을 정리합니다.",
    category: "disclosure",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "공시·약관",
    tags: ["약관","공시","확인"],
    content: `본 자료는 보험설계사 실무 참고용입니다. \`/disclosure-links\`와 보험사 공식 사이트를 우선합니다.

약관 확인이 필요한 상황 예:
- 보장 개시·면책·감액기간 문의
- 특약 추가·삭제·변경
- 해지환급·연금·배당 관련 설명
- 청구·고지·실효·부활 규정 문의
- 타 채널(블로그·카페) 정보와 공식 약관이 다른 경우

비공식 자료를 확정 근거로 사용하지 않습니다.`,
    safeCopy: `해당 내용은 상품 약관과 공식 공시 자료로 확인하는 것이 가장 정확합니다. 함께 공식 경로를 안내드리겠습니다.`,
    forbiddenClaims: ["약관 없어도 됩니다","인터넷 글이 맞습니다","제가 확정 답변","보장된다","안 된다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "공시실에서 확인할 수 있는 정보",
    slug: "disclosure-room-what-to-check",
    summary: "보험사 공시실에서 설계사가 확인할 수 있는 정보 범주를 링크 가이드 형태로 정리합니다.",
    category: "disclosure",
    type: "link_guide",
    riskLevel: "low",
    sourceType: "official",
    sourceTitle: "보험사 공시실 안내(일반)",
    sourceUrl: null,
    workflowLabel: "공시·약관",
    tags: ["공시실","링크","공식"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 공시실 항목명은 보험사마다 다릅니다.

확인 범주 예:
- 상품 요약·약관·특약
- 보험료·환급금 예시(표)
- 청구·지급 관련 안내
- 판매용 설명서·중요 사항

PlannerDesk \`/disclosure-links\`에서 보험사별 링크를 확인합니다. 공식 URL만 사용합니다.`,
    safeCopy: `해당 상품은 보험사 공시실의 약관·상품설명 자료로 확인하실 수 있습니다. 링크를 안내드리겠습니다.`,
    forbiddenClaims: ["공시실 없어도 됨","블로그 링크로 충분","제 말이 약관과 같음","수익률 보장","확정"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "면책기간·감액기간 안내 기준",
    slug: "waiting-reduction-period-guide",
    summary: "면책기간·감액기간 설명 시 단정을 피하고 약관 확인을 강조하는 기준입니다.",
    category: "disclosure",
    type: "practical_standard",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "공시·약관",
    tags: ["면책","감액기간","약관"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 기간·적용 담보·예외는 **약관**에 있습니다.

안내 원칙:
- 일반 개념만 설명, 개별 계약 적용 여부는 약관 확인
- “기간 지나면 무조건 지급” 표현 금지
- 질병·사고별 차이 가능성 안내`,
    safeCopy: `면책·감액 기간은 가입 상품 약관에 따라 다릅니다. 약관에서 해당 담보의 기간과 조건을 함께 확인해 보시면 좋겠습니다.`,
    forbiddenClaims: ["90일 지나면 받을 수 있습니다","면책 없습니다","감액 없음","보장 시작됩니다","확정 지급"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "갱신형과 비갱신형 설명 시 주의점",
    slug: "renewable-vs-non-renewable-caution",
    summary: "갱신형·비갱신형 설명 시 보험료·보장 변경 가능성을 과장하지 않는 FAQ입니다.",
    category: "disclosure",
    type: "faq",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 실무 참고 초안",
    sourceUrl: null,
    workflowLabel: "공시·약관",
    tags: ["갱신형","비갱신형","FAQ"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 갱신 시 보험료·보장 조정 규칙은 상품·약관에 따릅니다.

주의:
- “갱신형은 무조건 비싸다/불리하다” 단정 금지
- “비갱신형이 무조건 유리” 단정 금지
- 갱신 시점·통지·거절권 등 약관 확인 안내`,
    safeCopy: `갱신형·비갱신형은 보험료와 보장 구조가 다릅니다. 가입하신 상품 약관에서 갱신 조건을 함께 확인해 보시면 좋겠습니다.`,
    forbiddenClaims: ["갱신형 절대 사지 마세요","비갱신만 좋습니다","갱신해도 보험료 동일","보장 끊기지 않음","확정"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "해지환급금표 안내 시 피해야 할 표현",
    slug: "surrender-value-table-wording-safety",
    summary: "해지환급금·환급금표 안내 시 확정 금액 약속을 피하는 안전 경계 문서입니다.",
    category: "disclosure",
    type: "safety_boundary",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안전 경계 초안",
    sourceUrl: null,
    workflowLabel: "공시·약관",
    tags: ["해지환급금","환급금표"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 환급금은 경과 기간·납입·계약 상태·공시 기준일에 따라 달라집니다.

피할 표현:
- “지금 해지하면 ○○만원” (표 기준일·계약 상태 미확인)
- “원금 보장”
- “손해 없음”

대체:
- 공시 환급금표·해지 시점 기준 안내
- 예시는 참고용, 실제는 보험사 산출`,
    safeCopy: `해지환급금은 해지 시점과 계약 상태에 따라 달라집니다. 공식 환급금표 기준으로 확인해 드리겠습니다.`,
    forbiddenClaims: ["환급금 100% 보장","원금 나옵니다","손해 없이 해지","이 금액 확정","예상 환급액 ○○만원"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "청구서류 안내 문자 기본형",
    slug: "message-template-claim-documents-basic",
    summary: "청구서류 안내용 중립 메시지 샘플입니다. 지급 단정 없이 공식 확인을 안내합니다.",
    category: "customer_message",
    type: "message_sample",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안내문 샘플 초안",
    sourceUrl: null,
    workflowLabel: "고객 안내",
    tags: ["안내문","청구서류","문자"],
    content: `본 자료는 보험설계사 실무 참고용입니다. \`/message-templates\`와 함께 사용합니다. 고객별 상황에 맞게 수정합니다.`,
    safeCopy: `안녕하세요. ○○보험 △△설계사입니다. 청구 관련 안내드립니다. 필요 서류와 접수 방법은 가입하신 상품·보험사 기준에 따라 달라 공식 안내를 확인한 뒤 순서대로 보내드리겠습니다. 지급 여부는 보험사 심사 후 결정됩니다. 감사합니다.`,
    forbiddenClaims: ["청구하시면 받으실 수 있습니다","이 서류만 보내주세요","진단서 사진 보내주세요","주민번호 알려주세요","금액 나옵니다"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "고지사항 확인 요청 문자 기본형",
    slug: "message-template-disclosure-check",
    summary: "고지·청약서 확인을 요청하는 중립 메시지 샘플입니다.",
    category: "customer_message",
    type: "message_sample",
    riskLevel: "medium",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안내문 샘플 초안",
    sourceUrl: null,
    workflowLabel: "고지·심사",
    tags: ["안내문","고지","문자"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 고객이 직접 청약서에 기재할 수 있도록 안내합니다.`,
    safeCopy: `안녕하세요. 청약 진행을 위해 최근 치료·검사·입원·수술·복용 약 관련 내용을 청약서 질문에 맞춰 정리해 주시면 감사하겠습니다. 기억나시는 범위부터 적어 주셔도 됩니다. 인수 조건은 보험사 심사 후 안내됩니다.`,
    forbiddenClaims: ["고지 안 하셔도 됩니다","거절 안 됩니다","가입 확정","이렇게만 쓰세요","거짓말해도 됨"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "약관 확인 안내 문자 기본형",
    slug: "message-template-terms-review",
    summary: "약관·공시 링크 확인을 안내하는 메시지 샘플입니다.",
    category: "customer_message",
    type: "message_sample",
    riskLevel: "low",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안내문 샘플 초안",
    sourceUrl: null,
    workflowLabel: "공시·약관",
    tags: ["안내문","약관","문자"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 공식 링크만 공유합니다.`,
    safeCopy: `문의하신 내용은 상품 약관과 공식 공시 자료로 확인하는 것이 정확합니다. 보험사 공식 링크를 안내드리니 확인 후 추가 질문 주시면 도와드리겠습니다.`,
    forbiddenClaims: ["제 말이 약관과 같습니다","보장됩니다","안 됩니다","인터넷 후기가 맞습니다","확정 답"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "보험금 판단 유보 안내 문구",
    slug: "message-template-claim-decision-pending",
    summary: "보험금 지급 여부·금액 질문에 대한 안전한 유보 응대 문구 샘플입니다.",
    category: "customer_message",
    type: "message_sample",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 안전 경계 초안",
    sourceUrl: null,
    workflowLabel: "고객 안내",
    tags: ["보험금","유보","안내문"],
    content: `본 자료는 보험설계사 실무 참고용입니다. “받을 수 있나요?” 질문에 대한 표준 유보 응대입니다.`,
    safeCopy: `보험금 지급 여부와 금액은 가입 상품·약관·제출 서류·보험사 심사에 따라 결정됩니다. 먼저 필요 서류와 접수 방법을 공식 기준으로 안내드리고, 심사 결과는 보험사 안내를 따라 확인하시면 됩니다.`,
    forbiddenClaims: ["받을 수 있습니다","안 받습니다","○○만원 나옵니다","청구하면 됩니다","제가 확인해 드릴게요(판단)"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "개인정보·의료자료 입력 금지 안내문",
    slug: "message-template-no-pii-medical-data",
    summary: "고객에게 개인정보·의료기록을 채널로 보내지 말아 달라는 운영 안내문 샘플입니다.",
    category: "customer_message",
    type: "message_sample",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 운영 안전 초안",
    sourceUrl: null,
    workflowLabel: "운영 안전",
    tags: ["개인정보","의료자료","안내문"],
    content: `본 자료는 보험설계사 실무 참고용입니다. PlannerDesk·개인 메신저·이메일로 민감정보 수집하지 않습니다.`,
    safeCopy: `원활한 상담을 위해, 주민등록번호·증권번호·진단서·처방전·검사결과지·청구서류 사진 등은 메신저로 보내주시지 말아 주세요. 필요 서류는 보험사 공식 접수 채널로 제출해 주시면 됩니다. 다른 안내가 필요하시면 말씀해 주세요.`,
    forbiddenClaims: ["사진 보내주세요","주민번호 알려주세요","진단서 업로드","카톡으로 보내세요","제가 대신 접수"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "손해사정 오인 표현 방지 기준",
    slug: "avoid-loss-adjustment-misunderstanding",
    summary: "손해사정 업무로 오인될 수 있는 표현과 대체 표현을 정리합니다.",
    category: "operation_safety",
    type: "safety_boundary",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 운영 안전 초안",
    sourceUrl: null,
    workflowLabel: "운영 안전",
    tags: ["손해사정","오인방지"],
    content: `본 자료는 보험설계사 실무 참고용입니다. PlannerDesk와 설계사는 **손해사정인이 아니며**, 보험금 심사·현장 조사를 대행하지 않습니다.

오인 표현 예: “제가 조사해 드림”, “손해사정 결과”, “현장 나감”, “보상 책임진”

대체: “보험사 심사·접수 안내”, “서류·절차 안내”, “공식 채널 확인”`,
    safeCopy: `보험금 관련 판단과 조사는 보험사에서 진행합니다. 설계사는 필요 서류와 접수 방법을 공식 기준으로 안내해 드릴 수 있습니다.`,
    forbiddenClaims: ["손해사정 해드립니다","제가 심사합니다","현장 출동","보상 확정","조사 결과 말씀드림"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "고객 개인정보를 받지 않는 운영 원칙",
    slug: "no-customer-pii-operating-principle",
    summary: "설계사·PlannerDesk가 수집하지 않는 개인정보 범주와 대체 절차입니다.",
    category: "operation_safety",
    type: "safety_boundary",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 운영 안전 초안",
    sourceUrl: null,
    workflowLabel: "운영 안전",
    tags: ["개인정보","운영원칙"],
    content: `본 자료는 보험설계사 실무 참고용입니다.

수집 금지 예: 주민등록번호, 계좌 전체, 증권번호 전체, 비밀번호, 고객 서명 원본 대량 수집

대체: 보험사 공식 시스템·고객 직접 입력·마스킹된 확인(정책 허용 범위 내)

PlannerDesk는 고객 개인정보 저장 기능을 제공하지 않습니다.`,
    safeCopy: `민감한 개인정보는 메신저로 전달하지 말아 주시고, 보험사 공식 절차를 이용해 주시면 감사하겠습니다.`,
    forbiddenClaims: ["주민번호 보내주세요","계좌번호 알려주세요","증권번호 입력하세요","신분증 사진","고객 자료 업로드"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "의료자료 업로드 금지 운영 기준",
    slug: "no-medical-record-upload-policy",
    summary: "진단서·처방전·검사지·청구서류 원본 업로드를 요구하지 않는 기준입니다.",
    category: "operation_safety",
    type: "safety_boundary",
    riskLevel: "high",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 운영 안전 초안",
    sourceUrl: null,
    workflowLabel: "운영 안전",
    tags: ["의료자료","업로드금지"],
    content: `본 자료는 보험설계사 실무 참고용입니다. 의료기록은 **보험사 청구·심사 채널**로 제출합니다.

금지: PlannerDesk 업로드, 카톡·메일 대량 수신, “사진 보내주시면 검토”

허용 방향: 서류 목록 안내, 제출처 안내, 제출 여부는 고객·보험사 확인`,
    safeCopy: `진단서·처방전·영수증 등은 보험사가 안내한 공식 방법으로 제출해 주세요. 메신저로 의료기록 사진을 보내주시지 말아 주세요.`,
    forbiddenClaims: ["진단서 올려주세요","처방전 사진","검사결과지 업로드","제가 검토해 드림","의료기록 보내주시면 확인"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "출처 확인일과 검수상태 관리 기준",
    slug: "source-check-date-and-review-status",
    summary: "sourceCheckedAt·draft/needs_review/verified 운영 기준을 정리합니다.",
    category: "operation_safety",
    type: "practical_standard",
    riskLevel: "low",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 운영 가이드 초안",
    sourceUrl: null,
    workflowLabel: "운영 안전",
    tags: ["출처","검수상태","운영"],
    content: `본 자료는 보험설계사 실무 참고용입니다. Admin \`/admin/knowledge\`에서 관리합니다.

원칙:
- 공식 출처 확인 후 \`sourceCheckedAt\` 기록(실제 확인일만)
- \`draft\`: 작성 중, public 미노출
- \`needs_review\`: 검수 대기, publish 시 public 후보 가능(정책 충족 시)
- \`verified\`: 검수 완료 후 publish 검토
- \`aiUsable\`은 verified 이후 별도 정책`,
    safeCopy: `*(운영자용 — 고객 발송 문구 아님)*`,
    forbiddenClaims: ["확인 안 했는데 날짜 입력","검수 없이 공개","AI 바로 사용","출처 없이 확정","블로그만 보고 verified"],
  },
  {
    ...DRAFT_DEFAULTS,
    title: "draft·needs_review·verified 운영 기준",
    slug: "knowledge-status-draft-review-verified",
    summary: "지식 문서 검수 상태별 의미와 public·AI 사용 조건을 PlannerDesk 운영 관점에서 정리합니다.",
    category: "plannerdesk_usage",
    type: "practical_standard",
    riskLevel: "low",
    sourceType: "internal",
    sourceTitle: "PlannerDesk 사용법 초안",
    sourceUrl: null,
    workflowLabel: "PlannerDesk 사용법",
    tags: ["draft","needs_review","verified","운영"],
    content: `본 자료는 보험설계사·운영자 참고용입니다.

| status | 의미 | public | aiUsable |
|--------|------|--------|----------|
| draft | 작성 중 | 미노출 | false |
| needs_review | 검수 필요, 공식 출처 확인 중 | isPublished=true 시 후보 | false |
| verified | 검수 완료 | isPublished=true 시 후보 | 별도 승인 후만 true 검토 |
| archived / rejected | 보관·반려 | 미노출 | false |

public 조건(참고): \`isPublished=true\` AND status ∈ {verified, needs_review}. \`/knowledge\` DB fetch는 PR-KNOW-PUBLIC-01 기준.`,
    safeCopy: `지식 아카이브 문서는 검수 상태가 표시됩니다. ‘검수 필요’는 확정 자료가 아니며, 공식 출처 확인 후 이용해 주세요.`,
    forbiddenClaims: ["검수 필요=확정","verified=지급 보장","draft도 공개됨","AI가 답변 확정","검수 생략 가능"],
  }
];
