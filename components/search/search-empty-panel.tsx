import Link from "next/link";
import {
  SEARCH_EMPTY_CORRECTION_HINT,
  SEARCH_EMPTY_FILTER_HINT,
  SEARCH_EMPTY_MESSAGE,
  SEARCH_EMPTY_PII_NOTICE,
  SEARCH_EMPTY_TIPS,
  SEARCH_EMPTY_VISIBILITY_NOTE,
  SEARCH_EMPTY_WORK_LINK_NOTE,
} from "@/lib/search/constants";
import { BrowseNextSteps } from "./browse-next-steps";

export function SearchEmptyPanel({
  domainFilterLabel,
  showWorkLinkNote = false,
}: {
  domainFilterLabel?: string;
  showWorkLinkNote?: boolean;
}) {
  return (
    <div
      className="rounded-md border border-[#d9c9a8] bg-white px-4 py-4 text-sm leading-6 text-[#4f5661]"
      role="status"
    >
      <p className="font-semibold text-[#102235]">{SEARCH_EMPTY_MESSAGE}</p>
      {domainFilterLabel ? (
        <p className="mt-2">
          현재{" "}
          <span className="font-semibold text-[#102235]">{domainFilterLabel}</span>{" "}
          영역만 보고 있습니다. 필터를 &quot;전체&quot;로 바꾸거나 검색어를 조정해 보세요.
        </p>
      ) : null}
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">{SEARCH_EMPTY_PII_NOTICE}</p>
      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_FILTER_HINT}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_VISIBILITY_NOTE}
      </p>
      {showWorkLinkNote ? (
        <p className="mt-2 text-xs leading-5 text-[#5f6670]">
          {SEARCH_EMPTY_WORK_LINK_NOTE}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_CORRECTION_HINT}{" "}
        <Link
          className="font-semibold text-[#102235] underline decoration-[#d9c9a8] underline-offset-2 hover:text-[#7a612d]"
          href="/directory"
        >
          보험사 디렉터리
        </Link>
        또는 각 허브 화면의 정보 수정 요청을 이용해 주세요.
      </p>
      <BrowseNextSteps />
    </div>
  );
}
