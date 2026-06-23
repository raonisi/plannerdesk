/**
 * Safe relative redirect to approved manifest static paths.
 */

import { NextResponse } from "next/server";

import {
  AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX,
  AUTHORIZED_LOGO_PUBLIC_PREFIX,
} from "@/lib/content/authorized-third-party-assets";

const BLOCKED_LOCATION_PATTERN =
  /(?:localhost|127\.0\.0\.1|https?:|\\\\|^\/\/|\.\.|\\)/i;

export function isSafeApprovedStaticPublicPath(path: string): boolean {
  const normalized = path.trim();
  if (!normalized.startsWith("/")) return false;
  if (BLOCKED_LOCATION_PATTERN.test(normalized)) return false;
  return (
    normalized.startsWith(AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX) ||
    normalized.startsWith(AUTHORIZED_LOGO_PUBLIC_PREFIX) ||
    normalized.startsWith("/downloads/")
  );
}

export function redirectToApprovedStaticPath(staticPublicPath: string): NextResponse {
  if (!isSafeApprovedStaticPublicPath(staticPublicPath)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: staticPublicPath,
      "Cache-Control": "private, no-store",
    },
  });
}
