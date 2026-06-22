import { buildClaimDocumentKey } from "./document-key";
import { buildClaimLibraryItems } from "./claim-library";
import type { ClaimLibraryItem, ClaimLibraryPdfItem } from "./library-items";
import type { PublicClaimPdfGovernanceOverlay } from "./governance-repository";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";

export function applyClaimPdfGovernanceOverlay(
  items: ClaimLibraryItem[],
  overlay: PublicClaimPdfGovernanceOverlay,
): ClaimLibraryItem[] {
  if (Object.keys(overlay).length === 0) {
    return items;
  }

  const result: ClaimLibraryItem[] = [];

  for (const item of items) {
    if (item.kind !== "pdf") {
      result.push(item);
      continue;
    }

    const documentKey =
      item.governanceDocumentKey ??
      buildClaimDocumentKey({
        filePath: item.filePath || item.href,
        fileName: item.fileName,
        insurerName: item.insurerName,
        documentTitle: item.title,
      });
    const governance = overlay[documentKey];
    if (!governance) {
      result.push(item);
      continue;
    }

    if (governance.isVisible === false) {
      continue;
    }

    result.push(applyOverlayToPdfItem(item, governance));
  }

  return result;
}

function applyOverlayToPdfItem(
  item: ClaimLibraryPdfItem,
  governance: PublicClaimPdfGovernanceOverlay[string],
): ClaimLibraryPdfItem {
  return {
    ...item,
    officialSourceUrl:
      governance.officialSourceUrl !== undefined
        ? governance.officialSourceUrl
        : item.officialSourceUrl,
    cautionText:
      governance.cautionText !== undefined && governance.cautionText !== null
        ? governance.cautionText
        : item.cautionText,
    downloadEnabled: governance.isDownloadEnabled !== false,
  };
}

export function buildClaimLibraryItemsWithGovernance(
  guideDocuments: PublicClaimDocument[],
  overlay: PublicClaimPdfGovernanceOverlay,
): ClaimLibraryItem[] {
  return applyClaimPdfGovernanceOverlay(
    buildClaimLibraryItems(guideDocuments),
    overlay,
  );
}
