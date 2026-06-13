import { signOut } from "@/auth";
import { surfaces, borders, textStyles } from "@/lib/design-system";
import { roleDisplayLabel } from "@/lib/auth/rbac";
import type { AdminDashboardSnapshot } from "@/lib/admin/dashboard-status";
import { ADMIN_DASHBOARD_SAFETY_LINES } from "@/lib/admin/dashboard-status";
import type { AdminOperationalDashboardSnapshot } from "@/lib/admin/operational-dashboard";
import AdminOperationalDashboard from "@/components/admin/AdminOperationalDashboard";
import AdminPlanningPanels from "@/components/admin/AdminPlanningPanels";

interface AdminShellProps {
  session: {
    user?: {
      email?: string | null;
      role?: string | null;
    } | null;
  } | null;
  dashboard: AdminDashboardSnapshot;
  operational: AdminOperationalDashboardSnapshot;
}

export default function AdminShell({
  session,
  dashboard,
  operational,
}: AdminShellProps) {
  const userEmail = session?.user?.email || "알 수 없는 운영자";
  const roleLabel = roleDisplayLabel(session?.user?.role);

  return (
    <div className={`min-h-screen ${surfaces.page}`}>
      <header className={`${surfaces.hero} border-b ${borders.divider} py-4 px-6 sm:px-8 print:hidden`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white">
              PlannerDesk Admin
            </span>
            <span className="rounded-full bg-[#aa8137] px-2 py-0.5 text-xs font-semibold text-white">
              MVP
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-[#d8c08f] sm:inline-block">
              접속: <span className="font-semibold text-white">{userEmail}</span>
              <span className="mx-2 opacity-50">|</span>
              역할: <span className="font-semibold text-white">{roleLabel}</span>
            </span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin" });
              }}
            >
              <button
                type="submit"
                className="cursor-pointer rounded bg-red-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-900"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <AdminOperationalDashboard snapshot={operational} />

        <details className="mb-8 rounded-xl border border-[#d6d8dc] bg-white print:hidden">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[#102235] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="text-[#aa8137]">고급</span> · 릴리스 준비 · 전체
            관리 영역 · 운영 계획 문서
            <span className="mt-1 block text-xs font-normal text-[#5f6670]">
              첫 화면 대시보드 외 레거시 운영 패널과 전체 기능 카드는 여기에서
              펼쳐 확인합니다.
            </span>
          </summary>
          <div className="border-t border-[#eceae4] px-5 pb-8 pt-6">
            <AdminPlanningPanels
              dashboard={dashboard}
              role={session?.user?.role}
            />
          </div>
        </details>

        <section
          className={`rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-5 py-5 print:hidden ${borders.default}`}
          aria-labelledby="admin-safety-boundary"
        >
          <h2
            id="admin-safety-boundary"
            className="text-sm font-bold text-[#102235]"
          >
            안전 경계
          </h2>
          <ul className={`mt-3 list-disc space-y-2 pl-5 ${textStyles.small}`}>
            {ADMIN_DASHBOARD_SAFETY_LINES.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
