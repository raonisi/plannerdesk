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
  messageTemplateProbe: MessageTemplateTableProbe;
};

export type KnowledgeTableProbe =
  | { status: "ok"; count: number }
  | { status: "missing_table" }
  | { status: "unavailable" };

export type MessageTemplateTableProbe =
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

export async function probeMessageTemplateTable(): Promise<MessageTemplateTableProbe> {
  try {
    const count = await prisma.messageTemplate.count();
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
        "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 검수 상태별로 관리합니다.",
      href: "/admin/knowledge",
      availability: "setup_required",
      statusBadge: "설정 필요",
      lastCheckLabel: "KnowledgeArticle 테이블 없음",
      nextAction:
        "운영 DB에 KnowledgeArticle migration을 적용한 뒤 관리 화면을 사용하세요.",
      buttonLabel: "설정 필요",
      buttonEnabled: true,
    };
  }

  if (probe.status === "unavailable") {
    return {
      id: "knowledge",
      title: "지식 아카이브 관리",
      description:
        "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 검수 상태별로 관리합니다.",
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

  if (probe.count === 0) {
    return {
      id: "knowledge",
      title: "지식 아카이브 관리",
      description:
        "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 검수 상태별로 관리합니다.",
      href: "/admin/knowledge",
      availability: "active_with_warning",
      statusBadge: "확인 필요",
      lastCheckLabel: "등록된 문서 0건",
      nextAction:
        "초안 등록 또는 starter import 후 검수·게시 상태를 확인하세요. (production import는 승인 후)",
      buttonLabel: "확인하기",
      buttonEnabled: true,
    };
  }

  return {
    id: "knowledge",
    title: "지식 아카이브 관리",
    description:
      "설계사 실무 기준, 고객 안내문, 운영 안전 문서를 검수 상태별로 관리합니다.",
    href: "/admin/knowledge",
    availability: "active",
    statusBadge: "운영 중",
    lastCheckLabel: `등록 문서 ${probe.count}건`,
    nextAction: "검수·게시 상태를 확인하고 공개 조건을 점검하세요.",
    buttonLabel: "관리하기",
    buttonEnabled: true,
  };
}

function messageTemplateFeature(
  probe: MessageTemplateTableProbe,
): AdminDashboardFeature {
  if (probe.status === "missing_table") {
    return {
      id: "message-templates",
      title: "고객 안내 문구 관리",
      description:
        "고객에게 보낼 수 있는 중립 안내 문구와 금지 표현을 관리합니다.",
      href: "/admin/message-templates",
      availability: "setup_required",
      statusBadge: "설정 필요",
      lastCheckLabel: "MessageTemplate 테이블 없음",
      nextAction:
        "운영 DB에 MessageTemplate migration을 적용한 뒤 관리 화면을 사용하세요.",
      buttonLabel: "설정 필요",
      buttonEnabled: true,
    };
  }

  if (probe.status === "unavailable") {
    return {
      id: "message-templates",
      title: "고객 안내 문구 관리",
      description:
        "고객에게 보낼 수 있는 중립 안내 문구와 금지 표현을 관리합니다.",
      href: "/admin/message-templates",
      availability: "blocked",
      statusBadge: "점검 필요",
      lastCheckLabel: "DB 연결 확인 필요",
      nextAction: "잠시 후 다시 시도하거나 운영 로그를 확인하세요.",
      buttonLabel: "점검 필요",
      buttonEnabled: true,
    };
  }

  if (probe.count === 0) {
    return {
      id: "message-templates",
      title: "고객 안내 문구 관리",
      description:
        "상담, 안내, 후속 연락 문구를 검수 기준에 맞춰 관리합니다.",
      href: "/admin/message-templates",
      availability: "active_with_warning",
      statusBadge: "확인 필요",
      lastCheckLabel: "등록 문구 0건",
      nextAction:
        "초안 등록 후 safeCopy·금지 표현·허용 변수를 검수하고 published 상태에서만 게시하세요.",
      buttonLabel: "관리하기",
      buttonEnabled: true,
    };
  }

  return {
    id: "message-templates",
    title: "고객 안내 문구 관리",
    description:
      "상담, 안내, 후속 연락 문구를 검수 기준에 맞춰 관리합니다.",
    href: "/admin/message-templates",
    availability: "active",
    statusBadge: "운영 중",
    lastCheckLabel: `등록 문구 ${probe.count}건 · DB CRUD`,
    nextAction:
      "HIGH 위험도·내부 전용 문구는 public 게시 전 safeCopy와 검수 완료를 확인하세요.",
    buttonLabel: "관리하기",
    buttonEnabled: true,
  };
}

export async function buildAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const [knowledgeProbe, messageTemplateProbe] = await Promise.all([
    probeKnowledgeArticleTable(),
    probeMessageTemplateTable(),
  ]);

  const features: AdminDashboardFeature[] = [
    {
      id: "insurers",
      title: "보험사 디렉토리 관리",
      description:
        "보험사 전산, 연락처, 청구 팩스, 약관 링크, 카드납 정보를 관리합니다.",
      href: "/admin/insurers",
      availability: "active",
      statusBadge: "운영 중",
      lastCheckLabel: "DB CRUD · 일괄 검수 연결됨",
      nextAction: "공식 출처 기준으로 연락처·링크를 검수한 뒤 공개 여부를 결정하세요.",
      buttonLabel: "관리하기",
      buttonEnabled: true,
    },
    {
      id: "claim-documents",
      title: "청구서류 관리",
      description: "보험사별 청구서류와 청구 유형별 안내 기준을 관리합니다.",
      href: "/admin/claim-documents",
      availability: "active",
      statusBadge: "운영 중",
      lastCheckLabel: "DB CRUD · 일괄 검수 연결됨",
      nextAction: "필요 서류 목록과 공식 출처 링크를 최신 상태로 유지하세요.",
      buttonLabel: "관리하기",
      buttonEnabled: true,
    },
    knowledgeFeature(knowledgeProbe),
    {
      id: "disclosure-links",
      title: "공시·약관 링크 관리",
      description:
        "공식 공시, 약관, 협회·감독기관 링크를 검수 후 관리합니다.",
      href: "/admin/disclosure-links",
      availability: "active",
      statusBadge: "운영 중",
      lastCheckLabel: "DB CRUD · 단건 검수·게시",
      nextAction:
        "공식 출처를 확인한 뒤 검수 완료(published) 상태에서만 게시하세요. 일괄 변경은 PR-77 예정.",
      buttonLabel: "관리하기",
      buttonEnabled: true,
    },
    messageTemplateFeature(messageTemplateProbe),
  ];

  const knowledgeBulkAvailability: AdminFeatureAvailability =
    knowledgeProbe.status === "ok"
      ? knowledgeProbe.count === 0
        ? "active_with_warning"
        : "active"
      : knowledgeProbe.status === "missing_table"
        ? "setup_required"
        : "blocked";

  const bulkWorkflows: AdminBulkWorkflow[] = [
    {
      id: "bulk-insurers",
      title: "보험사 일괄 검수·게시",
      description: "선택한 보험사의 검수 상태와 공개 여부를 일괄 변경합니다.",
      href: "/admin/insurers",
      availability: "active",
      statusBadge: "사용 가능",
      nextAction: "목록에서 항목을 선택한 뒤 일괄 작업을 실행하세요.",
      buttonLabel: "보험사 목록",
      buttonEnabled: true,
    },
    {
      id: "bulk-claim-documents",
      title: "청구서류 일괄 검수·게시",
      description: "청구서류 검수·게시 상태를 일괄 변경합니다.",
      href: "/admin/claim-documents",
      availability: "active",
      statusBadge: "사용 가능",
      nextAction: "공개 전 검수 상태와 draft 공개 차단 규칙을 확인하세요.",
      buttonLabel: "청구서류 목록",
      buttonEnabled: true,
    },
    {
      id: "bulk-knowledge",
      title: "지식 문서 일괄 검수·등록",
      description:
        "지식 문서 검수·게시·보관 및 starter 초안 일괄 등록(미리보기)을 수행합니다.",
      href: "/admin/knowledge",
      availability: knowledgeBulkAvailability,
      statusBadge:
        knowledgeBulkAvailability === "active"
          ? "사용 가능"
          : knowledgeBulkAvailability === "active_with_warning"
            ? "데이터 준비 필요"
            : knowledgeBulkAvailability === "setup_required"
              ? "설정 필요"
              : "점검 필요",
      nextAction:
        knowledgeBulkAvailability === "active"
          ? "일괄 변경 전 공식 출처·금지 표현을 확인하세요."
          : "KnowledgeArticle migration 또는 초안 등록 후 사용하세요.",
      buttonLabel:
        knowledgeBulkAvailability === "setup_required"
          ? "설정 필요"
          : knowledgeBulkAvailability === "blocked"
            ? "점검 필요"
            : "지식 아카이브",
      buttonEnabled: knowledgeBulkAvailability !== "blocked",
    },
    {
      id: "bulk-disclosure",
      title: "공시·약관 일괄 변경",
      description: "공시·약관 링크 목록에서 선택한 항목만 일괄 검수·게시합니다.",
      href: "/admin/disclosure-links",
      availability: "active",
      statusBadge: "사용 가능",
      nextAction: "목록에서 체크박스로 선택한 뒤 일괄 작업을 실행하세요.",
      buttonLabel: "공시·약관",
      buttonEnabled: true,
    },
    {
      id: "bulk-message-templates",
      title: "고객 문구 일괄 변경",
      description: "고객 안내 문구 목록에서 선택한 항목만 일괄 검수·게시합니다.",
      href: "/admin/message-templates",
      availability: "active",
      statusBadge: "사용 가능",
      nextAction: "safeCopy·내부 전용 조건을 확인한 뒤 일괄 공개하세요.",
      buttonLabel: "고객문구",
      buttonEnabled: true,
    },
  ];

  return {
    features,
    bulkWorkflows,
    summary: countByAvailability(features),
    knowledgeProbe,
    messageTemplateProbe,
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
    title: "등록된 데이터가 없습니다.",
    body: "새 항목을 등록하거나 초기 데이터를 가져온 뒤 검수 상태를 확인하세요.",
  },
  setupRequired: {
    title: "이 기능은 데이터베이스 설정이 필요합니다.",
    body: "운영 DB migration 또는 초기 데이터 등록이 완료된 뒤 사용할 수 있습니다.",
  },
  comingSoon: {
    title: "이 관리자 기능은 준비 중입니다.",
    body: "현재는 공개 화면에서만 이용 가능하며, 관리자 편집 기능은 별도 PR로 제공됩니다.",
  },
  error: {
    title: "관리자 데이터를 불러오지 못했습니다.",
    body: "잠시 후 다시 시도하거나 운영 로그를 확인하세요. 민감한 환경변수나 내부 오류 정보는 화면에 표시하지 않습니다.",
  },
} as const;
