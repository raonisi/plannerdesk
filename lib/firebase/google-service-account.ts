import { createSign, randomUUID } from "node:crypto";

import type { WorkToolsFirebaseUploadConfig } from "@/lib/api/work-tools-storage-config";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_STORAGE_SCOPE = "https://www.googleapis.com/auth/devstorage.read_write";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
};

export type FirebaseStorageUploadResult = {
  name: string;
  bucket: string;
  size: number;
  contentType: string;
  downloadUrl: string;
};

export async function uploadFileToFirebaseStorage({
  config,
  objectPath,
  contentType,
  bytes,
}: {
  config: WorkToolsFirebaseUploadConfig;
  objectPath: string;
  contentType: string;
  bytes: Buffer;
}): Promise<FirebaseStorageUploadResult> {
  const accessToken = await getGoogleAccessToken(config);
  const downloadToken = randomUUID();
  const boundary = `plannerdesk-firebase-${randomUUID()}`;
  const metadata = {
    contentType,
    metadata: {
      firebaseStorageDownloadTokens: downloadToken,
    },
  };

  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
    ),
    bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(config.bucket)}/o?uploadType=multipart&name=${encodeURIComponent(objectPath)}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error("firebase_storage_upload_failed");
  }

  const uploaded = (await response.json()) as {
    name?: string;
    bucket?: string;
    size?: string;
    contentType?: string;
  };

  return {
    name: uploaded.name ?? objectPath,
    bucket: uploaded.bucket ?? config.bucket,
    size: Number(uploaded.size ?? bytes.byteLength),
    contentType: uploaded.contentType ?? contentType,
    downloadUrl: buildFirebaseDownloadUrl(config.bucket, objectPath, downloadToken),
  };
}

async function getGoogleAccessToken(config: WorkToolsFirebaseUploadConfig): Promise<string> {
  const assertion = buildServiceAccountAssertion(config);
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const token = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok || !token.access_token) {
    throw new Error("firebase_storage_auth_failed");
  }

  return token.access_token;
}

function buildServiceAccountAssertion(config: WorkToolsFirebaseUploadConfig): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
    }),
  );
  const claimSet = base64UrlEncode(
    JSON.stringify({
      iss: config.clientEmail,
      scope: FIREBASE_STORAGE_SCOPE,
      aud: GOOGLE_OAUTH_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsignedToken = `${header}.${claimSet}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .end()
    .sign(config.privateKey);

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function buildFirebaseDownloadUrl(bucket: string, objectPath: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`;
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
