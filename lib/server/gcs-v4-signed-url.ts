/**
 * Google Cloud Storage V4 signed URL generator (server-only).
 */

import { createHash, createSign } from "node:crypto";

import type { FirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";

function toUtcDateTime(date: Date): string {
  const iso = date.toISOString();
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split("/")
    .map((segment) => encodeRfc3986(segment))
    .join("/");
}

export function generateGcsV4SignedUrl(
  config: FirebaseServiceAccountConfig,
  objectPath: string,
  options: {
    expiresInSeconds: number;
    responseDisposition?: string;
    responseType?: string;
  },
): string {
  const now = new Date();
  const datestamp = toUtcDateTime(now).slice(0, 8);
  const timestamp = toUtcDateTime(now);
  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential = `${config.clientEmail}/${credentialScope}`;

  const host = "storage.googleapis.com";
  const canonicalUri = `/${config.bucket}/${encodeObjectPath(objectPath)}`;

  const queryEntries: Array<[string, string]> = [
    ["X-Goog-Algorithm", "GOOG4-RSA-SHA256"],
    ["X-Goog-Credential", credential],
    ["X-Goog-Date", timestamp],
    ["X-Goog-Expires", String(options.expiresInSeconds)],
    ["X-Goog-SignedHeaders", "host"],
  ];

  if (options.responseDisposition) {
    queryEntries.push([
      "response-content-disposition",
      options.responseDisposition,
    ]);
  }
  if (options.responseType) {
    queryEntries.push(["response-content-type", options.responseType]);
  }

  queryEntries.sort(([a], [b]) => a.localeCompare(b));
  const canonicalQueryString = queryEntries
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    `host:${host}`,
    "",
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const hash = createHash("sha256").update(canonicalRequest).digest("hex");
  const stringToSign = [
    "GOOG4-RSA-SHA256",
    timestamp,
    credentialScope,
    hash,
  ].join("\n");

  const signature = createSign("RSA-SHA256")
    .update(stringToSign)
    .sign(config.privateKey)
    .toString("hex");

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signature}`;
}
