import { NextResponse } from "next/server";

import { buildClaimPdfDownloadFileName } from "@/lib/public/public-asset-policy";
import { AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS } from "@/lib/server/authorized-asset-delivery-config";
import { getServerAuthorizedAssetDeliveryMode } from "@/lib/server/authorized-asset-delivery-config";
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
    return NextResponse.redirect(new URL(asset.staticPublicPath, _request.url), 307);
  }

  const config = getFirebaseServiceAccountConfig();
  if (!config) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  try {
    const remoteMeta = await getFirebaseObjectMetadata(
      config,
      asset.firebaseObjectPath,
    );
    if (!remoteMeta || remoteMeta.assetId !== asset.assetId) {
      return notFound();
    }

    if (
      asset.contentType === "application/pdf" &&
      remoteMeta.contentType !== "application/pdf"
    ) {
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
  } catch {
    return NextResponse.json({ error: "download_unavailable" }, { status: 503 });
  }
}