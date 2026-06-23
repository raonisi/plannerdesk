/**
 * Firebase authorized asset delivery failure responses (server-only).
 */

import { NextResponse } from "next/server";

import type { AuthorizedAssetDeliveryMode } from "@/lib/public/authorized-asset-delivery-mode";
import {
  classifyAuthorizedAssetDeliveryError,
  logAuthorizedAssetDeliveryFailure,
  type AuthorizedAssetDeliveryErrorCode,
} from "@/lib/server/authorized-asset-delivery-errors";
import { redirectToApprovedStaticPath } from "@/lib/server/authorized-asset-static-redirect";

export type FirebaseAuthorizedAssetDeliveryMode = Extract<
  AuthorizedAssetDeliveryMode,
  "firebase" | "firebase_with_static_fallback"
>;

export function isFirebaseAuthorizedAssetDeliveryMode(
  mode: AuthorizedAssetDeliveryMode,
): mode is FirebaseAuthorizedAssetDeliveryMode {
  return mode === "firebase" || mode === "firebase_with_static_fallback";
}

export function respondAuthorizedAssetFirebaseFailure(input: {
  code: AuthorizedAssetDeliveryErrorCode;
  kind: "claim_pdf" | "insurer_logo" | "learning_resource";
  assetId: string;
  deliveryMode: FirebaseAuthorizedAssetDeliveryMode;
  status: 403 | 404 | 503;
  staticPublicPath: string;
  unavailableError: string;
}): NextResponse {
  logAuthorizedAssetDeliveryFailure({
    code: input.code,
    kind: input.kind,
    assetId: input.assetId,
    deliveryMode: input.deliveryMode,
    status: input.status,
  });

  if (input.deliveryMode === "firebase_with_static_fallback") {
    return redirectToApprovedStaticPath(input.staticPublicPath);
  }

  if (input.status === 404) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    { error: input.unavailableError },
    { status: input.status },
  );
}

export function respondAuthorizedAssetFirebaseCatchFailure(
  error: unknown,
  input: {
    kind: "claim_pdf" | "insurer_logo" | "learning_resource";
    assetId: string;
    deliveryMode: FirebaseAuthorizedAssetDeliveryMode;
    staticPublicPath: string;
    unavailableError: string;
  },
): NextResponse {
  const failure = classifyAuthorizedAssetDeliveryError(error);
  return respondAuthorizedAssetFirebaseFailure({
    code: failure.code,
    kind: input.kind,
    assetId: input.assetId,
    deliveryMode: input.deliveryMode,
    status: failure.status,
    staticPublicPath: input.staticPublicPath,
    unavailableError: input.unavailableError,
  });
}
