/**
 * Auth.js catch-all route handler for PlannerDesk.
 *
 * Exposes GET/POST at /api/auth/* using handlers from auth.ts.
 * Admin routes enforce RBAC server-side; public MVP pages stay open.
 *
 * @see auth.ts
 * @see docs/AUTH_RBAC_PRODUCTION.md
 */

import { handlers } from "@/auth";
import { sanitizeAuthCallbackUrl } from "@/lib/auth/oauth-callback-guard";
import { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const safeUrl = sanitizeAuthCallbackUrl(request.url);
  if (safeUrl === request.url) {
    return handlers.GET(request);
  }

  return handlers.GET(new NextRequest(safeUrl, request));
}

export const { POST } = handlers;
