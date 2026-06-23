/**
 * In-memory cache for authorized insurer logo signed URLs (server-only).
 */

import type { AuthorizedStaticAsset } from "@/lib/server/authorized-static-assets-manifest";
import {
  buildAuthorizedAssetSignedLogoUrl,
  getFirebaseObjectMetadata,
} from "@/lib/server/firebase-authorized-asset-storage";
import type { FirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";

export const AUTHORIZED_LOGO_SIGNED_URL_CACHE_TTL_MS = 60_000;
export const AUTHORIZED_LOGO_SIGNED_URL_CACHE_MAX_ENTRIES = 64;
export const AUTHORIZED_LOGO_SIGNED_URL_CACHE_SAFETY_MARGIN_MS = 30_000;

type LogoSignedUrlCacheEntry = {
  signedUrl: string;
  expiresAt: number;
};

const logoSignedUrlCache = new Map<string, LogoSignedUrlCacheEntry>();

export type LogoSignedUrlResolveFailure = {
  kind: "object_missing" | "metadata_invalid";
};

export type LogoSignedUrlResolveResult =
  | { ok: true; signedUrl: string; cacheHit: boolean }
  | { ok: false; failure: LogoSignedUrlResolveFailure };

export type ResolveAuthorizedLogoSignedUrlDeps = {
  now?: () => number;
  getMetadata?: typeof getFirebaseObjectMetadata;
  buildSignedUrl?: typeof buildAuthorizedAssetSignedLogoUrl;
};

function computeCacheExpiresAt(
  nowMs: number,
  signedUrlExpiresInSeconds: number,
): number {
  const ttlExpiry = nowMs + AUTHORIZED_LOGO_SIGNED_URL_CACHE_TTL_MS;
  const signedUrlExpiry =
    nowMs +
    signedUrlExpiresInSeconds * 1000 -
    AUTHORIZED_LOGO_SIGNED_URL_CACHE_SAFETY_MARGIN_MS;
  return Math.min(ttlExpiry, signedUrlExpiry);
}

function touchCacheEntry(insurerId: string, entry: LogoSignedUrlCacheEntry): void {
  if (logoSignedUrlCache.has(insurerId)) {
    logoSignedUrlCache.delete(insurerId);
  }
  logoSignedUrlCache.set(insurerId, entry);
  while (logoSignedUrlCache.size > AUTHORIZED_LOGO_SIGNED_URL_CACHE_MAX_ENTRIES) {
    const oldestKey = logoSignedUrlCache.keys().next().value;
    if (oldestKey === undefined) break;
    logoSignedUrlCache.delete(oldestKey);
  }
}

export function getCachedAuthorizedLogoSignedUrl(
  insurerId: string,
  nowMs = Date.now(),
): string | null {
  const entry = logoSignedUrlCache.get(insurerId);
  if (!entry) return null;
  if (nowMs >= entry.expiresAt) {
    logoSignedUrlCache.delete(insurerId);
    return null;
  }
  touchCacheEntry(insurerId, entry);
  return entry.signedUrl;
}

export function setCachedAuthorizedLogoSignedUrl(
  insurerId: string,
  signedUrl: string,
  nowMs: number,
  signedUrlExpiresInSeconds: number,
): void {
  touchCacheEntry(insurerId, {
    signedUrl,
    expiresAt: computeCacheExpiresAt(nowMs, signedUrlExpiresInSeconds),
  });
}

export function resetAuthorizedLogoSignedUrlCacheForTests(): void {
  logoSignedUrlCache.clear();
}

export function getAuthorizedLogoSignedUrlCacheSizeForTests(): number {
  return logoSignedUrlCache.size;
}

export async function resolveAuthorizedLogoSignedUrl(
  input: {
    config: FirebaseServiceAccountConfig;
    asset: AuthorizedStaticAsset;
    expiresInSeconds: number;
  },
  deps: ResolveAuthorizedLogoSignedUrlDeps = {},
): Promise<LogoSignedUrlResolveResult> {
  const insurerId = input.asset.insurerId;
  if (!insurerId) {
    return { ok: false, failure: { kind: "metadata_invalid" } };
  }

  const now = deps.now ?? (() => Date.now());
  const nowMs = now();
  const cached = getCachedAuthorizedLogoSignedUrl(insurerId, nowMs);
  if (cached) {
    return { ok: true, signedUrl: cached, cacheHit: true };
  }

  const getMetadata = deps.getMetadata ?? getFirebaseObjectMetadata;
  const buildSignedUrl = deps.buildSignedUrl ?? buildAuthorizedAssetSignedLogoUrl;

  const remoteMeta = await getMetadata(input.config, input.asset.firebaseObjectPath);
  if (!remoteMeta) {
    return { ok: false, failure: { kind: "object_missing" } };
  }
  if (remoteMeta.insurerId !== input.asset.insurerId) {
    return { ok: false, failure: { kind: "metadata_invalid" } };
  }

  const signedUrl = buildSignedUrl(input.config, input.asset.firebaseObjectPath, {
    expiresInSeconds: input.expiresInSeconds,
    contentType: input.asset.contentType,
  });

  setCachedAuthorizedLogoSignedUrl(
    insurerId,
    signedUrl,
    nowMs,
    input.expiresInSeconds,
  );

  return { ok: true, signedUrl, cacheHit: false };
}
