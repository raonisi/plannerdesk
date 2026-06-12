import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  DisclosureLinkTargetType,
  type Prisma,
} from "@prisma/client";
import { disclosureLinkEntries } from "@/lib/content/disclosure-links";
import {
  buildDisclosureRoomCopy,
  disclosureRoomDedupeKey,
  extractInsurerNameFromDisclosureTitle,
  extractInsurerSlugFromDisclosureId,
  hasMojibakeText,
  isInsurerDisclosureRoomCategory,
} from "@/lib/content/disclosure-room";
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

function resolveInsurerName(link: PublicDisclosureLink): string {
  if (link.insurerName?.trim()) return link.insurerName.trim();
  if (link.sourceName?.trim() && !hasMojibakeText(link.sourceName)) {
    return link.sourceName.trim();
  }
  return extractInsurerNameFromDisclosureTitle(link.title);
}

function normalizeDisclosureRoomLink(link: PublicDisclosureLink): PublicDisclosureLink {
  const insurerName = resolveInsurerName(link);
  const copy = buildDisclosureRoomCopy(insurerName);
  const slug =
    extractInsurerSlugFromDisclosureId(link.id) ??
    (link.insurerId ?? insurerName.replace(/\s+/g, "-").toLocaleLowerCase("ko-KR"));

  return {
    ...link,
    id: link.id.startsWith("disclosure-room-")
      ? link.id
      : `disclosure-room-${slug}`,
    title: hasMojibakeText(link.title) ? copy.title : link.title,
    description: hasMojibakeText(link.description)
      ? copy.description
      : link.description,
    sourceName: hasMojibakeText(link.sourceName ?? "")
      ? copy.sourceLabel
      : link.sourceName ?? copy.sourceLabel,
    category: DisclosureLinkCategory.product_disclosure,
    insurerName,
  };
}

export function unifyPublicDisclosureRoomLinks(
  links: PublicDisclosureLink[],
): PublicDisclosureLink[] {
  const roomMap = new Map<string, PublicDisclosureLink>();
  const passthrough: PublicDisclosureLink[] = [];

  for (const link of links) {
    if (!isInsurerDisclosureRoomCategory(link.category)) {
      passthrough.push(link);
      continue;
    }

    const normalized = normalizeDisclosureRoomLink(link);
    const insurerName = resolveInsurerName(normalized);
    const key = disclosureRoomDedupeKey(insurerName, normalized.url);

    const existing = roomMap.get(key);
    if (!existing) {
      roomMap.set(key, normalized);
      continue;
    }

    const existingDate = existing.lastVerifiedAt ?? "";
    const nextDate = normalized.lastVerifiedAt ?? "";
    if (nextDate.localeCompare(existingDate) > 0) {
      roomMap.set(key, normalized);
    }
  }

  return [
    ...passthrough,
    ...Array.from(roomMap.values()).sort((a, b) => {
      const sortDiff = a.sortOrder - b.sortOrder;
      if (sortDiff !== 0) return sortDiff;
      return a.title.localeCompare(b.title, "ko-KR");
    }),
  ];
}

function staticDisclosureToPublicLink(
  entry: (typeof disclosureLinkEntries)[number],
): PublicDisclosureLink {
  const insurerName = extractInsurerNameFromDisclosureTitle(entry.title);
  const copy = buildDisclosureRoomCopy(insurerName);
  const slug =
    extractInsurerSlugFromDisclosureId(entry.id) ??
    insurerName.replace(/\s+/g, "-").toLocaleLowerCase("ko-KR");

  return {
    id: entry.id,
    title: copy.title,
    description: copy.description,
    url: entry.sourceUrl ? sanitizePublicUrl(entry.sourceUrl) : null,
    category: DisclosureLinkCategory.product_disclosure,
    targetType: DisclosureLinkTargetType.insurer,
    sourceName: copy.sourceLabel,
    isOfficialSource: true,
    lastVerifiedAt: entry.lastVerifiedAt,
    publishedAt: entry.lastVerifiedAt,
    sortOrder: 100,
    insurerId: slug,
    insurerName,
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

    const unifiedDb = unifyPublicDisclosureRoomLinks(data);
    const seen = new Set(unifiedDb.map((entry) => entry.id));
    const fallback = getStaticDisclosureFallback().filter(
      (entry) => !seen.has(entry.id),
    );

    return {
      status: "ok",
      data: unifyPublicDisclosureRoomLinks([...unifiedDb, ...fallback]),
    };
  } catch {
    console.warn("[plannerdesk] getPublicDisclosureLinks failed.");
    return { status: "ok", data: getStaticDisclosureFallback() };
  }
}
