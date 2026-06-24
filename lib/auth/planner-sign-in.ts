import {
  isAuthProviderConfigured,
  isGoogleAuthConfigured,
} from "@/lib/auth/env";
import { safePublicReturnTo } from "@/lib/auth/safe-public-return-to";

/** True when a shared Auth.js provider is configured for planner sign-in. */
export function isPlannerSignInAvailable(): boolean {
  return isAuthProviderConfigured();
}

/**
 * Builds a public planner sign-in URL with a sanitized return path.
 * Returns null when no auth provider is configured (no CTA should be shown).
 */
export function getPlannerSignInHref(returnTo?: string): string | null {
  if (!isPlannerSignInAvailable()) {
    return null;
  }

  const safeReturnTo = safePublicReturnTo(returnTo);
  const encoded = encodeURIComponent(safeReturnTo);

  if (isGoogleAuthConfigured()) {
    return `/api/auth/signin/google?callbackUrl=${encoded}`;
  }

  return `/api/auth/signin?callbackUrl=${encoded}`;
}
