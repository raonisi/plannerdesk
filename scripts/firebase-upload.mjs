#!/usr/bin/env node

import { createSign, randomUUID } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_STORAGE_SCOPE = "https://www.googleapis.com/auth/devstorage.read_write";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

loadDotEnvLocal();

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.file) {
  printUsage();
  process.exit(args.help ? 0 : 1);
}

const filePath = resolve(args.file);
if (!existsSync(filePath)) {
  fail("file_not_found");
}

const fileStat = statSync(filePath);
if (!fileStat.isFile()) {
  fail("path_is_not_file");
}

if (fileStat.size <= 0 || fileStat.size > MAX_UPLOAD_BYTES) {
  fail("invalid_file_size");
}

const config = getUploadConfig();
const objectPath = buildObjectPath(args.dest || args.prefix || "", basename(filePath));
if (!objectPath) {
  fail("invalid_destination_path");
}

const contentType = args.contentType || inferContentType(filePath);
const fileBytes = readFileSync(filePath);

const result = await uploadFileToFirebaseStorage({
  config,
  objectPath,
  contentType,
  bytes: fileBytes,
});

console.log(JSON.stringify(result, null, 2));

function getUploadConfig() {
  const bucket = readEnv("FIREBASE_UPLOAD_BUCKET") || readEnv("WORK_TOOLS_FIREBASE_BUCKET");
  const clientEmail =
    readEnv("FIREBASE_UPLOAD_CLIENT_EMAIL") ||
    readEnv("GOOGLE_CLIENT_EMAIL") ||
    readEnv("WORK_TOOLS_FIREBASE_CLIENT_EMAIL");
  const privateKey =
    readEnv("FIREBASE_UPLOAD_PRIVATE_KEY") ||
    readEnv("GOOGLE_PRIVATE_KEY") ||
    readEnv("WORK_TOOLS_FIREBASE_PRIVATE_KEY");

  if (!bucket || !clientEmail || !privateKey) {
    fail("firebase_upload_env_missing");
  }

  return {
    bucket,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

async function uploadFileToFirebaseStorage({ config, objectPath, contentType, bytes }) {
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
    fail("firebase_storage_upload_failed");
  }

  const uploaded = await response.json();

  return {
    ok: true,
    bucket: uploaded.bucket || config.bucket,
    name: uploaded.name || objectPath,
    size: Number(uploaded.size || bytes.byteLength),
    contentType: uploaded.contentType || contentType,
    public_url: buildFirebaseDownloadUrl(config.bucket, objectPath, downloadToken),
  };
}

async function getGoogleAccessToken(config) {
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

  const token = await response.json().catch(() => ({}));
  if (!response.ok || !token.access_token) {
    fail("firebase_storage_auth_failed");
  }

  return token.access_token;
}

function buildServiceAccountAssertion(config) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
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

function buildObjectPath(destination, fallbackFileName) {
  const cleanedDestination = String(destination)
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => sanitizePathPart(part))
    .filter(Boolean)
    .join("/");

  if (!cleanedDestination) return sanitizePathPart(fallbackFileName);
  if (cleanedDestination.includes("..") || cleanedDestination.length > 512) return null;
  if (/\.[A-Za-z0-9]{1,8}$/.test(cleanedDestination)) return cleanedDestination;

  const cleanedFileName = sanitizePathPart(fallbackFileName);
  if (!cleanedFileName) return null;
  return `${cleanedDestination}/${cleanedFileName}`;
}

function sanitizePathPart(value) {
  const cleaned = String(value)
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();

  if (!cleaned || cleaned === "." || cleaned === "..") return "";
  return cleaned;
}

function inferContentType(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".csv")) return "text/csv";
  return "application/octet-stream";
}

function buildFirebaseDownloadUrl(bucket, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`;
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--file") {
      parsed.file = rawArgs[++index];
    } else if (arg === "--dest") {
      parsed.dest = rawArgs[++index];
    } else if (arg === "--prefix") {
      parsed.prefix = rawArgs[++index];
    } else if (arg === "--content-type") {
      parsed.contentType = rawArgs[++index];
    } else {
      fail(`unknown_argument:${arg}`);
    }
  }
  return parsed;
}

function loadDotEnvLocal() {
  const envPath = resolve(".env.local");
  if (!existsSync(envPath)) return;

  const envText = readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function readEnv(key) {
  return process.env[key]?.trim() || "";
}

function printUsage() {
  console.log(`Usage:
  node scripts/firebase-upload.mjs --file <local-file> --dest <firebase/path.ext>
  node scripts/firebase-upload.mjs --file <local-file> --prefix <firebase/folder>

Required env in .env.local or shell:
  FIREBASE_UPLOAD_BUCKET
  FIREBASE_UPLOAD_CLIENT_EMAIL
  FIREBASE_UPLOAD_PRIVATE_KEY
`);
}

function fail(code) {
  console.error(code);
  process.exit(1);
}
