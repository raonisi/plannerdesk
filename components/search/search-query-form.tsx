"use client";

import { useLayoutEffect, useRef } from "react";
import {
  SEARCH_FORM_FRESHNESS_NOTICE,
  SEARCH_FORM_PLACEHOLDER,
  SEARCH_IDLE_PII_NOTICE,
} from "@/lib/search/constants";
import { domainToQueryParam } from "@/lib/search/query-validation";
import type { PublicSearchDomain } from "@/lib/search/types";

export function SearchQueryForm({
  domain,
  focusOnMount,
  query,
}: {
  domain: PublicSearchDomain;
  focusOnMount: boolean;
  query: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const didFocusRef = useRef(false);

  useLayoutEffect(() => {
    if (!focusOnMount || didFocusRef.current) return;

    didFocusRef.current = true;
    inputRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <form
      action="/search"
      className="min-w-0 rounded-xl border border-[#d9c9a8] bg-white p-4 shadow-sm"
      method="get"
      role="search"
    >
      <label
        className="block text-sm font-semibold text-[#102235]"
        htmlFor="public-search-query"
      >
        검색어
      </label>
      <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row">
        <input
          aria-label="검색어"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-[#d9c9a8] px-3 text-sm text-[#102235] outline-none focus-visible:border-[#aa8137] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2"
          defaultValue={query}
          id="public-search-query"
          maxLength={60}
          name="q"
          placeholder={SEARCH_FORM_PLACEHOLDER}
          ref={inputRef}
          type="search"
        />
        <input
          name="domain"
          type="hidden"
          value={domainToQueryParam(domain)}
        />
        <button
          className="min-h-11 rounded-md bg-[#102235] px-5 text-sm font-semibold text-white hover:bg-[#1b344e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2"
          type="submit"
        >
          검색
        </button>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">
        {SEARCH_IDLE_PII_NOTICE} {SEARCH_FORM_FRESHNESS_NOTICE}{" "}
        보험금 지급·청구 가능 여부 판단 검색은 제공하지 않습니다.
      </p>
    </form>
  );
}
