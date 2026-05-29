"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { borders, notices, sectionEyebrow, surfaces, textStyles } from "@/lib/design-system";
import { uiLabels } from "@/lib/ui-labels";

const text = {
  nextAction: "다음 실무 동작",
  draftTitle: "검수 및 초안 안내",
  draftBody:
    "일부 항목은 검수 전 초안 데이터를 사용할 수 있습니다. 공식 링크, 연락처, 팩스번호, 주소, 상품 참조, 문서 링크는 공개 전 검수되어야 합니다.",
  safetyTitle: uiLabels.safetyBoundary,
  safetySummary:
    "본 정보는 실무 참고용이며, 최종 기준은 보험사 공식 자료를 확인해야 합니다.",
  safetyA:
    "청구 관련 정보와 약관 관련 정보는 실무 참고용입니다. 최종 기준은 보험사, 협회, 약관, 공식 공시와 개별 심사 기준을 확인해야 합니다.",
  safetyB:
    "고객 안내 문구는 발송 전 고객 상황, 상품 기준, 보험사 기준, 관련 규정에 맞게 검토하고 수정해야 합니다.",
  noPayoutJudge: "플래너데스크는 보험금 지급 여부를 판단하지 않습니다.",
  noPayoutEstimate: "플래너데스크는 보험금 지급 금액을 산정하지 않습니다.",
  noAdjusting: "플래너데스크는 손해사정 업무를 수행하지 않습니다.",
  noMedicalDocs: "고객 의료서류를 수집·저장하지 않습니다.",
};

export type MvpLinkItem = {
  href: string;
  label: string;
  description: string;
};

export function MvpModuleLinks({
  description,
  items,
  title = text.nextAction,
}: {
  description?: string;
  items: MvpLinkItem[];
  title?: string;
}) {
  return (
    <section className={`${notices.box} ${borders.default}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={sectionEyebrow}>{uiLabels.workflowLinks}</p>
          <h2 className={`mt-2 break-keep ${textStyles.cardTitle}`}>{title}</h2>
        </div>
        {description ? (
          <p className={`max-w-xl break-keep ${textStyles.small}`}>{description}</p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            className={`group ${surfaces.card} p-4 transition hover:border-[#B9975B]`}
            href={item.href}
            key={item.href}
          >
            <span className="block break-keep text-base font-semibold text-[#0F1D2E] group-hover:text-[#16382C]">
              {item.label}
            </span>
            <span className={`mt-2 block break-keep ${textStyles.small}`}>
              {item.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function MvpDraftNotice({ children }: { children?: ReactNode }) {
  return (
    <aside className={notices.box}>
      <p className={notices.boxTitle}>{text.draftTitle}</p>
      <p className={notices.boxBody}>{children ?? text.draftBody}</p>
    </aside>
  );
}

export function MvpSafetyNotice() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={notices.safety}>
      <button
        className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <div>
          <p className={sectionEyebrow}>{text.safetyTitle}</p>
          <p className={`mt-2 break-keep ${textStyles.small}`}>{text.safetySummary}</p>
        </div>
        <span className="ml-4 shrink-0 text-xs font-bold text-[#B9975B]">
          {expanded ? "접기" : "펼치기"}
        </span>
      </button>

      {expanded ? (
        <div className="mt-4 border-t border-[#E3DED4] pt-4">
          <div className={`grid gap-3 md:grid-cols-2 ${textStyles.small}`}>
            <p>{text.safetyA}</p>
            <p>{text.safetyB}</p>
          </div>
          <ul className={`mt-4 grid gap-2 md:grid-cols-2 ${textStyles.small}`}>
            <li>• {text.noPayoutJudge}</li>
            <li>• {text.noPayoutEstimate}</li>
            <li>• {text.noAdjusting}</li>
            <li>• {text.noMedicalDocs}</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
