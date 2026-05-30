import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminFeatureAvailability =
  | "active"
  | "active_with_warning"
  | "setup_required"
  | "coming_soon"
  | "blocked";

export type AdminDashboardFeature = {
  id: string;
  title: string;
  description: string;
  href: string;
  availability: AdminFeatureAvailability;
  statusBadge: string;
  lastCheckLabel: string;
  nextAction: string;
  buttonLabel: string;
  buttonEnabled: boolean;
};

export type AdminBulkWorkflow = {
  id: string;
  title: string;
  description: string;
  href: string | null;
  availability: AdminFeatureAvailability;
  statusBadge: string;
  nextAction: string;
  buttonLabel: string;
  buttonEnabled: boolean;
};

export type AdminDashboardSnapshot = {
  features: AdminDashboardFeature[];
  bulkWorkflows: AdminBulkWorkflow[];
  summary: {
    active: number;
    activeWithWarning: number;
    setupRequired: number;
    blocked: number;
    comingSoon: number;
  };
  knowledgeProbe: KnowledgeTableProbe;
};

export type KnowledgeTableProbe =
  | { status: "ok"; count: number }
  | { status: "missing_table" }
  | { status: "unavailable" };

function isPrismaMissingTable(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("does not exist") ||
      message.includes("relation") && message.includes("exist")
    );
  }
  return false;
}

export async function probeKnowledgeArticleTable(): Promise<KnowledgeTableProbe> {
  try {
    const count = await prisma.knowledgeArticle.count();
    return { status: "ok", count };
  } catch (error) {
    if (isPrismaMissingTable(error)) {
      return { status: "missing_table" };
    }
    return { status: "unavailable" };
  }
}

function countByAvailability(features: AdminDashboardFeature[]) {
  const summary = {
    active: 0,
    activeWithWarning: 0,
    setupRequired: 0,
    blocked: 0,
    comingSoon: 0,
  };

  for (const feature of features) {
    if (feature.availability === "active") summary.active += 1;
    else if (feature.availability === "active_with_warning") {
      summary.activeWithWarning += 1;
    } else if (feature.availability === "setup_required") {
      summary.setupRequired += 1;
    } else if (feature.availability === "blocked") summary.blocked += 1;
    else if (feature.availability === "coming_soon") summary.comingSoon += 1;
  }

  return summary;
}

function knowledgeFeature(probe: KnowledgeTableProbe): AdminDashboardFeature {
  if (probe.status === "missing_table") {
    return {
      id: "knowledge",
      title: "지식 아카이브 관리",
      description:
        "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 작성하고 검수 상태와 공개 여부를 관리합니다.",
      href: "/admin/knowledge",
      availability: "setup_required",
      statusBadge: "설정 필요",
      lastCheckLabel: "KnowledgeArticle migration 적용 여부와 초기 draft import 상태를 확인하세요.",
      nextAction:
        "테이블 설정 전에는 일괄 등록이나 공개 전환을 실행하지 마세요.",
      buttonLabel: "설정 필요",
      buttonEnabled: true,
    };
  }

  if (probe.status === "unavailable") {
    return {
      id: "knowledge",
      title: "지식 아카이브 관리",
      description:
        "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 작성하고 검수 상태와 공개 여부를 관리합니다.",
      href: "/admin/knowledge",
      availability: "blocked",
      statusBadge: "점검 필요",
      lastCheckLabel: "DB 연결 확인 필요",
      nextAction:
        "관리자 데이터를 불러오지 못했습니다. 잠시 후 다시 시도하거나 운영 로그를 확인하세요.",
      buttonLabel: "점검 필요",
      buttonEnabled: true,
    };
  }

  return {
    id: "knowledge",
    title: "지식 아카이브 관리",
    description:
      "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 작성하고 검수 상태와 공개 여부를 관리합니다.",
    href: "/admin/knowledge",
    availability: "active",
    statusBadge: "사용 가능",
    lastCheckLabel: "초안 문서는 public 화면에 노출되지 않으며, AI 참조 가능 여부는 별도 검수 후 설정해야 합니다.",
    nextAction: "초안은 draft로 등록하고, 검수 완료 후 필요한 문서만 공개하세요.",
    buttonLabel: "관리하기",
    buttonEnabled: true,
  };
}

export async function buildAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const knowledgeProbe = await probeKnowledgeArticleTable();

  const features: AdminDashboardFeature[] = [
    {
      id: "insurers",
      title: "보험사 디렉토리 관리",
      description:
        "보험사 전산 접속, 고객센터, 전산 헬프데스크, 청구 팩스, 약관 링크, 카드납 정보를 관리합니다.",
      href: "/admin/insurers",
      availability: "active",
      statusBadge: "사용 가능",
      lastCheckLabel: "검수되지 않은 링크와 연락처는 공개 전 반드시 확인이 필요합니다.",
      nextAction: "공식 출처 확인 후 검수 상태와 공개 여부를 관리하세요.",
      buttonLabel: "관리하기",
      buttonEnabled: true,
    },
    {
      id: "claim-documents",
      title: "청구서류 관리",
      description: "보험사별 청구서류와 청구 유형별 안내 기준을 관리합니다.",
      href: "/admin/claim-documents",
      availability: "active",
      statusBadge: "사용 가능",
      lastCheckLabel: "PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않습니다.",
      nextAction: "서류 안내는 청구 준비 참고용으로만 관리하고, 보험금 지급 여부 판단 문구는 포함하지 마세요.",
      buttonLabel: "관리하기",
      buttonEnabled: true,
    },
    knowledgeFeature(knowledgeProbe),
    {
      id: "disclosure-links",
      title: "공시·약관 링크 관리",
      description:
        "보험사 공시실, 상품공시, 약관 링크를 공식 출처 기준으로 관리하는 기능입니다.",
      href: "/admin/disclosure-links",
      availability: "coming_soon",
      statusBadge: "준비 중",
      lastCheckLabel: "공식 출처 확인 전 링크를 공개하지 않습니다.",
      nextAction:
        "관리자 CRUD와 공개 조건이 확정된 뒤 활성화됩니다.",
      buttonLabel: "준비 중",
      buttonEnabled: false,
    },
    {
      id: "message-templates",
      title: "고객 안내 문구 관리",
      description:
        "청구, 고지, 해지, 약관 안내 등 고객에게 전달할 수 있는 중립 문구를 관리하는 기능입니다.",
      href: "/admin/message-templates",
      availability: "coming_soon",
      statusBadge: "준비 중",
      lastCheckLabel: "보험금 지급 단정, 손해사정 오인, 의료자료 요청 문구는 사용할 수 없습니다.",
      nextAction:
        "금지 표현, 개인정보·의료자료 차단 기준, 검수 상태 체계가 적용된 뒤 활성화됩니다.",
      buttonLabel: "준비 중",
      buttonEnabled: false,
    },
  ];

  const bulkWorkflows: AdminBulkWorkflow[] = [
    {
      id: "bulk-operations",
      title: "일괄 작업 관리",
      description: "여러 데이터를 선택해 검수 상태, 공개 여부, 보관 상태를 일괄 변경하는 운영 기능입니다.",
      href: "/admin/insurers",
      availability: "active",
      statusBadge: "사용 가능",
      nextAction: "공통 Bulk 기반과 도메인별 권한 검수가 완료된 뒤 활성화됩니다.",
      buttonLabel: "일괄 작업 확인",
      buttonEnabled: true,
    }
  ];

  return {
    features,
    bulkWorkflows,
    summary: countByAvailability(features),
    knowledgeProbe,
  };
}

export const ADMIN_DASHBOARD_SAFETY_LINES = [
  "PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.",
  "PlannerDesk는 보험금 지급 금액을 산정하지 않습니다.",
  "PlannerDesk는 손해사정 업무를 수행하지 않습니다.",
  "PlannerDesk는 의료 진단을 해석하지 않습니다.",
  "고객 개인정보와 의료자료는 입력하거나 업로드하지 않습니다.",
  "공식 링크, 연락처, 서류 기준은 공개 전 공식 출처 확인이 필요합니다.",
] as const;

export type AdminPageStateKind = "empty" | "setupRequired" | "comingSoon" | "error";

export const ADMIN_PAGE_STATE_COPY: Record<
  AdminPageStateKind,
  { title: string; body: string }
> = {
  empty: {
    title: "등록된 데이터가 없습니다",
    body: "아직 등록된 관리 데이터가 없습니다. 초기 데이터를 가져오거나 새 항목을 작성한 뒤 검수 상태를 확인하세요.",
  },
  setupRequired: {
    title: "설정이 필요합니다",
    body: "이 기능은 코드가 준비되어 있으나 운영 DB 설정 또는 초기 데이터 확인이 필요합니다. 설정이 완료되기 전에는 일괄 등록, 일괄 공개, 일괄 상태 변경을 실행하지 마세요.",
  },
  comingSoon: {
    title: "준비 중인 관리자 기능입니다",
    body: "현재는 공개 화면에서만 이용 가능하며, 관리자 편집 기능은 별도 PR로 제공됩니다.",
  },
  error: {
    title: "관리자 데이터를 불러오지 못했습니다",
    body: "일시적인 서버 오류 또는 운영 설정 문제가 발생했습니다. 잠시 후 다시 시도하거나 운영 로그를 확인하세요. 민감한 환경변수, DB 접속 정보, 내부 오류 상세는 화면에 표시하지 않습니다.",
  },
} as const;
