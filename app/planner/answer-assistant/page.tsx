import Link from "next/link";
import { AnswerAssistantPanelShell } from "@/components/answer-assistant/answer-assistant-panel";
import { AccessRestrictedPanel } from "@/components/content/access-restricted-panel";
import {
  VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES,
  VERIFIED_ANSWER_ASSIST_PAGE_NOTICES,
} from "@/lib/answer-assistant/constants";
import {
  VERIFIED_BETA_NOT_CONFIGURED_MESSAGE,
  VERIFIED_PREVIEW_DISABLED_MESSAGE,
} from "@/lib/answer-assistant/feature-gate";
import { getVerifiedAnswerAssistantAccess } from "@/lib/answer-assistant/verified-access";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import { generateVerifiedAnswerAssistantDraftAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 초안 | PlannerDesk",
  description:
    "검증 설계사 업무 참고용 답변 초안 보조 도구입니다. 고객 자동 발송·커뮤니티 자동 게시는 제공하지 않습니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PlannerAnswerAssistantPage() {
  const access = await getVerifiedAnswerAssistantAccess();

  if (access.status === "locked") {
    return (
      <AccessRestrictedPanel
        description="로그인 후 이용할 수 있는 기능입니다. 공개 페이지는 로그인 없이 이용할 수 있습니다."
        title="로그인이 필요합니다"
      />
    );
  }

  if (access.status === "denied") {
    return (
      <AccessRestrictedPanel
        description={access.denyReason}
      />
    );
  }

  const generationEnabled =
    access.status === "authenticated" && access.canGenerate;
  const showBetaFeedback =
    generationEnabled &&
    access.status === "authenticated" &&
    !access.isAdminTester;
  const generationDisabledMessage =
    access.status === "feature_disabled"
      ? VERIFIED_PREVIEW_DISABLED_MESSAGE
      : access.status === "beta_not_configured"
        ? VERIFIED_BETA_NOT_CONFIGURED_MESSAGE
        : access.status === "not_allowlisted"
          ? VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.NOT_ALLOWLISTED
          : undefined;
  const betaActiveNotice =
    access.status === "authenticated" && access.canGenerate
      ? `${VERIFIED_ANSWER_ASSIST_PAGE_NOTICES.allowlistBetaActive} ${VERIFIED_ANSWER_ASSIST_PAGE_NOTICES.allowlistBetaPilot}`
      : undefined;
  const adminTesterNotice =
    access.status === "authenticated" && access.isAdminTester
      ? "관리자 테스트 모드입니다. allowlist beta UI를 확인 중이며, Safety Gate·Retrieval·Output Safety·rate limit·usage audit 정책은 동일하게 적용됩니다."
      : undefined;

  return (
    <div className={`min-h-[100dvh] ${surfaces.page}`}>
      <header
        className={`${surfaces.hero} border-b ${borders.divider} px-6 py-4 sm:px-8`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#d8c08f]">
              PlannerDesk · 검증 설계사
            </p>
            <h1 className="text-xl font-bold text-white">답변 보조 · 업무 참고 초안</h1>
          </div>
          <Link
            className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
            href="/community"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <p className={`${textStyles.body} max-w-3xl`}>
          검수·공개 완료 자료만 근거로 업무 참고용 초안을 생성합니다. 보험금
          판단·의료 해석·상품 추천·고객 자동 발송·커뮤니티 자동 게시는 제공하지
          않습니다.
        </p>

        <div
          className={`mt-8 ${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-6`}
        >
          <AnswerAssistantPanelShell
            adminTesterNotice={adminTesterNotice}
            betaActiveNotice={betaActiveNotice}
            showBetaFeedback={showBetaFeedback}
            generationDisabledMessage={generationDisabledMessage}
            generationEnabled={generationEnabled}
            submitAction={generateVerifiedAnswerAssistantDraftAction}
            variant="verified"
          />
        </div>
      </main>
    </div>
  );
}
