/**
 * Server-only authorized asset delivery helpers.
 */

import {
  getAuthorizedAssetDeliveryMode,
  type AuthorizedAssetDeliveryMode,
} from "@/lib/public/authorized-asset-delivery-mode";

export type { AuthorizedAssetDeliveryMode };

export function getServerAuthorizedAssetDeliveryMode(): AuthorizedAssetDeliveryMode {
  return getAuthorizedAssetDeliveryMode();
}

export const AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS = 300;
