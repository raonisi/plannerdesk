import { prisma } from "@/lib/prisma";
import {
  buildClaimDocumentGovernanceListWithDb,
  isGovernanceNeedsReviewAttention,
} from "@/lib/claim-documents/governance-helpers";
import {
  probeCorrectionRequestTable,
  type AdminDashboardSnapshot,
} from "@/lib/admin/dashboard-status";
import { WORK_LINK_REVIEW_MOCK_CANDIDATES } from "@/lib/work-links/review-mock-candidates";

export type AdminOperationalMetricCard = {
  id: string;
  title: string;
  count: number | null;
  description: string;
  href: string;
};

export type AdminOperationalTaskItem = {
  id: string;
  label: string;
  href: string;
  detail?: string;
};

export type AdminOperationalTaskGroup = {
  id: string;
  category: string;
  href: string;
  viewAllLabel: string;
  items: AdminOperationalTaskItem[];
};

export type AdminOperationalMenuCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  statusCount: string;
  buttonLabel: string;
};

export type AdminOperationalDashboardSnapshot = {
  metricCards: AdminOperationalMetricCard[];
  todayTaskGroups: AdminOperationalTaskGroup[];
  menuCards: AdminOperationalMenuCard[];
};

const TASK_LIMIT = 5;

function isWorkLinkNeedingReview(
  candidate: (typeof WORK_LINK_REVIEW_MOCK_CANDIDATES)[number],
): boolean {
  return (
    candidate.reviewStatus === "draft" ||
    candidate.reviewStatus === "needs_review" ||
    candidate.reviewStatus === "stale"
  );
}

function isWorkLinkMissingOfficialSource(
  candidate: (typeof WORK_LINK_REVIEW_MOCK_CANDIDATES)[number],
): boolean {
  return !candidate.officialSourceUrl?.trim();
}

async function probeRecentGovernanceAuditCount(): Promise<number | null> {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await prisma.claimDocumentGovernanceAuditLog.count({
      where: { changedAt: { gte: since } },
    });
  } catch {
    return null;
  }
}

export async function buildAdminOperationalDashboardSnapshot(
  _dashboard: AdminDashboardSnapshot,
): Promise<AdminOperationalDashboardSnapshot> {
  const [correctionProbe, governanceItems, recentAuditCount] = await Promise.all([
    probeCorrectionRequestTable(),
    buildClaimDocumentGovernanceListWithDb(),
    probeRecentGovernanceAuditCount(),
  ]);

  const correctionNew =
    correctionProbe.status === "ok" ? correctionProbe.newCount : null;

  const linksNeedingReview = WORK_LINK_REVIEW_MOCK_CANDIDATES.filter(
    isWorkLinkNeedingReview,
  ).length;

  const claimMissingOfficialUrl = governanceItems.filter(
    (item) => !item.governance.officialSourceUrl,
  ).length;

  const claimMissingLastVerified = governanceItems.filter(
    (item) => !item.governance.lastVerifiedAt,
  ).length;

  const claimNeedsReview = governanceItems.filter((item) =>
    isGovernanceNeedsReviewAttention(item.governance),
  ).length;

  const metricCards: AdminOperationalMetricCard[] = [
    {
      id: "corrections",
      title: "정보 수정 요청",
      count: correctionNew,
      description: "public에서 접수된 미처리 제보",
      href: "/admin/corrections",
    },
    {
      id: "work-links-review",
      title: "검수 필요 링크",
      count: linksNeedingReview,
      description: "업무 링크 후보 중 검수·재확인 필요",
      href: "/admin/work-links",
    },
    {
      id: "claim-missing-url",
      title: "공식 URL 미등록 청구서류",
      count: claimMissingOfficialUrl,
      description: "PDF governance 기준 공식 URL 미등록",
      href: "/admin/claim-documents/governance",
    },
    {
      id: "recent-audit",
      title: "최근 변경 이력",
      count: recentAuditCount,
      description: "최근 7일 청구서류 governance 변경",
      href: "/admin/claim-documents/governance",
    },
  ];

  const todayTaskGroups: AdminOperationalTaskGroup[] = [];

  const missingUrlTasks = governanceItems
    .filter((item) => !item.governance.officialSourceUrl)
    .slice(0, TASK_LIMIT)
    .map((item) => ({
      id: `claim-url-${item.governance.documentKey}`,
      label: `${item.governance.insurerName} · ${item.governance.documentTitle}`,
      href: "/admin/claim-documents/governance",
      detail: "공식 URL 미등록",
    }));

  if (missingUrlTasks.length > 0) {
    todayTaskGroups.push({
      id: "claim-missing-url",
      category: "공식 URL 미등록 청구서류",
      href: "/admin/claim-documents/governance",
      viewAllLabel: "청구서류 검수 전체 보기",
      items: missingUrlTasks,
    });
  }

  const missingVerifiedTasks = governanceItems
    .filter((item) => !item.governance.lastVerifiedAt)
    .slice(0, TASK_LIMIT)
    .map((item) => ({
      id: `claim-verified-${item.governance.documentKey}`,
      label: `${item.governance.insurerName} · ${item.governance.documentTitle}`,
      href: "/admin/claim-documents/governance",
      detail: "검수일 미등록",
    }));

  if (missingVerifiedTasks.length > 0) {
    todayTaskGroups.push({
      id: "claim-missing-verified",
      category: "검수일 미등록 문서",
      href: "/admin/claim-documents/governance",
      viewAllLabel: "청구서류 검수 전체 보기",
      items: missingVerifiedTasks,
    });
  }

  if (correctionNew !== null && correctionNew > 0) {
    todayTaskGroups.push({
      id: "corrections",
      category: "사용자 수정 요청",
      href: "/admin/corrections",
      viewAllLabel: "제보함 전체 보기",
      items: [
        {
          id: "corrections-summary",
          label: `미처리 신규 제보 ${correctionNew}건`,
          href: "/admin/corrections",
          detail: "상태 new",
        },
      ].slice(0, TASK_LIMIT),
    });
  }

  const staleLinkTasks = WORK_LINK_REVIEW_MOCK_CANDIDATES.filter(
    (candidate) =>
      candidate.reviewStatus === "stale" ||
      !candidate.lastVerifiedAt?.trim(),
  )
    .slice(0, TASK_LIMIT)
    .map((candidate) => ({
      id: `wl-stale-${candidate.id}`,
      label: `${candidate.insurerName} · ${candidate.title}`,
      href: "/admin/work-links",
      detail: candidate.lastVerifiedAt ? "재확인 필요" : "확인일 미등록",
    }));

  if (staleLinkTasks.length > 0) {
    todayTaskGroups.push({
      id: "stale-links",
      category: "오래된 확인일 항목",
      href: "/admin/work-links",
      viewAllLabel: "업무 링크 검수 전체 보기",
      items: staleLinkTasks,
    });
  }

  const mockDraftTasks = WORK_LINK_REVIEW_MOCK_CANDIDATES.filter(
    (candidate) =>
      candidate.reviewStatus === "draft" || isWorkLinkMissingOfficialSource(candidate),
  )
    .slice(0, TASK_LIMIT)
    .map((candidate) => ({
      id: `wl-mock-${candidate.id}`,
      label: `${candidate.insurerName} · ${candidate.title}`,
      href: "/admin/work-links",
      detail: candidate.reviewStatus === "draft" ? "초안" : "공식 출처 미확인",
    }));

  if (mockDraftTasks.length > 0) {
    todayTaskGroups.push({
      id: "mock-draft",
      category: "mock 상태 · 공식 출처 미확인",
      href: "/admin/work-links",
      viewAllLabel: "업무 링크 검수 전체 보기",
      items: mockDraftTasks,
    });
  }

  const reviewLinkTasks = WORK_LINK_REVIEW_MOCK_CANDIDATES.filter(
    isWorkLinkNeedingReview,
  )
    .slice(0, TASK_LIMIT)
    .map((candidate) => ({
      id: `wl-review-${candidate.id}`,
      label: `${candidate.insurerName} · ${candidate.title}`,
      href: "/admin/work-links",
      detail: "검수 필요",
    }));

  if (reviewLinkTasks.length > 0) {
    todayTaskGroups.push({
      id: "review-links",
      category: "검수 필요 링크",
      href: "/admin/work-links",
      viewAllLabel: "업무 링크 검수 전체 보기",
      items: reviewLinkTasks,
    });
  }

  const menuCards: AdminOperationalMenuCard[] = [
    {
      id: "claim-governance",
      title: "청구서류 검수 관리",
      description: "PDF governance · 공식 URL · 검수일 · 노출 여부",
      href: "/admin/claim-documents/governance",
      statusCount: `검수 필요 ${claimNeedsReview} · URL 미등록 ${claimMissingOfficialUrl}`,
      buttonLabel: "검수 보드 열기",
    },
    {
      id: "insurers",
      title: "보험사 링크 관리",
      description: "전산·연락처·청구·공식 링크 CRUD",
      href: "/admin/insurers",
      statusCount: "DB CRUD",
      buttonLabel: "보험사 관리",
    },
    {
      id: "corrections",
      title: "정보 수정 요청 관리",
      description: "public 제보 인박스 · 수동 반영",
      href: "/admin/corrections",
      statusCount:
        correctionNew === null ? "DB 확인 필요" : `신규 ${correctionNew}건`,
      buttonLabel: "제보함 열기",
    },
    {
      id: "work-links",
      title: "업무 링크 검수 관리",
      description: "업무 링크 후보 검수 · 공개 범위 확인",
      href: "/admin/work-links",
      statusCount: `검수 필요 ${linksNeedingReview}건`,
      buttonLabel: "링크 검수 열기",
    },
    {
      id: "change-history",
      title: "변경 이력 확인",
      description: "청구서류 governance audit log · 상세 패널",
      href: "/admin/claim-documents/governance",
      statusCount:
        recentAuditCount === null
          ? "최근 7일 —"
          : `최근 7일 ${recentAuditCount}건`,
      buttonLabel: "이력 확인",
    },
  ];

  return {
    metricCards,
    todayTaskGroups: todayTaskGroups.slice(0, 6),
    menuCards,
  };
}
