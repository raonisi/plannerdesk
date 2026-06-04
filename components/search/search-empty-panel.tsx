import {
  SEARCH_EMPTY_MESSAGE,
  SEARCH_EMPTY_VISIBILITY_NOTE,
} from "@/lib/search/constants";
import { BrowseNextSteps } from "./browse-next-steps";

export function SearchEmptyPanel({ domainFilterLabel }: { domainFilterLabel?: string }) {
  return (
    <div
      className="rounded-md border border-[#d9c9a8] bg-white px-4 py-4 text-sm leading-6 text-[#4f5661]"
      role="status"
    >
      <p className="font-semibold text-[#102235]">{SEARCH_EMPTY_MESSAGE}</p>
      {domainFilterLabel ? (
        <p className="mt-2">
          현재 <span className="font-semibold text-[#102235]">{domainFilterLabel}</span>{" "}
          영역만 보고 있습니다. 필터를 &quot;전체&quot;로 바꾸거나 검색어를 조정해 보세요.
        </p>
      ) : null}
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_VISIBILITY_NOTE}
      </p>
      <BrowseNextSteps />
    </div>
  );
}
