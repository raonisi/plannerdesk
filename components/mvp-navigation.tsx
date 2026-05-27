import Link from "next/link";
import type { ReactNode } from "react";

const text = {
  nextAction: "다음 실무 동작",
  draftTitle: "검수 및 초안 안내",
  draftBody:
    "이 MVP는 필요한 경우 초안 placeholder 데이터를 사용합니다. 공식 링크, 연락처, 팩스번호, 주소, 상품 참조, 문서 링크는 공개 전 검수되어야 합니다.",
  safetyTitle: "MVP 업무 범위 안내",
  safetyA:
    "청구 관련 정보와 약관 관련 정보는 실무 참고용입니다. 최종 기준은 보험사, 협회, 약관, 공식 공시와 개별 심사 기준을 확인해야 합니다.",
  safetyB:
    "고객 안내 문구는 발송 전 고객 상황, 상품 기준, 보험사 기준, 관련 규정에 맞게 검토하고 수정해야 합니다.",
  noPayoutJudge:
    "플래너데스크는 보험금 지급 여부를 판단하지 않습니다.",
  noPayoutEstimate:
    "플래너데스크는 보험금 지급 금액을 산정하지 않습니다.",
  noAdjusting:
    "플래너데스크는 손해사정 업무를 수행하지 않습니다.",
  noMedicalDocs:
    "현재 MVP에서는 고객 의료서류를 처리하지 않습니다."
};

export type MvpLinkItem = {
  href: string;
  label: string;
  description: string;
};

export function MvpModuleLinks({
  description,
  items,
  title = text.nextAction
}: {
  description?: string;
  items: MvpLinkItem[];
  title?: string;
}) {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
            Workflow links
          </p>
          <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="max-w-xl break-keep text-sm leading-6 text-[#4f5661]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            className="group border border-[#e3d5b8] bg-white p-4 transition hover:border-[#aa8137]"
            href={item.href}
            key={item.href}
          >
            <span className="block break-keep text-base font-semibold text-[#102235] group-hover:text-[#7a612d]">
              {item.label}
            </span>
            <span className="mt-2 block break-keep text-sm leading-6 text-[#4f5661]">
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
    <aside className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <p className="text-sm font-semibold text-[#102235]">{text.draftTitle}</p>
      <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
        {children ?? text.draftBody}
      </p>
    </aside>
  );
}

export function MvpSafetyNotice() {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
        Safety boundary
      </p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
        {text.safetyTitle}
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <p>{text.safetyA}</p>
        <p>{text.safetyB}</p>
      </div>
      <ul className="mt-5 grid gap-2 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <li>{text.noPayoutJudge}</li>
        <li>{text.noPayoutEstimate}</li>
        <li>{text.noAdjusting}</li>
        <li>{text.noMedicalDocs}</li>
      </ul>
    </section>
  );
}
