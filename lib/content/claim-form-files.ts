import type { ClaimDocumentCategory } from "@prisma/client";

export interface ClaimFormFile {
  id: string;
  insurerSlug: string;
  insurerName: string;
  categoryLabel: string;
  label: string;
  category: ClaimDocumentCategory;
  href: string;
  sourceUrl: string;
  displayOrder: number;
}

// External claim-form PDF assets are not bundled or served from public/.
// Official-source claim guidance should flow through reviewed claim documents instead.
export const claimFormFiles = [] satisfies ClaimFormFile[];
