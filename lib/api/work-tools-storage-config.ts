/**
 * Work-tools Supabase storage proxy configuration.
 * Never log or return secret values from this module.
 */

export const WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR = "storage_not_configured" as const;

export type WorkToolsSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function isWorkToolsSupabaseConfigured(): boolean {
  return getWorkToolsSupabaseConfig() !== null;
}

export function getWorkToolsSupabaseConfig(): WorkToolsSupabaseConfig | null {
  const url = process.env.WORK_TOOLS_SUPABASE_URL?.trim();
  const anonKey = process.env.WORK_TOOLS_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function buildWorkToolsStorageListUrl(baseUrl: string, bucket: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  return `${trimmed}/storage/v1/object/list/${encodeURIComponent(bucket)}`;
}

export function buildWorkToolsStoragePublicUrl(
  baseUrl: string,
  bucket: string,
  prefix: string,
  fileName: string,
): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  const pathPrefix = prefix ? `${prefix}/` : "";
  return `${trimmed}/storage/v1/object/public/${encodeURIComponent(bucket)}/${pathPrefix}${encodeURIComponent(fileName)}`;
}
