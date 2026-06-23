/**
 * Authorized asset delivery error classification (no secret leakage).
 */

export type AuthorizedAssetDeliveryErrorCode =
  | "asset_delivery_config_missing"
  | "asset_delivery_credentials_missing"
  | "asset_delivery_storage_forbidden"
  | "asset_delivery_object_missing"
  | "asset_delivery_metadata_invalid"
  | "asset_delivery_content_type_invalid"
  | "asset_delivery_sign_failed"
  | "asset_delivery_unexpected";

export type AuthorizedAssetDeliveryFailure = {
  code: AuthorizedAssetDeliveryErrorCode;
  status: 403 | 404 | 503;
};

function errorMessage(error: unknown): string | null {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  return null;
}

export function classifyAuthorizedAssetDeliveryError(
  error: unknown,
): AuthorizedAssetDeliveryFailure {
  const message = errorMessage(error);

  switch (message) {
    case "FIREBASE_AUTH_FAILED":
      return {
        code: "asset_delivery_credentials_missing",
        status: 503,
      };
    case "FIREBASE_STORAGE_FORBIDDEN":
      return {
        code: "asset_delivery_storage_forbidden",
        status: 403,
      };
    case "FIREBASE_SIGN_FAILED":
      return {
        code: "asset_delivery_sign_failed",
        status: 503,
      };
    default:
      return {
        code: "asset_delivery_unexpected",
        status: 503,
      };
  }
}

export function logAuthorizedAssetDeliveryFailure(input: {
  code: AuthorizedAssetDeliveryErrorCode;
  kind: "claim_pdf" | "insurer_logo" | "learning_resource";
  assetId: string;
  deliveryMode: "firebase" | "firebase_with_static_fallback";
  status: 403 | 404 | 503;
}): void {
  console.error(
    JSON.stringify({
      event: "authorized_asset_delivery_failed",
      ...input,
    }),
  );
}
