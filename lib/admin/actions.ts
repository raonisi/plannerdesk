import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_UNAUTHORIZED_MESSAGE } from "@/lib/admin/safety-copy";

/** Public routes that read published insurer / claim-document data. */
export const PUBLIC_CONTENT_PATHS = [
  "/",
  "/directory",
  "/claim-documents",
  "/disclosure-links",
] as const;

export function revalidatePublicContentPaths(): void {
  for (const path of PUBLIC_CONTENT_PATHS) {
    revalidatePath(path);
  }
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export function handleAdminUnauthorized(path: string, error: unknown): never {
  if (
    error instanceof Error &&
    (error.message.includes("ACCESS_DENIED") ||
      error.message.includes("ADMIN_AUTH_REQUIRED") ||
      error.message.includes("ADMIN_ACCESS_DENIED"))
  ) {
    redirectWithError(path, ADMIN_UNAUTHORIZED_MESSAGE);
  }

  throw error;
}

export { redirectWithError };
