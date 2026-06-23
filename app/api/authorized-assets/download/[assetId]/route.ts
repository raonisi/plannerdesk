import { NextResponse } from "next/server";

import { buildClaimPdfDownloadFileName } from "@/lib/public/public-asset-policy";
import {
  AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS,
  getServerAuthorizedAssetDeliveryMode,
} from "@/lib/server/authorized-asset-delivery-config";
import {
  classifyAuthorizedAssetDeliveryError,
  logAuthorizedAssetDeliveryFailure,
} from "@/lib/server/authorized-asset-delivery-errors";
import { redirectToApprovedStaticPath } from "@/lib/server/authorized-asset-static-redirect";
import { findAuthorizedStaticAssetById } from "@/lib/server/authorized-static-assets-manifest";
import {
  buildAuthorizedAssetSignedDownloadUrl,
  getFirebaseObjectMetadata,
} from "@/lib/server/firebase-authorized-asset-storage";
import { getFirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ assetId: string }>;
};

function notFound() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function GET(_request: Request, context: RouteContext) {
  const { assetId } = await context.params;
  const asset = findAuthorizedStaticAssetById(assetId);

  if (
    !asset ||
    !asset.enabled ||
    (asset.kind !== "claim_pdf" && asset.kind !== "learning_resource")
  ) {
    return notFound();
  }

  if (getServerAuthorizedAssetDeliveryMode() !== "firebase") {
    return redirectToApprovedStaticPath(asset.staticPublicPath);
  }

  const config = getFirebaseServiceAccountConfig();
  if (!config) {
    logAuthorizedAssetDeliveryFailure({
      code: "asset_delivery_config_missing",
      kind: asset.kind,
      assetId: asset.assetId,
      deliveryMode: "firebase",
      status: 503,
    });
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  try {
    const remoteMeta = await getFirebaseObjectMetadata(
      config,
      asset.firebaseObjectPath,
    );
    if (!remoteMeta) {
      logAuthorizedAssetDeliveryFailure({
        code: "asset_delivery_object_missing",
        kind: asset.kind,
        assetId: asset.assetId,
        deliveryMode: "firebase",
        status: 404,
      });
      return notFound();
    }
    if (remoteMeta.assetId !== asset.assetId) {
      logAuthorizedAssetDeliveryFailure({
        code: "asset_delivery_metadata_invalid",
        kind: asset.kind,
        assetId: asset.assetId,
        deliveryMode: "firebase",
        status: 404,
      });
      return notFound();
    }

    if (
      asset.contentType === "application/pdf" &&
      remoteMeta.contentType !== "application/pdf"
    ) {
      logAuthorizedAssetDeliveryFailure({
        code: "asset_delivery_content_type_invalid",
        kind: asset.kind,
        assetId: asset.assetId,
        deliveryMode: "firebase",
        status: 404,
      });
      return notFound();
    }

    const downloadFileName =
      asset.kind === "claim_pdf"
        ? buildClaimPdfDownloadFileName(asset.title)
        : `${asset.title.replace(/[\\/:*?"<>|]/g, "_")}.${asset.staticPublicPath.split(".").pop()}`;

    const signedUrl = buildAuthorizedAssetSignedDownloadUrl(
      config,
      asset.firebaseObjectPath,
      {
        expiresInSeconds: AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS,
        downloadFileName,
        contentType: asset.contentType,
      },
    );

    const response = NextResponse.redirect(signedUrl, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error: unknown) {
    const failure = classifyAuthorizedAssetDeliveryError(error);
    logAuthorizedAssetDeliveryFailure({
      code: failure.code,
      kind: asset.kind,
      assetId: asset.assetId,
      deliveryMode: "firebase",
      status: failure.status,
    });

    return NextResponse.json(
      { error: "download_unavailable" },
      { status: failure.status },
    );
  }
}
