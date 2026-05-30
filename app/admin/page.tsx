import { getAdminAccess } from "@/lib/auth/access";
import {
  buildAdminDashboardSnapshot,
  type AdminDashboardSnapshot,
} from "@/lib/admin/dashboard-status";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "관리자 데스크 | 플래너데스크",
  description: "플래너데스크 운영 자료를 관리하기 위한 공간입니다.",
};

function fallbackDashboard(): AdminDashboardSnapshot {
  return {
    features: [
      {
        id: "insurers",
        title: "보험사 디렉토리 관리",
        description:
          "보험사 전산, 연락처, 청구 팩스, 약관 링크, 카드납 정보를 관리합니다.",
        href: "/admin/insurers",
        availability: "active",
        statusBadge: "운영 중",
        lastCheckLabel: "대시보드 점검 제한",
        nextAction: "목록에서 검수·공개 상태를 확인하세요.",
        buttonLabel: "관리하기",
        buttonEnabled: true,
      },
    ],
    bulkWorkflows: [],
    summary: {
      active: 1,
      activeWithWarning: 0,
      setupRequired: 0,
      blocked: 0,
      comingSoon: 0,
    },
    knowledgeProbe: { status: "unavailable" },
    messageTemplateProbe: { status: "unavailable" },
  };
}

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (access.status !== "authenticated") {
    return null;
  }

  let dashboard: AdminDashboardSnapshot;
  try {
    dashboard = await buildAdminDashboardSnapshot();
  } catch {
    dashboard = fallbackDashboard();
  }

  return <AdminShell session={access.session} dashboard={dashboard} />;
}
