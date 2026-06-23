import { NextResponse } from "next/server";

import {
  AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS,
  getServerAuthorizedAssetDeliveryMode,
} from "@/lib/server/authorized-asset-delivery-config";
import {
  respondAuthorizedAssetFirebaseCatchFailure,
  respondAuthorizedAssetFirebaseFailure,
} from "@/lib/server/authorized-asset-firebase-fallback";
import { redirectToApprovedStaticPath } from "@/lib/server/authorized-asset-static-redirect";
import { findAuthorizedStaticLogoByInsurerId } from "@/lib/server/authorized-static-assets-manifest";
import {
  buildAuthorizedAssetSignedLogoUrl,
  getFirebaseObjectMetadata,
} from "@/lib/server/firebase-authorized-asset-storage";
import { getFirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ insurerId: string }>;
};

function notFound() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function GET(_request: Request, context: RouteContext) {
  const { insurerId } = await context.params;
  const asset = findAuthorizedStaticLogoByInsurerId(insurerId);
  const deliveryMode = getServerAuthorizedAssetDeliveryMode();

  if (!asset || !asset.enabled) {
    return notFound();
  }

  if (deliveryMode === "static") {
    return redirectToApprovedStaticPath(asset.staticPublicPath);
  }

  const config = getFirebaseServiceAccountConfig();
  if (!config) {
    return respondAuthorizedAssetFirebaseFailure({
      code: "asset_delivery_config_missing",
      kind: asset.kind,
      assetId: asset.assetId,
      deliveryMode,
      status: 503,
      staticPublicPath: asset.staticPublicPath,
      unavailableError: "storage_unavailable",
    });
  }

  try {
    const remoteMeta = await getFirebaseObjectMetadata(
      config,
      asset.firebaseObjectPath,
    );
    if (!remoteMeta) {
      return respondAuthorizedAssetFirebaseFailure({
        code: "asset_delivery_object_missing",
        kind: asset.kind,
        assetId: asset.assetId,
        deliveryMode,
        status: 404,
        staticPublicPath: asset.staticPublicPath,
        unavailableError: "logo_unavailable",
      });
    }
    if (remoteMeta.insurerId !== asset.insurerId) {
      return respondAuthorizedAssetFirebaseFailure({
        code: "asset_delivery_metadata_invalid",
        kind: asset.kind,
        assetId: asset.assetId,
        deliveryMode,
        status: 404,
        staticPublicPath: asset.staticPublicPath,
        unavailableError: "logo_unavailable",
      });
    }

    const signedUrl = buildAuthorizedAssetSignedLogoUrl(
      config,
      asset.firebaseObjectPath,
      {
        expiresInSeconds: AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS,
        contentType: asset.contentType,
      },
    );

    const response = NextResponse.redirect(signedUrl, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error: unknown) {
    return respondAuthorizedAssetFirebaseCatchFailure(error, {
      kind: asset.kind,
      assetId: asset.assetId,
      deliveryMode,
      staticPublicPath: asset.staticPublicPath,
      unavailableError: "logo_unavailable",
    });
  }
}
