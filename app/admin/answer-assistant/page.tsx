import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { AnswerAssistantPanel } from "./answer-assistant-panel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 초안 | PlannerDesk Admin",
  description:
    "관리자 검수용 답변 초안 생성 도구입니다. 고객 자동 발송·커뮤니티 자동 게시는 제공하지 않습니다.",
};

export default async function AdminAnswerAssistantPage() {
  const access = await getAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return (
      <AdminAccessDeniedState email={access.session.user?.email ?? null} />
    );
  }

  return (
    <div className={`min-h-screen ${surfaces.page}`}>
      <header
        className={`${surfaces.hero} border-b ${borders.divider} px-6 py-4 sm:px-8`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#d8c08f]">
              PlannerDesk Admin
            </p>
            <h1 className="text-xl font-bold text-white">답변 보조 · 관리자 초안</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/audit"
            >
              Usage Audit
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/feedback"
            >
              Beta 피드백
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/cleanup"
            >
              Retention
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin"
            >
              데스크로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <p className={`${textStyles.body} max-w-3xl`}>
          검수·공개 완료 자료만 근거로 관리자 검토용 초안을 생성합니다. 보험금
          판단·의료 해석·상품 추천·고객 자동 발송·커뮤니티 자동 게시는 제공하지
          않습니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="생성 결과는 DB에 저장되지 않으며, 고객 발송·커뮤니티 자동 게시 버튼은 제공하지 않습니다."
            showNeedsReview
          />
        </div>

        <div
          className={`mt-8 ${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-6`}
        >
          <AnswerAssistantPanel />
        </div>
      </main>
    </div>
  );
}
