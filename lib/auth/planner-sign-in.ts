import {
  isAuthProviderConfigured,
  isGoogleAuthConfigured,
} from "@/lib/auth/env";
import {
  buildPlannerSignInHref,
  PLANNER_SIGN_IN_PATHS,
  type PlannerSignInPath,
} from "@/lib/auth/planner-sign-in-url";

/** True when a shared Auth.js provider is configured for planner sign-in. */
export function isPlannerSignInAvailable(): boolean {
  return isAuthProviderConfigured();
}

/** Non-sensitive provider path selected on the server for client rendering. */
export function getPlannerSignInPath(): PlannerSignInPath {
  if (!isPlannerSignInAvailable()) {
    return null;
  }

  return isGoogleAuthConfigured()
    ? PLANNER_SIGN_IN_PATHS.google
    : PLANNER_SIGN_IN_PATHS.auth;
}

/**
 * Builds a public planner sign-in URL with a sanitized return path.
 * Returns null when no auth provider is configured (no CTA should be shown).
 */
export function getPlannerSignInHref(returnTo?: string): string | null {
  return buildPlannerSignInHref(getPlannerSignInPath(), returnTo);
}
