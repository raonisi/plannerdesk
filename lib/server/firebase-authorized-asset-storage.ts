/**
 * Firebase Storage operations for authorized assets (server-only).
 */

import { createHash } from "node:crypto";

import type { FirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";
import { getGoogleAccessToken } from "@/lib/server/firebase-service-account";
import { generateGcsV4SignedUrl } from "@/lib/server/gcs-v4-signed-url";

export type FirebaseObjectMetadata = {
  assetId: string;
  insurerId?: string;
  sha256: string;
  contentType: string;
  reviewedAt: string;
  permissionRecordKey: string;
};

function encodeObjectName(objectPath: string): string {
  return encodeURIComponent(objectPath);
}

export async function getFirebaseObjectMetadata(
  config: FirebaseServiceAccountConfig,
  objectPath: string,
): Promise<FirebaseObjectMetadata | null> {
  const token = await getGoogleAccessToken(config);
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(config.bucket)}/o/${encodeObjectName(objectPath)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("FIREBASE_METADATA_FAILED");
  }

  const data = (await response.json()) as {
    metadata?: Record<string, string>;
    md5Hash?: string;
  };

  const meta = data.metadata ?? {};
  if (!meta.assetId || !meta.sha256) {
    return null;
  }

  return {
    assetId: meta.assetId,
    insurerId: meta.insurerId,
    sha256: meta.sha256,
    contentType: meta.contentType ?? "application/octet-stream",
    reviewedAt: meta.reviewedAt ?? "",
    permissionRecordKey: meta.permissionRecordKey ?? "",
  };
}

export async function uploadFirebaseAuthorizedAsset(
  config: FirebaseServiceAccountConfig,
  objectPath: string,
  bytes: Buffer,
  metadata: FirebaseObjectMetadata,
): Promise<void> {
  const token = await getGoogleAccessToken(config);
  const boundary = `plannerdesk-authorized-${Date.now()}`;
  const objectMetadata = {
    contentType: metadata.contentType,
    metadata: {
      assetId: metadata.assetId,
      insurerId: metadata.insurerId ?? "",
      sha256: metadata.sha256,
      contentType: metadata.contentType,
      reviewedAt: metadata.reviewedAt,
      permissionRecordKey: metadata.permissionRecordKey,
    },
  };

  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(objectMetadata)}\r\n`,
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Type: ${metadata.contentType}\r\n\r\n`,
    ),
    bytes,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const url = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(config.bucket)}/o?uploadType=multipart&name=${encodeURIComponent(objectPath)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error("FIREBASE_UPLOAD_FAILED");
  }
}

export function sha256Buffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function buildAuthorizedAssetSignedDownloadUrl(
  config: FirebaseServiceAccountConfig,
  objectPath: string,
  options: {
    expiresInSeconds: number;
    downloadFileName: string;
    contentType: string;
  },
): string {
  const safeName = options.downloadFileName.replace(/["\\]/g, "_");
  return generateGcsV4SignedUrl(config, objectPath, {
    expiresInSeconds: options.expiresInSeconds,
    responseDisposition: `attachment; filename="${safeName}"`,
    responseType: options.contentType,
  });
}

export function buildAuthorizedAssetSignedLogoUrl(
  config: FirebaseServiceAccountConfig,
  objectPath: string,
  options: {
    expiresInSeconds: number;
    contentType: string;
  },
): string {
  return generateGcsV4SignedUrl(config, objectPath, {
    expiresInSeconds: options.expiresInSeconds,
    responseType: options.contentType,
  });
}
