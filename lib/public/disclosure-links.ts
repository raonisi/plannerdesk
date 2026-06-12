import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  DisclosureLinkTargetType,
  type Prisma,
} from "@prisma/client";
import { disclosureLinkEntries } from "@/lib/content/disclosure-links";
import { prisma } from "@/lib/prisma";
import { isValidAdminUrl } from "@/lib/validators/disclosure-link";

/**
 * Canonical public visibility for DisclosureLink (PR-75).
 *
 * Visible only when ALL are true:
 * - isPublished === true
 * - status === published (admin "검수 완료")
 * - reviewedAt is set (operator completed review)
 *
 * draft, needs_review, archived, unpublished, and unreviewed published rows
 * must never appear on /disclosure-links.
 */
export const PUBLIC_DISCLOSURE_LINK_STATUS = DisclosureLinkStatus.published;

export const PUBLIC_DISCLOSURE_LINK_WHERE = {
  isPublished: true,
  status: PUBLIC_DISCLOSURE_LINK_STATUS,
  reviewedAt: { not: null },
} as const satisfies Prisma.DisclosureLinkWhereInput;

export interface DisclosureLinkVisibilityFlags {
  isPublished: boolean;
  status: DisclosureLinkStatus;
  reviewedAt: Date | null;
}

export function isDisclosureLinkPubliclyVisible(
  flags: DisclosureLinkVisibilityFlags,
): boolean {
  return (
    flags.isPublished &&
    flags.status === PUBLIC_DISCLOSURE_LINK_STATUS &&
    flags.reviewedAt !== null
  );
}

/** Public-safe projection. Internal fields (adminMemo, reviewedById, etc.) are excluded. */
export interface PublicDisclosureLink {
  id: string;
  title: string;
  description: string;
  url: string | null;
  category: DisclosureLinkCategory;
  targetType: DisclosureLinkTargetType;
  sourceName: string | null;
  isOfficialSource: boolean;
  lastVerifiedAt: string | null;
  publishedAt: string | null;
  sortOrder: number;
  insurerId: string | null;
  insurerName: string | null;
}

export type PublicDisclosureLinksResult =
  | { status: "ok"; data: PublicDisclosureLink[] }
  | { status: "error" };

const publicDisclosureSelect = {
  id: true,
  title: true,
  description: true,
  url: true,
  category: true,
  targetType: true,
  sourceName: true,
  isOfficialSource: true,
  lastVerifiedAt: true,
  publishedAt: true,
  sortOrder: true,
  insurerId: true,
  insurer: {
    select: {
      name: true,
    },
  },
} as const;

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function sanitizePublicUrl(url: string): string | null {
  return isValidAdminUrl(url) ? url.trim() : null;
}

function staticDisclosureToPublicLink(
  entry: (typeof disclosureLinkEntries)[number],
): PublicDisclosureLink {
  const insurerName = entry.title
    .replace(/\s*(상품공시실|약관 조회)$/, "")
    .trim();

  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    url: entry.sourceUrl ? sanitizePublicUrl(entry.sourceUrl) : null,
    category: entry.category as DisclosureLinkCategory,
    targetType: DisclosureLinkTargetType.insurer,
    sourceName: insurerName || "보험사 공식 채널",
    isOfficialSource: true,
    lastVerifiedAt: entry.lastVerifiedAt,
    publishedAt: entry.lastVerifiedAt,
    sortOrder: 100,
    insurerId: entry.id.replace(/^disclosure-(product|terms)-/, "").trim(),
    insurerName: insurerName || null,
  };
}

function getStaticDisclosureFallback(): PublicDisclosureLink[] {
  return disclosureLinkEntries
    .filter(
      (entry) =>
        entry.verificationStatus === "verified" ||
        entry.verificationStatus === "needs_review",
    )
    .map(staticDisclosureToPublicLink);
}

export async function getPublicDisclosureLinks(): Promise<PublicDisclosureLinksResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "ok", data: getStaticDisclosureFallback() };
  }

  try {
    const records = await prisma.disclosureLink.findMany({
      where: PUBLIC_DISCLOSURE_LINK_WHERE,
      orderBy: [
        { sortOrder: "asc" },
        { isOfficialSource: "desc" },
        { lastVerifiedAt: "desc" },
        { updatedAt: "desc" },
      ],
      select: publicDisclosureSelect,
    });

    const data: PublicDisclosureLink[] = records.map((record) => {
      const { insurer, url, ...rest } = record;
      return {
        ...rest,
        url: sanitizePublicUrl(url),
        insurerName: insurer?.name ?? null,
        lastVerifiedAt: toIsoDate(record.lastVerifiedAt),
        publishedAt: toIsoDate(record.publishedAt),
      };
    });

    const seen = new Set(data.map((entry) => entry.id));
    const fallback = getStaticDisclosureFallback().filter(
      (entry) => !seen.has(entry.id),
    );

    return { status: "ok", data: [...data, ...fallback] };
  } catch {
    console.warn("[plannerdesk] getPublicDisclosureLinks failed.");
    return { status: "ok", data: getStaticDisclosureFallback() };
  }
}
