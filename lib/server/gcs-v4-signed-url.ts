/**
 * Google Cloud Storage V4 signed URL generator (server-only).
 */

import { createHash, createSign } from "node:crypto";

import type { FirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";

export const compareCodePoint = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

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

export function buildCanonicalQueryString(
  queryEntries: Array<[string, string]>,
): string {
  const encoded = queryEntries.map(([key, value]) => ({
    encodedKey: encodeRfc3986(key),
    encodedValue: encodeRfc3986(value),
  }));

  encoded.sort((left, right) => {
    const keyOrder = compareCodePoint(left.encodedKey, right.encodedKey);
    if (keyOrder !== 0) return keyOrder;
    return compareCodePoint(left.encodedValue, right.encodedValue);
  });

  return encoded
    .map(
      ({ encodedKey, encodedValue }) => `${encodedKey}=${encodedValue}`,
    )
    .join("&");
}

export type GcsV4CanonicalRequestParts = {
  canonicalUri: string;
  canonicalQueryString: string;
  canonicalRequest: string;
  stringToSign: string;
  timestamp: string;
  credentialScope: string;
};

export function buildGcsV4CanonicalRequestParts(
  config: Pick<FirebaseServiceAccountConfig, "bucket" | "clientEmail">,
  objectPath: string,
  options: {
    expiresInSeconds: number;
    responseDisposition?: string;
    responseType?: string;
    now: Date;
  },
): GcsV4CanonicalRequestParts {
  const datestamp = toUtcDateTime(options.now).slice(0, 8);
  const timestamp = toUtcDateTime(options.now);
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

  const canonicalQueryString = buildCanonicalQueryString(queryEntries);
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

  return {
    canonicalUri,
    canonicalQueryString,
    canonicalRequest,
    stringToSign,
    timestamp,
    credentialScope,
  };
}

export function generateGcsV4SignedUrl(
  config: FirebaseServiceAccountConfig,
  objectPath: string,
  options: {
    expiresInSeconds: number;
    responseDisposition?: string;
    responseType?: string;
    now?: Date;
  },
): string {
  const host = "storage.googleapis.com";
  const parts = buildGcsV4CanonicalRequestParts(config, objectPath, {
    expiresInSeconds: options.expiresInSeconds,
    responseDisposition: options.responseDisposition,
    responseType: options.responseType,
    now: options.now ?? new Date(),
  });

  let signature: string;
  try {
    signature = createSign("RSA-SHA256")
      .update(parts.stringToSign)
      .sign(config.privateKey)
      .toString("hex");
  } catch {
    throw new Error("FIREBASE_SIGN_FAILED");
  }

  return `https://${host}${parts.canonicalUri}?${parts.canonicalQueryString}&X-Goog-Signature=${signature}`;
}
