/**
 * Sanitized upload failure diagnostics (no secrets).
 */

const SECRET_PATTERNS = [
  /private[_-]?key/gi,
  /client[_-]?email/gi,
  /authorization/gi,
  /\bBearer\s+\S+/gi,
  /signed[_-]?url/gi,
  /-----BEGIN [A-Z ]+-----/g,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  /storage\.googleapis\.com\/[^\s"']+/gi,
  /plannerdesk\/authorized-assets\/[^\s"']+/gi,
];

export type UploadFailureDiagnostic = {
  assetId: string;
  operation: "upload" | "metadata_get";
  errorCode: string;
  httpStatus: number | null;
  messageSummary: string;
  causeName: string;
  retryable: boolean | "unknown";
};

export function sanitizeUploadMessageSummary(
  raw: string,
  maxLen = 300,
): string {
  let sanitized = raw.replace(/\s+/g, " ").trim();
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[redacted]");
  }
  if (sanitized.length > maxLen) {
    return `${sanitized.slice(0, maxLen - 3)}...`;
  }
  return sanitized;
}

export function formatUploadFailureDiagnostic(
  diagnostic: UploadFailureDiagnostic,
): string {
  return JSON.stringify(diagnostic);
}

export function diagnosticContainsForbiddenSecrets(output: string): boolean {
  const forbidden = [
    /privateKey/i,
    /clientEmail/i,
    /Bearer\s+[A-Za-z0-9._-]+/,
    /signedUrl/i,
    /-----BEGIN/,
    /plannerdesk\/authorized-assets\/[a-z0-9-]+\/[a-f0-9-]{36}\.pdf/i,
  ];
  return forbidden.some((pattern) => pattern.test(output));
}
