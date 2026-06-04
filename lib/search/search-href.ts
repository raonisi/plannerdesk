import type { PublicSearchDomain } from "./types";
import { domainToQueryParam } from "./query-validation";

export function buildPublicSearchHref(
  q: string,
  domain: PublicSearchDomain = "all",
): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (domain !== "all") params.set("domain", domainToQueryParam(domain));
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}
