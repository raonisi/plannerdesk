/**
 * Server-only Firebase object path builders for authorized assets.
 */

export const AUTHORIZED_ASSETS_FIREBASE_ROOT = "plannerdesk/authorized-assets";

export function buildClaimPdfFirebaseObjectPath(
  insurerId: string,
  assetId: string,
): string {
  return `${AUTHORIZED_ASSETS_FIREBASE_ROOT}/claim-pdfs/${sanitizePathSegment(insurerId)}/${sanitizePathSegment(assetId)}.pdf`;
}

export function buildInsurerLogoFirebaseObjectPath(
  insurerId: string,
  extension: string,
): string {
  const ext = extension.replace(/^\./, "").toLowerCase();
  return `${AUTHORIZED_ASSETS_FIREBASE_ROOT}/insurer-logos/${sanitizePathSegment(insurerId)}/${sanitizePathSegment(insurerId)}.${ext}`;
}

export function buildLearningResourceFirebaseObjectPath(
  assetId: string,
  extension: string,
): string {
  const ext = extension.replace(/^\./, "").toLowerCase();
  return `${AUTHORIZED_ASSETS_FIREBASE_ROOT}/learning-resources/${sanitizePathSegment(assetId)}.${ext}`;
}

function sanitizePathSegment(value: string): string {
  const normalized = value.trim().replace(/\\/g, "/");
  if (!normalized || normalized.includes("..") || normalized.includes("/")) {
    throw new Error("INVALID_PATH_SEGMENT");
  }
  return normalized;
}

export function isAuthorizedAssetsFirebaseObjectPath(path: string): boolean {
  const normalized = path.trim().replace(/\\/g, "/");
  return (
    normalized.startsWith(`${AUTHORIZED_ASSETS_FIREBASE_ROOT}/`) &&
    !normalized.includes("..")
  );
}
