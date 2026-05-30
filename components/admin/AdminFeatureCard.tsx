import Link from "next/link";
import type { AdminFeatureAvailability } from "@/lib/admin/dashboard-status";
import { borders, surfaces } from "@/lib/design-system";

const badgeStyles: Record<AdminFeatureAvailability, string> = {
  active: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  active_with_warning: "border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]",
  setup_required: "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]",
  coming_soon: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
  blocked: "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]",
};

const cardBorderStyles: Record<AdminFeatureAvailability, string> = {
  active: "border-solid shadow-sm",
  active_with_warning: "border-solid shadow-sm",
  setup_required: "border-dashed",
  coming_soon: "border-dashed opacity-95",
  blocked: "border-dashed",
};

function buttonClass(enabled: boolean, availability: AdminFeatureAvailability) {
  if (!enabled) {
    return "mt-6 w-full cursor-not-allowed rounded border border-[#d6d8dc] bg-[#f4f5f6] px-4 py-2.5 text-center text-xs font-semibold text-[#8a909a]";
  }
  if (availability === "active") {
    return "mt-6 block w-full rounded border border-[#10243E] bg-[#10243E] px-4 py-2.5 text-center text-xs font-semibold text-[#F7F3E8] transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]";
  }
  if (availability === "blocked") {
    return "mt-6 block w-full rounded border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-2.5 text-center text-xs font-semibold text-[#8b2e2e] hover:bg-[#fae4e4]";
  }
  return "mt-6 block w-full rounded border border-[#d9c9a8] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#102235] transition hover:bg-[#f7f1e5] focus:outline-none focus:ring-2 focus:ring-[#B8924A]/40";
}

export default function AdminFeatureCard({
  title,
  description,
  href,
  availability,
  statusBadge,
  lastCheckLabel,
  nextAction,
  buttonLabel,
  buttonEnabled,
}: {
  title: string;
  description: string;
  href: string;
  availability: AdminFeatureAvailability;
  statusBadge: string;
  lastCheckLabel: string;
  nextAction: string;
  buttonLabel: string;
  buttonEnabled: boolean;
}) {
  const btnClass = buttonClass(buttonEnabled, availability);

  return (
    <article
      className={`relative flex flex-col rounded-lg p-6 ${surfaces.card} ${borders.default} ${cardBorderStyles[availability]}`}
    >
      <span
        className={`absolute right-6 top-6 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[availability]}`}
      >
        {statusBadge}
      </span>

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7f1e5] text-[#aa8137]">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <h3 className="pr-24 text-lg font-bold text-[#102235]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4f5661]">
        {description}
      </p>

      <dl className="mt-4 space-y-2 border-t border-[#e7ddc9] pt-4 text-xs">
        <div>
          <dt className="font-semibold text-[#4f5661]">마지막 점검</dt>
          <dd className="mt-0.5 text-[#102235]">{lastCheckLabel}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#4f5661]">다음 조치</dt>
          <dd className="mt-0.5 leading-relaxed text-[#4f5661]">{nextAction}</dd>
        </div>
      </dl>

      {buttonEnabled ? (
        <Link href={href} className={btnClass}>
          {buttonLabel}
        </Link>
      ) : (
        <button type="button" disabled className={btnClass} title={nextAction}>
          {buttonLabel}
        </button>
      )}
    </article>
  );
}

export function AdminWorkflowCard({
  title,
  description,
  href,
  availability,
  statusBadge,
  nextAction,
  buttonLabel,
  buttonEnabled,
}: {
  title: string;
  description: string;
  href: string | null;
  availability: AdminFeatureAvailability;
  statusBadge: string;
  nextAction: string;
  buttonLabel: string;
  buttonEnabled: boolean;
}) {
  const btnClass = buttonClass(buttonEnabled, availability);

  return (
    <article
      className={`rounded-lg p-5 ${surfaces.card} ${borders.default} ${cardBorderStyles[availability]}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-[#102235]">{title}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeStyles[availability]}`}
        >
          {statusBadge}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#4f5661]">{description}</p>
      <p className="mt-2 text-xs text-[#7b5b19]">{nextAction}</p>
      {buttonEnabled && href ? (
        <Link href={href} className={`${btnClass} mt-4`}>
          {buttonLabel}
        </Link>
      ) : (
        <button type="button" disabled className={`${btnClass} mt-4`} title={nextAction}>
          {buttonLabel}
        </button>
      )}
    </article>
  );
}
