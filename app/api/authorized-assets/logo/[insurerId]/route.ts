import { NextResponse } from "next/server";

import { AUTHORIZED_ASSET_SIGNED_URL_TTL_SECONDS } from "@/lib/server/authorized-asset-delivery-config";
import { getServerAuthorizedAssetDeliveryMode } from "@/lib/server/authorized-asset-delivery-config";
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

export async function GET(request: Request, context: RouteContext) {
  const { insurerId } = await context.params;
  const asset = findAuthorizedStaticLogoByInsurerId(insurerId);

  if (!asset || !asset.enabled) {
    return notFound();
  }

  if (getServerAuthorizedAssetDeliveryMode() !== "firebase") {
    return NextResponse.redirect(new URL(asset.staticPublicPath, request.url), 307);
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
    if (!remoteMeta || remoteMeta.insurerId !== asset.insurerId) {
      return notFound();
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
  } catch {
    return NextResponse.json({ error: "logo_unavailable" }, { status: 503 });
  }
}
