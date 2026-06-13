/**
 * Work-tools storage proxy configuration (supports both Firebase and Supabase).
 * Never log or return secret values from this module.
 */

export const WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR = "storage_not_configured" as const;

export type WorkToolsFirebaseConfig = {
  bucket: string;
};

export type WorkToolsSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function isWorkToolsStorageConfigured(): boolean {
  return getWorkToolsFirebaseConfig() !== null;
}

export function getWorkToolsFirebaseConfig(): WorkToolsFirebaseConfig | null {
  const bucket = process.env.WORK_TOOLS_FIREBASE_BUCKET?.trim();

  if (!bucket) {
    return null;
  }

  return { bucket };
}

export function getWorkToolsSupabaseConfig(): WorkToolsSupabaseConfig | null {
  const url = process.env.WORK_TOOLS_SUPABASE_URL?.trim();
  const anonKey = process.env.WORK_TOOLS_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function buildWorkToolsStorageListUrl(bucket: string, prefix: string): string {
  // Firebase requires prefix to be empty or end with a single '/'
  const validPrefix = prefix && !prefix.endsWith("/") ? prefix + "/" : prefix;
  const encodedPrefix = encodeURIComponent(validPrefix);
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?prefix=${encodedPrefix}`;
}

export function buildWorkToolsStoragePublicUrl(
  bucket: string,
  prefix: string,
  fileName: string,
): string {
  const fullPath = prefix ? `${prefix}/${fileName}` : fileName;
  // Firebase requires the full path to be URL-encoded, but slashes must be %2F
  const encodedPath = encodeURIComponent(fullPath);
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodedPath}?alt=media`;
}

export function buildSupabaseStorageListUrl(baseUrl: string, bucket: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  return `${trimmed}/storage/v1/object/list/${encodeURIComponent(bucket)}`;
}

export function buildSupabaseStoragePublicUrl(
  baseUrl: string,
  bucket: string,
  prefix: string,
  fileName: string,
): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  const pathPrefix = prefix ? `${prefix}/` : "";
  return `${trimmed}/storage/v1/object/public/${encodeURIComponent(bucket)}/${pathPrefix}${encodeURIComponent(fileName)}`;
}

