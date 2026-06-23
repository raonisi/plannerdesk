/**
 * Client-safe authorized asset delivery mode.
 * Value is injected via next.config env from AUTHORIZED_ASSET_DELIVERY_MODE.
 */

export type AuthorizedAssetDeliveryMode =
  | "static"
  | "firebase"
  | "firebase_with_static_fallback";

export function getAuthorizedAssetDeliveryMode(): AuthorizedAssetDeliveryMode {
  const raw = process.env.AUTHORIZED_ASSET_DELIVERY_MODE?.trim().toLowerCase();
  if (raw === "firebase") return "firebase";
  if (raw === "firebase_with_static_fallback") {
    return "firebase_with_static_fallback";
  }
  return "static";
}

export function isFirebaseAuthorizedAssetDelivery(): boolean {
  const mode = getAuthorizedAssetDeliveryMode();
  return mode === "firebase" || mode === "firebase_with_static_fallback";
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
