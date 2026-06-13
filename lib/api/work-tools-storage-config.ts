/**
 * Work-tools storage proxy configuration (supports both Firebase and Supabase).
 * Never log or return secret values from this module.
 */

export const WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR = "storage_not_configured" as const;

export type WorkToolsFirebaseConfig = {
  bucket: string;
};

export type WorkToolsFirebaseUploadConfig = WorkToolsFirebaseConfig & {
  clientEmail: string;
  privateKey: string;
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

export function getWorkToolsFirebaseUploadConfig(): WorkToolsFirebaseUploadConfig | null {
  const base = getWorkToolsFirebaseConfig();
  const clientEmail = process.env.WORK_TOOLS_FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.WORK_TOOLS_FIREBASE_PRIVATE_KEY?.trim();

  if (!base || !clientEmail || !privateKey) {
    return null;
  }

  return {
    ...base,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
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
): string {
  const fullPath = prefix ? `${prefix}/${fileName}` : fileName;
  // Firebase requires the full path to be URL-encoded, but slashes must be %2F
  const encodedPath = encodeURIComponent(fullPath);
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodedPath}?alt=media`;
}

export function buildWorkToolsStorageUploadUrl(bucket: string, objectPath: string): string {
  return `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;
}

export function buildWorkToolsStorageMetadataUrl(bucket: string, objectPath: string): string {
  return `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}`;
}

export function buildWorkToolsStorageObjectPath(prefix: string, fileName: string): string | null {
  const cleanedPrefix = prefix
    .split("/")
    .map((part) => sanitizeStoragePathSegment(part))
    .filter(Boolean)
    .join("/");
  const cleanedName = sanitizeStoragePathSegment(fileName);

  if (!cleanedName || cleanedName === "." || cleanedName === "..") return null;

  const objectPath = cleanedPrefix ? `${cleanedPrefix}/${cleanedName}` : cleanedName;
  if (objectPath.includes("..") || objectPath.length > 512) return null;

  return objectPath;
}

function sanitizeStoragePathSegment(value: string): string {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
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

