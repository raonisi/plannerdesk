import Link from "next/link";
import {
  SEARCH_EMPTY_WORK_LINK_NOTE,
  SEARCH_IDLE_EXAMPLES,
  SEARCH_IDLE_FRESHNESS_NOTICE,
  SEARCH_IDLE_HINT,
  SEARCH_IDLE_PII_NOTICE,
} from "@/lib/search/constants";
import { buildPublicSearchHref } from "@/lib/search/search-href";

const HUB_LINKS = [
  { label: "보험사", href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: "지식", href: "/knowledge" },
  { label: "공시·약관", href: "/disclosure-links" },
  { label: "고객문구", href: "/message-templates" },
  { label: "업무 링크", href: "/directory" },
] as const;

export function SearchIdlePanel() {
  return (
    <div className="rounded-md border border-[#d9c9a8] bg-[#fbf7ee] px-4 py-4 text-sm leading-6 text-[#4f5661]">
      <p className="font-semibold text-[#102235]">{SEARCH_IDLE_HINT}</p>
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">{SEARCH_IDLE_PII_NOTICE}</p>
      <p className="mt-1 text-xs leading-5 text-[#5f6670]">
        {SEARCH_IDLE_FRESHNESS_NOTICE}
      </p>
      <p className="mt-3 text-xs font-semibold text-[#102235]">검색 예시</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {SEARCH_IDLE_EXAMPLES.map((example) => (
          <li key={example}>
            <Link
              className="inline-flex min-h-8 items-center rounded-full border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:border-[#aa8137] hover:bg-[#f7f1e5]"
              href={buildPublicSearchHref(example, "all")}
            >
              {example}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-semibold text-[#102235]">영역별 허브</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {HUB_LINKS.map((hub) => (
          <li key={`${hub.label}-${hub.href}`}>
            <Link
              className="font-semibold text-[#102235] underline decoration-[#d9c9a8] underline-offset-2 hover:text-[#7a612d]"
              href={hub.href}
            >
              {hub.label} 허브
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_WORK_LINK_NOTE}
      </p>
    </div>
  );
}
