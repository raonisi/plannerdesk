/**
 * PR-FEATURE-GAP-01: SSOT resolvers — home counts match public page visible data.
 */

import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { countPublicClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import type { PublicClaimPdfGovernanceOverlay } from "@/lib/claim-documents/governance-repository";
import type { PublicClaimDocument, PublicClaimDocumentsResult } from "./claim-documents";
import type { PublicDisclosureLinksResult } from "./disclosure-links";
import type { PublicInsurer, PublicInsurersResult } from "./insurers";
import type { PublicKnowledgeArticlesResult } from "./knowledge-articles";
import type { PublicMessageTemplatesResult } from "./message-templates";

export type PublicSurfaceStatus = "ok" | "error";

export function resolveVisiblePublicClaimDocuments(
  result: PublicClaimDocumentsResult,
): { items: PublicClaimDocument[]; surfaceStatus: PublicSurfaceStatus } {
  const dbDocuments = result.status === "ok" ? result.data : [];
  const items =
    dbDocuments.length > 0 ? dbDocuments : claimDocumentCandidateFallback;
  const surfaceStatus =
    result.status === "error" && claimDocumentCandidateFallback.length === 0
      ? "error"
      : "ok";
  return { items, surfaceStatus };
}

/**
 * Home + /claim-documents SSOT — guide documents plus insurer PDF library items.
 * Uses `buildClaimLibraryItems` (PDFs from claim-form-files + guides + governance overlay).
 * `needs_review` visibility follows current public policy via guide/PDF metadata — not changed here.
 */
export function resolveVisiblePublicClaimLibrarySurface(
  result: PublicClaimDocumentsResult,
  pdfGovernanceOverlay?: PublicClaimPdfGovernanceOverlay | null,
): {
  guideDocuments: PublicClaimDocument[];
  libraryItemCount: number;
  surfaceStatus: PublicSurfaceStatus;
} {
  const { items: guideDocuments, surfaceStatus } =
    resolveVisiblePublicClaimDocuments(result);
  return {
    guideDocuments,
    libraryItemCount: countPublicClaimLibraryItems(
      guideDocuments,
      pdfGovernanceOverlay,
    ),
    surfaceStatus,
  };
}

export function resolveVisiblePublicInsurers(
  result: PublicInsurersResult,
): { items: PublicInsurer[]; surfaceStatus: PublicSurfaceStatus } {
  if (result.status === "ok") {
    return { items: result.insurers, surfaceStatus: "ok" };
  }
  return { items: [], surfaceStatus: "error" };
}

export function resolveVisiblePublicDisclosureLinks(
  result: PublicDisclosureLinksResult,
): { count: number; surfaceStatus: PublicSurfaceStatus } {
  if (result.status === "ok") {
    return { count: result.data.length, surfaceStatus: "ok" };
  }
  return { count: 0, surfaceStatus: "error" };
}

export function resolveVisiblePublicMessageTemplates(
  result: PublicMessageTemplatesResult,
): { count: number; surfaceStatus: PublicSurfaceStatus } {
  if (result.status === "ok") {
    return { count: result.data.length, surfaceStatus: "ok" };
  }
  return { count: 0, surfaceStatus: "error" };
}

export function resolveVisiblePublicKnowledgeArticles(
  result: PublicKnowledgeArticlesResult,
): { count: number; surfaceStatus: PublicSurfaceStatus } {
  if (result.status === "ok") {
    return { count: result.articles.length, surfaceStatus: "ok" };
  }
  return { count: 0, surfaceStatus: "error" };
}