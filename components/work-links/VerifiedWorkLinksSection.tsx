import type {
  PlannerVerifiedWorkLinkView,
  PublicVerifiedWorkLinkView,
} from "@/lib/work-links/review-types";
import {
  VERIFIED_WORK_LINK_PLANNER_SECTION_TITLE,
  VERIFIED_WORK_LINK_PUBLIC_NOTICE,
  VERIFIED_WORK_LINK_PUBLIC_SECTION_TITLE,
} from "@/lib/work-links/verified-copy";
import { VerifiedWorkLinkCard } from "./VerifiedWorkLinkCard";
import { textStyles } from "@/lib/design-system";

type VerifiedWorkLinksSectionProps = {
  mode: "public" | "planner";
  links: PublicVerifiedWorkLinkView[] | PlannerVerifiedWorkLinkView[];
  compact?: boolean;
};

export function VerifiedWorkLinksSection({
  mode,
  links,
  compact = false,
}: VerifiedWorkLinksSectionProps) {
  if (links.length === 0) return null;

  const title =
    mode === "planner"
      ? VERIFIED_WORK_LINK_PLANNER_SECTION_TITLE
      : VERIFIED_WORK_LINK_PUBLIC_SECTION_TITLE;

  return (
    <section
      className={compact ? "mt-6" : "mt-8"}
      aria-labelledby={`verified-work-links-${mode}`}
    >
      <h2
        id={`verified-work-links-${mode}`}
        className="text-base font-bold text-[#102235]"
      >
        {title}
      </h2>
      {mode === "public" ? (
        <p className={`mt-2 max-w-2xl break-keep ${textStyles.small}`}>
          {VERIFIED_WORK_LINK_PUBLIC_NOTICE}
        </p>
      ) : null}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.id}>
            <VerifiedWorkLinkCard link={link} mode={mode} />
          </li>
        ))}
      </ul>
    </section>
  );
}
