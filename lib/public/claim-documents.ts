import {
  ClaimDocumentCategory,
  VerificationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PUBLIC_VERIFICATION_STATUSES } from "./insurers";

// Public-safe projection of the ClaimDocument model. Internal governance fields
// like `createdById`, `updatedById`, `createdAt`, `updatedAt`, and any
// unpublished records must not flow through this type. Keep this list in sync
// with the select block in `getPublicClaimDocuments` below.
export interface PublicClaimDocument {
  id: string;
  title: string;
  slug: string;
  category: ClaimDocumentCategory;
  insurerId: string | null;
  insurerName: string | null;
  summary: string | null;
  requiredDocuments: string | null;
  optionalDocuments: string | null;
  claimFormUrl: string | null;
  officialSourceUrl: string | null;
  customerMessageTemplate: string | null;
  cautionNote: string | null;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
}

export type PublicClaimDocumentsResult =
  | { status: "ok"; data: PublicClaimDocument[] }
  | { status: "error" };

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

// Canonical public read helper for ClaimDocument library.
// Only returns records where:
//   - isPublished = true
//   - verificationStatus in [verified, needs_review]
//
// Records sorted by sortOrder asc, title asc.
export async function getPublicClaimDocuments(): Promise<PublicClaimDocumentsResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "error" };
  }

  try {
    const records = await prisma.claimDocument.findMany({
      where: {
        isPublished: true,
        verificationStatus: { in: [...PUBLIC_VERIFICATION_STATUSES] },
      },
      orderBy: [
        { sortOrder: "asc" },
        { title: "asc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        insurerId: true,
        insurer: {
          select: {
            name: true,
          },
        },
        summary: true,
        requiredDocuments: true,
        optionalDocuments: true,
        claimFormUrl: true,
        officialSourceUrl: true,
        customerMessageTemplate: true,
        cautionNote: true,
        verificationStatus: true,
        lastVerifiedAt: true,
      },
    });

    const data: PublicClaimDocument[] = records.map((record) => {
      const { insurer, ...rest } = record;
      return {
        ...rest,
        insurerName: insurer?.name ?? null,
        lastVerifiedAt: toIsoDate(record.lastVerifiedAt),
      };
    });

    return { status: "ok", data };
  } catch {
    // Never expose raw DB errors to the browser page.
    console.warn("[plannerdesk] getPublicClaimDocuments failed.");
    return { status: "error" };
  }
}
