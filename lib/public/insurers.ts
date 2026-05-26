import type {
  CardPaymentStatus,
  ClaimFaxHandlingType,
  InsurerCategory,
  VerificationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Public-safe projection of the Insurer model. Internal governance fields like
// `notes`, `sourceNote`, `createdById`, `updatedById`, and any unpublished
// records must not flow through this type. Keep this list in sync with the
// allow list in `getPublicInsurers` below.
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
}

export type PublicInsurersResult =
  | { status: "ok"; insurers: PublicInsurer[] }
  | { status: "error" };

// Public verification statuses that may surface on /directory. Draft, pending,
// or unverified rows must never appear publicly, even if isPublished is true.
const PUBLIC_VERIFICATION_STATUSES = [
  "verified",
  "needs_review",
] as const satisfies readonly VerificationStatus[];

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export async function getPublicInsurers(): Promise<PublicInsurersResult> {
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

    const insurers: PublicInsurer[] = records.map((record) => ({
      ...record,
      lastVerifiedAt: toIsoDate(record.lastVerifiedAt),
    }));

    return { status: "ok", insurers };
  } catch (error) {
    // Never expose raw DB errors to the public page. The UI renders a calm
    // "잠시 후 다시 확인해 주세요" notice and operators see the underlying
    // failure through the server logs only.
    console.error("[plannerdesk] getPublicInsurers failed", error);
    return { status: "error" };
  }
}
