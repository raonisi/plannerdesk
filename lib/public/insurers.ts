import {
  VerificationStatus,
  type CardPaymentStatus,
  type ClaimFaxHandlingType,
  type InsurerCategory,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import { isPublishedContentPubliclyVisible } from "@/lib/public/visibility";

// Public-safe projection of the Insurer model. Internal governance fields like
// `notes`, `sourceNote`, `createdById`, `updatedById`, and any unpublished
// records must not flow through this type. Keep this list in sync with the
// allow list in `getPublicInsurers` below.
export type SupportedBrowser = "chrome" | "edge";

export interface PublicInsurer {
  id: string;
  name: string;
  category: InsurerCategory;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  officialWebsiteUrl: string | null;
  plannerPortalUrl: string | null;
  systemUrl: string | null;
  customerCenterPhone: string | null;
  helpdeskPhone: string | null;
  callMonitoringPhone: string | null;
  claimPageUrl: string | null;
  claimFaxNumber: string | null;
  claimFaxHandlingType: ClaimFaxHandlingType;
  faxNumber: string | null;
  mailingAddress: string | null;
  registeredMailAddress: string | null;
  claimFormUrl: string | null;
  termsUrl: string | null;
  cardPaymentInitialAvailable: boolean | null;
  cardPaymentRecurringAvailable: boolean | null;
  cardPaymentStatus: CardPaymentStatus;
  cardPaymentNote: string | null;
  isFeatured: boolean;
  supportedBrowsers: SupportedBrowser[];
}

export type PublicInsurersResult =
  | { status: "ok"; insurers: PublicInsurer[] }
  | { status: "error" };

const BROWSER_MAPPING: Record<string, SupportedBrowser[]> = {
  "samsung-fire": ["chrome", "edge"],
  "hanwha-general": ["chrome", "edge"],
  "hyundai-marine": ["chrome", "edge"],
  "meritz-fire": ["chrome", "edge"],
  "db-general": ["chrome"],
  "kb-general": ["chrome", "edge"],
  "heungkuk-fire": ["chrome", "edge"],
  "nh-general": ["chrome"],
  "lotte-general": ["chrome", "edge"],
  "aig-general": ["chrome", "edge"],
  "chubb-general": ["chrome", "edge"],
  "yebyeol-general": ["edge"],
  "hana-general": ["chrome"],
  "samsung-life": ["edge"],
  "hanwha-life": ["chrome", "edge"],
  "kyobo-life": ["chrome", "edge"],
  "metlife": ["chrome"],
  "nh-life": ["chrome", "edge"],
  "shinhan-life": ["chrome"],
  "kb-life": ["chrome", "edge"],
  "heungkuk-life": ["chrome"],
  "abl-life": ["chrome", "edge"],
  "miraeasset-life": ["chrome", "edge"],
  "tongyang-life": ["chrome"],
  "kdb-life": ["chrome"],
  "db-life": ["chrome", "edge"],
  "aia-life": ["chrome", "edge"],
  "im-life": ["chrome"],
  "lina-life": ["chrome", "edge"],
};

export function getSupportedBrowsersForId(id: string): SupportedBrowser[] {
  return BROWSER_MAPPING[id] ?? [];
}

// Canonical public visibility rule for the Insurer surface.
//
// A record is visible on /directory if and only if:
//   - isPublished === true
//   - verificationStatus ∈ PUBLIC_VERIFICATION_STATUSES
//
// Draft, pending, unverified, and unpublished rows must never appear publicly.
// Both the Prisma query in `getPublicInsurers` below and the admin-side
// `app/admin/insurers/visibility.ts` helpers read from this list so the rule
// can never drift between the read path and the publish guard.
export const PUBLIC_VERIFICATION_STATUSES = [
  VerificationStatus.verified,
  VerificationStatus.needs_review,
] as const satisfies readonly VerificationStatus[];

export type PublicVerificationStatus =
  (typeof PUBLIC_VERIFICATION_STATUSES)[number];

export function isPublicVerificationStatus(
  status: VerificationStatus,
): status is PublicVerificationStatus {
  return (PUBLIC_VERIFICATION_STATUSES as readonly VerificationStatus[]).includes(
    status,
  );
}

export interface InsurerVisibilityFlags {
  verificationStatus: VerificationStatus;
  isPublished: boolean;
}

export function isInsurerPubliclyVisible(
  flags: InsurerVisibilityFlags,
): boolean {
  return isPublishedContentPubliclyVisible(flags);
}

const CANONICAL_MAPPING: Record<string, string> = {
  "db-insurance": "db-general",
  "kb-insurance": "kb-general",
  "lotte-fire": "lotte-general",
  "lina-general": "chubb-general",
  "yebyeol-insurance": "yebyeol-general",
};

export function dedupePublicInsurers(rawInsurers: PublicInsurer[]): PublicInsurer[] {
  const map = new Map<string, PublicInsurer>();
  
  for (const item of rawInsurers) {
    const canonicalId = CANONICAL_MAPPING[item.id] ?? item.id;
    const existing = map.get(canonicalId);
    
    if (!existing) {
      map.set(canonicalId, { ...item, id: canonicalId });
    } else {
      const merged = { ...existing };
      
      const fieldsToMerge: (keyof PublicInsurer)[] = [
        "officialWebsiteUrl",
        "plannerPortalUrl",
        "systemUrl",
        "customerCenterPhone",
        "helpdeskPhone",
        "callMonitoringPhone",
        "claimPageUrl",
        "claimFaxNumber",
        "faxNumber",
        "mailingAddress",
        "registeredMailAddress",
        "claimFormUrl",
        "termsUrl",
        "cardPaymentNote",
      ];
      
      for (const field of fieldsToMerge) {
        const canonicalVal = existing[field];
        const duplicateVal = item[field];
        
        if (!canonicalVal || canonicalVal === "-" || canonicalVal === "해당사항 없음" || canonicalVal === "해당없음") {
          if (duplicateVal && duplicateVal !== "-" && duplicateVal !== "해당사항 없음" && duplicateVal !== "해당없음") {
            Object.assign(merged, { [field]: duplicateVal });
          }
        } else if (field === "cardPaymentNote" && duplicateVal && (duplicateVal as string).length > (canonicalVal as string).length) {
          Object.assign(merged, { [field]: duplicateVal });
        }
      }
      
      const combinedBrowsers = new Set([
        ...(existing.supportedBrowsers || []),
        ...(item.supportedBrowsers || []),
      ]);
      merged.supportedBrowsers = Array.from(combinedBrowsers) as SupportedBrowser[];
      merged.isFeatured = existing.isFeatured || item.isFeatured;
      
      map.set(canonicalId, merged);
    }
  }
  
  return Array.from(map.values());
}

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function getMockInsurers(): PublicInsurer[] {
  const rawInsurers: PublicInsurer[] = insurerDirectoryEntries.map((record) => ({
    ...record,
    lastVerifiedAt: record.lastVerifiedAt ? record.lastVerifiedAt : null,
    supportedBrowsers: getSupportedBrowsersForId(record.id),
  })) as PublicInsurer[];

  return dedupePublicInsurers(rawInsurers);
}

export async function getPublicInsurers(): Promise<PublicInsurersResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "ok", insurers: getMockInsurers() };
  }

  try {
    const records = await prisma.insurer.findMany({
      where: {
        isPublished: true,
        verificationStatus: { in: [...PUBLIC_VERIFICATION_STATUSES] },
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        category: true,
        verificationStatus: true,
        lastVerifiedAt: true,
        officialWebsiteUrl: true,
        plannerPortalUrl: true,
        systemUrl: true,
        customerCenterPhone: true,
        helpdeskPhone: true,
        callMonitoringPhone: true,
        claimPageUrl: true,
        claimFaxNumber: true,
        claimFaxHandlingType: true,
        faxNumber: true,
        mailingAddress: true,
        registeredMailAddress: true,
        claimFormUrl: true,
        termsUrl: true,
        cardPaymentInitialAvailable: true,
        cardPaymentRecurringAvailable: true,
        cardPaymentStatus: true,
        cardPaymentNote: true,
        isFeatured: true,
      },
    });

    const rawInsurers: PublicInsurer[] = records.map((record) => ({
      ...record,
      lastVerifiedAt: toIsoDate(record.lastVerifiedAt),
      supportedBrowsers: getSupportedBrowsersForId(record.id),
    }));

    const insurers = dedupePublicInsurers(rawInsurers);

    return { status: "ok", insurers };
  } catch {
    console.warn("[plannerdesk] DB query failed, falling back to mock data.");
    return { status: "ok", insurers: getMockInsurers() };
  }
}
