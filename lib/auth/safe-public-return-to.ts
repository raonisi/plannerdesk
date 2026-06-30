/**
 * Validates post-login return paths for public planner favorites flows.
 * Rejects external URLs, admin routes, and paths outside the public MVP surface.
 */

const ALLOWED_PUBLIC_RETURN_PATHS = [
  "/",
  "/directory",
  "/work-tools",
  "/claim-documents",
  "/disclosure-links",
  "/knowledge",
  "/message-templates",
  "/search",
  "/favorites",
] as const;

function isBlockedReturnPath(pathOnly: string): boolean {
  const normalized = pathOnly.toLowerCase();
  return normalized === "/admin" || normalized.startsWith("/admin/");
}

function isAllowedPublicReturnPath(pathOnly: string): boolean {
  return ALLOWED_PUBLIC_RETURN_PATHS.some((allowed) => {
    if (allowed === "/") {
      return pathOnly === "/";
    }
    return pathOnly === allowed || pathOnly.startsWith(`${allowed}/`);
  });
}

export function safePublicReturnTo(input?: string | null): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "/";

  if (
    /^https?:/i.test(trimmed) ||
    trimmed.startsWith("//") ||
    /^javascript:/i.test(trimmed) ||
    /^data:/i.test(trimmed)
  ) {
    return "/";
  }

  if (!trimmed.startsWith("/")) {
    return "/";
  }

  const pathOnly = trimmed.split("?")[0]?.split("#")[0] ?? "";
  if (!pathOnly || isBlockedReturnPath(pathOnly)) {
    return "/";
  }

  if (!isAllowedPublicReturnPath(pathOnly)) {
    return "/";
  }

  return trimmed;
}

export const PUBLIC_FAVORITES_RETURN_PATHS = ALLOWED_PUBLIC_RETURN_PATHS;
