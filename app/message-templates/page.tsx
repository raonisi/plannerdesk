import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  CollapsibleNotice,
  ContentSection,
  EmptyState,
  PageHero,
} from "@/components/content-page";
import { getPublicMessageTemplates } from "@/lib/public/message-templates";
import { PUBLIC_EMPTY_CONTENT_UPDATING } from "@/lib/public/public-surface-terminology";
import { uiLabels } from "@/lib/ui-labels";
import { MessageTemplateLibrary } from "./message-template-library";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "고객 안내 문구 | PlannerDesk",
  description:
    "보험 상담, 후속 연락, 점검 안내에 활용할 수 있는 고객 안내 문구를 확인할 수 있는 실무 참고 페이지입니다.",
};

const t = {
  eyebrow: "고객 문구",
  title: "고객 문구 복사",
  description:
    "고객 안내 문구를 확인하고 복사할 수 있습니다. 보험금 지급·상품 권유 문구가 아닙니다.",
};

export default async function MessageTemplatesPage() {
  const result = await getPublicMessageTemplates();
  const templates = result.status === "ok" ? result.data : [];
  const dbError = result.status === "error";

  return (
    <AppShell>
      <PageHero description={t.description} eyebrow={t.eyebrow} title={t.title} />
      <ContentSection>
        <div className="space-y-8">
          {dbError ? (
            <EmptyState
              description="잠시 후 다시 확인해 주세요."
              title="고객 안내 문구를 불러오지 못했습니다."
            />
          ) : templates.length === 0 ? (
            <EmptyState
              description={PUBLIC_EMPTY_CONTENT_UPDATING}
              title="공개된 고객 안내 문구가 아직 없습니다."
            />
          ) : (
            <MessageTemplateLibrary templates={templates} />
          )}

          <CollapsibleNotice
            summary="제공 문구는 실무 참고용입니다. 발송 전 고객별 상황과 상품 약관을 반드시 확인해 주세요."
            title={uiLabels.safetyBoundary}
          >
            <ul className="space-y-2 break-keep">
              <li>표시·복사되는 문구는 고객 안내용 참고 문구이며, 보험금 지급 여부를 단정하지 않습니다.</li>
              <li>고객 의료서류 원본 업로드나 과도한 개인정보 요구는 하지 마세요.</li>
              <li>상품 가입 유도·공포 조장·특정 상품 추천처럼 보이는 표현은 피해 주세요.</li>
              <li>카카오톡 등 메신저에 붙여넣기 전 최종 문구를 한 번 더 검토해 주세요.</li>
            </ul>
          </CollapsibleNotice>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 rounded-xl border border-[#E3DED4] bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-900">
                청구서류 확인이 필요하신가요?
              </p>
              <Link
                href="/claim-documents"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-4 py-2 text-sm font-bold text-[#0F1D2E] transition hover:bg-slate-50"
              >
                청구서류 기준 확인하기
              </Link>
            </div>
            <div className="flex-1 rounded-xl border border-[#E3DED4] bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-900">
                약관·공시 확인이 필요하신가요?
              </p>
              <Link
                href="/disclosure-links"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-4 py-2 text-sm font-bold text-[#0F1D2E] transition hover:bg-slate-50"
              >
                공시·약관 바로가기
              </Link>
            </div>
          </div>
        </div>
      </ContentSection>
    </AppShell>
  );
}
