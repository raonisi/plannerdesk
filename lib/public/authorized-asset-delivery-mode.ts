/**
 * Client-safe authorized asset delivery mode (static | firebase).
 * Value is injected via next.config env from AUTHORIZED_ASSET_DELIVERY_MODE.
 */

export type AuthorizedAssetDeliveryMode = "static" | "firebase";

export function getAuthorizedAssetDeliveryMode(): AuthorizedAssetDeliveryMode {
  const raw = process.env.AUTHORIZED_ASSET_DELIVERY_MODE?.trim().toLowerCase();
  if (raw === "firebase") return "firebase";
  return "static";
}

export function isFirebaseAuthorizedAssetDelivery(): boolean {
  return getAuthorizedAssetDeliveryMode() === "firebase";
}

export function buildAuthorizedPdfDownloadHref(
  assetId: string,
  staticPublicPath: string,
): string {
  if (isFirebaseAuthorizedAssetDelivery()) {
    return `/api/authorized-assets/download/${encodeURIComponent(assetId)}`;
  }
  return staticPublicPath;
}

export function buildAuthorizedLogoHref(
  insurerId: string,
  staticPublicPath: string,
): string | null {
  if (!staticPublicPath) return null;
  if (isFirebaseAuthorizedAssetDelivery()) {
    return `/api/authorized-assets/logo/${encodeURIComponent(insurerId)}`;
  }
  return staticPublicPath;
}
