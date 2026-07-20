import { safePublicReturnTo } from "@/lib/auth/safe-public-return-to";

export const PLANNER_SIGN_IN_PATHS = {
  google: "/api/auth/signin/google",
  auth: "/api/auth/signin",
} as const;

export type PlannerSignInPath =
  (typeof PLANNER_SIGN_IN_PATHS)[keyof typeof PLANNER_SIGN_IN_PATHS]
  | null;

/** Builds a client-safe sign-in href from a server-selected, non-sensitive path. */
export function buildPlannerSignInHref(
  signInPath: PlannerSignInPath,
  returnTo?: string,
): string | null {
  if (!signInPath) {
    return null;
  }

  const encoded = encodeURIComponent(safePublicReturnTo(returnTo));
  return `${signInPath}?callbackUrl=${encoded}`;
}
