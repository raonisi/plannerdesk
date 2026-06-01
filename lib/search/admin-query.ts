// Admin search URL/query parsing (PR-85).

import type {
  AdminSearchDomain,
  AdminSearchInternalFilter,
  AdminSearchPublishedFilter,
  AdminSearchQueryInput,
  AdminSearchSensitiveFilter,
  AdminSearchStatusFilter,
} from "./types";
import { domainToQueryParam, parsePublicSearchDomain } from "./query-validation";

const ADMIN_DOMAIN_EXTRA: Record<string, AdminSearchDomain> = {
  correctionrequest: "correction_request",
  correction_request: "correction_request",
};

export function parseAdminSearchDomain(
  value: string | undefined | null,
): AdminSearchDomain {
  if (!value?.trim()) return "all";
  const key = value.trim().toLowerCase().replace(/-/g, "_");
  if (key in ADMIN_DOMAIN_EXTRA) {
    return ADMIN_DOMAIN_EXTRA[key];
  }
  return parsePublicSearchDomain(value) as AdminSearchDomain;
}

export function adminDomainToQueryParam(domain: AdminSearchDomain): string {
  if (domain === "correction_request") return "correctionRequest";
  return domainToQueryParam(domain as Exclude<AdminSearchDomain, "correction_request">);
}

const STATUS_SET = new Set<string>([
  "all",
  "draft",
  "review",
  "published",
  "archived",
  "new",
  "needsRedaction",
]);

const PUBLISHED_SET = new Set<string>(["all", "published", "unpublished"]);
const INTERNAL_SET = new Set<string>(["all", "internal", "external"]);
const SENSITIVE_SET = new Set<string>(["all", "flagged"]);

export function parseAdminSearchParams(
  params: Record<string, string | string[] | undefined>,
): AdminSearchQueryInput {
  const raw = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };

  const status = raw("status");
  const published = raw("published");
  const internal = raw("internal");
  const sensitive = raw("sensitive");

  return {
    q: raw("q").trim(),
    domain: parseAdminSearchDomain(raw("domain")),
    status: STATUS_SET.has(status)
      ? (status as AdminSearchStatusFilter)
      : "all",
    published: PUBLISHED_SET.has(published)
      ? (published as AdminSearchPublishedFilter)
      : "all",
    internal: INTERNAL_SET.has(internal)
      ? (internal as AdminSearchInternalFilter)
      : "all",
    sensitive: SENSITIVE_SET.has(sensitive)
      ? (sensitive as AdminSearchSensitiveFilter)
      : "all",
  };
}

export function buildAdminSearchQuery(input: AdminSearchQueryInput): string {
  const parts = new URLSearchParams();
  if (input.q) parts.set("q", input.q);
  if (input.domain && input.domain !== "all") {
    parts.set("domain", adminDomainToQueryParam(input.domain));
  }
  if (input.status && input.status !== "all") {
    parts.set("status", input.status);
  }
  if (input.published && input.published !== "all") {
    parts.set("published", input.published);
  }
  if (input.internal && input.internal !== "all") {
    parts.set("internal", input.internal);
  }
  if (input.sensitive && input.sensitive !== "all") {
    parts.set("sensitive", input.sensitive);
  }
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

export function buildAdminSearchHref(input: AdminSearchQueryInput): string {
  return `/admin/search${buildAdminSearchQuery(input)}`;
}
