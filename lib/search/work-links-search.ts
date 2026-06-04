// Public work-link search hits from published insurers only (PR-132). No visibility rule changes.

import { PUBLIC_VERIFICATION_STATUSES } from "@/lib/public/insurers";
import {
  WORK_LINK_ACTION_LABELS,
  WORK_LINK_COPY,
  WORK_LINK_GROUP_LABELS,
  plannerSystemAccessNote,
} from "@/lib/directory/work-links";
import { prisma } from "@/lib/prisma";
import type { GlobalSearchResult } from "./types";

type WorkLinkKind =
  | "system"
  | "planner_portal"
  | "homepage"
  | "claim_guide"
  | "claim_form"
  | "terms"
  | "helpdesk"
  | "customer_center";

const LINK_TYPE_KEYWORDS: Record<WorkLinkKind, readonly string[]> = {
  system: ["전산", "시스템", "포털"],
  planner_portal: ["설계사", "포털", "전산"],
  homepage: ["홈페이지", "공식"],
  claim_guide: ["청구", "청구안내", "안내"],
  claim_form: ["청구양식", "양식"],
  terms: ["약관"],
  helpdesk: ["헬프", "헬프데스크", "지원"],
  customer_center: ["고객센터", "고객", "전화"],
};

const LINK_GROUP: Record<WorkLinkKind, keyof typeof WORK_LINK_GROUP_LABELS> = {
  system: "system",
  planner_portal: "system",
  homepage: "official",
  claim_guide: "claim",
  claim_form: "claim",
  terms: "official",
  helpdesk: "support",
  customer_center: "support",
};

function normalizeForMatch(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function queryMatchesLinkType(query: string, kind: WorkLinkKind): boolean {
  const q = normalizeForMatch(query);
  return LINK_TYPE_KEYWORDS[kind].some((keyword) =>
    normalizeForMatch(keyword).includes(q) || q.includes(normalizeForMatch(keyword)),
  );
}

function queryMatchesText(query: string, ...parts: (string | null | undefined)[]): boolean {
  const q = normalizeForMatch(query);
  return parts.some((part) => part && normalizeForMatch(part).includes(q));
}

type InsurerLinkRow = {
  id: string;
  name: string;
  verificationStatus: string;
  officialWebsiteUrl: string | null;
  plannerPortalUrl: string | null;
  systemUrl: string | null;
  customerCenterPhone: string | null;
  helpdeskPhone: string | null;
  claimPageUrl: string | null;
  claimFormUrl: string | null;
  termsUrl: string | null;
  updatedAt: Date;
  lastVerifiedAt: Date | null;
};

function buildWorkLinkResult(
  row: InsurerLinkRow,
  kind: WorkLinkKind,
  label: string,
  href: string | null,
  summaryExtra?: string | null,
): GlobalSearchResult | null {
  if (!href?.trim()) return null;

  const accessNote = plannerSystemAccessNote(href);
  const summaryParts = [
    WORK_LINK_GROUP_LABELS[LINK_GROUP[kind]],
    summaryExtra,
    accessNote,
    row.verificationStatus === "needs_review"
      ? WORK_LINK_COPY.needsReviewNote
      : null,
  ].filter(Boolean);

  return {
    id: `${row.id}:${kind}`,
    type: "work_link",
    title: `${row.name} · ${label}`,
    summary: summaryParts.join(" · "),
    url: `/directory?search=${encodeURIComponent(row.name)}`,
    externalHref: href.startsWith("tel:") ? href : href,
    linkTypeLabel: label,
    categoryLabel: WORK_LINK_GROUP_LABELS[LINK_GROUP[kind]],
    sourceLabel: row.name,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
    publishedAt: row.lastVerifiedAt?.toISOString().slice(0, 10),
  };
}

function linksForInsurer(
  row: InsurerLinkRow,
  query: string,
): GlobalSearchResult[] {
  const nameMatch = queryMatchesText(query, row.name);
  const systemPrimary = row.systemUrl ?? row.plannerPortalUrl;
  const systemSecondary =
    row.systemUrl &&
    row.plannerPortalUrl &&
    row.plannerPortalUrl !== row.systemUrl
      ? row.plannerPortalUrl
      : null;
  const systemPrimaryLabel = row.systemUrl
    ? WORK_LINK_ACTION_LABELS.system
    : WORK_LINK_ACTION_LABELS.plannerPortal;

  const candidates: Array<GlobalSearchResult | null> = [];

  const maybePush = (
    kind: WorkLinkKind,
    label: string,
    href: string | null,
    extra?: string | null,
  ) => {
    if (!nameMatch && !queryMatchesLinkType(query, kind) && !queryMatchesText(query, label, href ?? "")) {
      return;
    }
    candidates.push(buildWorkLinkResult(row, kind, label, href, extra));
  };

  maybePush("system", systemPrimaryLabel, systemPrimary);
  if (systemSecondary) {
    maybePush("planner_portal", WORK_LINK_ACTION_LABELS.plannerPortal, systemSecondary);
  }
  maybePush("homepage", WORK_LINK_ACTION_LABELS.homepage, row.officialWebsiteUrl);
  maybePush("claim_guide", WORK_LINK_ACTION_LABELS.claimGuide, row.claimPageUrl);
  maybePush("claim_form", WORK_LINK_ACTION_LABELS.claimForm, row.claimFormUrl);
  maybePush("terms", WORK_LINK_ACTION_LABELS.terms, row.termsUrl);
  if (row.helpdeskPhone) {
    maybePush(
      "helpdesk",
      WORK_LINK_ACTION_LABELS.helpdesk,
      `tel:${row.helpdeskPhone.replace(/\s/g, "")}`,
      row.helpdeskPhone,
    );
  }
  if (row.customerCenterPhone) {
    maybePush(
      "customer_center",
      WORK_LINK_ACTION_LABELS.customerCenter,
      `tel:${row.customerCenterPhone.replace(/\s/g, "")}`,
      row.customerCenterPhone,
    );
  }

  return candidates.filter((item): item is GlobalSearchResult => item !== null);
}

/**
 * Work-link rows derived only from published insurers (same rule as directory).
 */
export async function searchWorkLinks(
  query: string,
  limit: number,
): Promise<GlobalSearchResult[]> {
  const records = await prisma.insurer.findMany({
    where: {
      isPublished: true,
      verificationStatus: { in: [...PUBLIC_VERIFICATION_STATUSES] },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { officialWebsiteUrl: { contains: query, mode: "insensitive" } },
        { systemUrl: { contains: query, mode: "insensitive" } },
        { plannerPortalUrl: { contains: query, mode: "insensitive" } },
        { claimPageUrl: { contains: query, mode: "insensitive" } },
      ],
    },
    take: Math.min(40, limit * 4),
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      officialWebsiteUrl: true,
      plannerPortalUrl: true,
      systemUrl: true,
      customerCenterPhone: true,
      helpdeskPhone: true,
      claimPageUrl: true,
      claimFormUrl: true,
      termsUrl: true,
      updatedAt: true,
      lastVerifiedAt: true,
    },
  });

  const qNorm = normalizeForMatch(query);
  const keywordOnly =
    !records.some((r) => normalizeForMatch(r.name).includes(qNorm)) &&
    Object.keys(LINK_TYPE_KEYWORDS).some((kind) =>
      queryMatchesLinkType(query, kind as WorkLinkKind),
    );

  let pool = records;
  if (keywordOnly && records.length === 0) {
    pool = await prisma.insurer.findMany({
      where: {
        isPublished: true,
        verificationStatus: { in: [...PUBLIC_VERIFICATION_STATUSES] },
      },
      take: 30,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        verificationStatus: true,
        officialWebsiteUrl: true,
        plannerPortalUrl: true,
        systemUrl: true,
        customerCenterPhone: true,
        helpdeskPhone: true,
        claimPageUrl: true,
        claimFormUrl: true,
        termsUrl: true,
        updatedAt: true,
        lastVerifiedAt: true,
      },
    });
  }

  const results: GlobalSearchResult[] = [];
  for (const row of pool) {
    for (const hit of linksForInsurer(row, query)) {
      results.push(hit);
      if (results.length >= limit) return results;
    }
  }

  return results;
}
