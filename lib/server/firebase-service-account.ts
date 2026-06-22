/**
 * Firebase service account config for server-only Storage operations.
 * Reuses existing operator upload credentials — never log secret values.
 */

import { getWorkToolsFirebaseConfig } from "@/lib/api/work-tools-storage-config";

export type FirebaseServiceAccountConfig = {
  bucket: string;
  clientEmail: string;
  privateKey: string;
};

export function getFirebaseServiceAccountConfig(): FirebaseServiceAccountConfig | null {
  const firebase = getWorkToolsFirebaseConfig();
  const clientEmail = process.env.FIREBASE_UPLOAD_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_UPLOAD_PRIVATE_KEY?.trim();

  if (!firebase?.bucket || !clientEmail || !privateKeyRaw) {
    return null;
  }

  return {
    bucket: firebase.bucket,
    clientEmail,
    privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
  };
}

export async function getGoogleAccessToken(
  config: Pick<FirebaseServiceAccountConfig, "clientEmail" | "privateKey">,
): Promise<string> {
  const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
  const FIREBASE_STORAGE_SCOPE =
    "https://www.googleapis.com/auth/devstorage.read_write";

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: config.clientEmail,
      scope: FIREBASE_STORAGE_SCOPE,
      aud: GOOGLE_OAUTH_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");

  const { createSign } = await import("node:crypto");
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${claimSet}`)
    .sign(config.privateKey)
    .toString("base64url");

  const assertion = `${header}.${claimSet}.${signature}`;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("FIREBASE_AUTH_FAILED");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("FIREBASE_AUTH_FAILED");
  }

  return data.access_token;
}
