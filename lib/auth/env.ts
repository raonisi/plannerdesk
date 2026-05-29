/**
 * Auth environment helpers. Never log secret values from this module.
 */

export function isAuthSecretConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim(),
  );
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() &&
      process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}

/** True when at least one OAuth provider is configured for sign-in. */
export function isAuthProviderConfigured(): boolean {
  return isGoogleAuthConfigured();
}

/** Auth.js sign-in URL for admin; avoids redirect loops from custom sign-in pages. */
export function getAdminSignInHref(callbackUrl = "/admin"): string {
  const encoded = encodeURIComponent(callbackUrl);
  if (isGoogleAuthConfigured()) {
    return `/api/auth/signin/google?callbackUrl=${encoded}`;
  }
  return `/api/auth/signin?callbackUrl=${encoded}`;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
