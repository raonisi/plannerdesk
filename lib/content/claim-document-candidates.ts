import type { PublicClaimDocument } from "@/lib/public/claim-documents";

// External claim-document archive rows are not used as public fallback data.
// Public claim documents must come from reviewed records with official sources.
export const claimDocumentCandidateFallback = [] satisfies PublicClaimDocument[];
