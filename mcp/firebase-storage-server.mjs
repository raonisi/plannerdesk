#!/usr/bin/env node

import { createSign, randomUUID } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const SERVER_NAME = "plannerdesk-firebase-storage";
const SERVER_VERSION = "0.1.0";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_STORAGE_SCOPE = "https://www.googleapis.com/auth/devstorage.read_write";
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const DEFAULT_ENV_FILE = "C:\\work\\plannerdesk\\.env.local";
const BLOCKED_FILE_NAME_PATTERN = /(^|[/\\])(\.env|.*\.(pem|key|p12|pfx))$/i;

loadDotEnvFile(process.env.FIREBASE_UPLOAD_ENV_FILE || DEFAULT_ENV_FILE);

let inputBuffer = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  processMessages();
});

process.stdin.on("error", () => {
  process.exit(1);
});

function processMessages() {
  while (true) {
    const headerEnd = inputBuffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    const headerText = inputBuffer.subarray(0, headerEnd).toString("utf8");
    const contentLengthMatch = /^Content-Length:\s*(\d+)$/im.exec(headerText);
    if (!contentLengthMatch) {
      inputBuffer = Buffer.alloc(0);
      return;
    }

    const contentLength = Number(contentLengthMatch[1]);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + contentLength;
    if (inputBuffer.length < bodyEnd) return;

    const body = inputBuffer.subarray(bodyStart, bodyEnd).toString("utf8");
    inputBuffer = inputBuffer.subarray(bodyEnd);

    void handleMessage(body);
  }
}

async function handleMessage(body) {
  let message;
  try {
    message = JSON.parse(body);
  } catch {
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(message, "id")) {
    return;
  }

  try {
    const result = await dispatch(message.method, message.params || {});
    writeJsonRpc({ jsonrpc: "2.0", id: message.id, result });
  } catch (error) {
    writeJsonRpc({
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : "mcp_tool_failed",
      },
    });
  }
}

async function dispatch(method, params) {
  if (method === "initialize") {
    return {
      protocolVersion: params.protocolVersion || "2024-11-05",
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
    };
  }

  if (method === "tools/list") {
    return {
      tools: [
        {
          name: "firebase_config_status",
          description: "Check whether Firebase upload env variables are configured without exposing secret values.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },
        {
          name: "firebase_upload_file",
          description: "Upload a local file from this machine to Firebase Storage using service-account env variables.",
          inputSchema: {
            type: "object",
            properties: {
              localPath: {
                type: "string",
                description: "Absolute or workspace-relative local file path to upload.",
              },
              destination: {
                type: "string",
                description: "Firebase Storage object path, for example quick-link-files/folder/file.pdf.",
              },
              contentType: {
                type: "string",
                description: "Optional MIME type. If omitted, inferred from file extension.",
              },
            },
            required: ["localPath", "destination"],
            additionalProperties: false,
          },
        },
        {
          name: "firebase_list_files",
          description: "List Firebase Storage objects by prefix without returning credentials.",
          inputSchema: {
            type: "object",
            properties: {
              prefix: {
                type: "string",
                description: "Optional Firebase Storage prefix.",
              },
              maxResults: {
                type: "number",
                description: "Optional maximum result count, capped at 100.",
              },
            },
            additionalProperties: false,
          },
        },
      ],
    };
  }

  if (method === "tools/call") {
    return callTool(params.name, params.arguments || {});
  }

  return {};
}

async function callTool(name, args) {
  if (name === "firebase_config_status") {
    return textResult(JSON.stringify(getConfigStatus(), null, 2));
  }

  if (name === "firebase_upload_file") {
    const result = await uploadFileTool(args);
    return textResult(JSON.stringify(result, null, 2));
  }

  if (name === "firebase_list_files") {
    const result = await listFilesTool(args);
    return textResult(JSON.stringify(result, null, 2));
  }

  throw new Error(`unknown_tool:${name}`);
}

async function uploadFileTool(args) {
  const config = getUploadConfig();
  const localPath = resolve(String(args.localPath || ""));
  const destination = sanitizeObjectPath(String(args.destination || ""));

  if (!destination) {
    throw new Error("invalid_destination_path");
  }

  if (!existsSync(localPath) || !statSync(localPath).isFile()) {
    throw new Error("file_not_found");
  }

  if (BLOCKED_FILE_NAME_PATTERN.test(localPath)) {
    throw new Error("blocked_secret_like_file");
  }

  const fileStat = statSync(localPath);
  if (fileStat.size <= 0 || fileStat.size > MAX_UPLOAD_BYTES) {
    throw new Error("invalid_file_size");
  }

  const contentType = String(args.contentType || inferContentType(localPath));
  const result = await uploadFileToFirebaseStorage({
    config,
    objectPath: destination,
    contentType,
    bytes: readFileSync(localPath),
  });

  return {
    ok: true,
    sourceFile: localPath,
    ...result,
  };
}

async function listFilesTool(args) {
  const config = getUploadConfig();
  const accessToken = await getGoogleAccessToken(config);
  const prefix = String(args.prefix || "");
  const maxResults = Math.max(1, Math.min(Number(args.maxResults || 25), 100));
  const url = new URL(
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(config.bucket)}/o`,
  );
  if (prefix) url.searchParams.set("prefix", prefix);
  url.searchParams.set("maxResults", String(maxResults));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("firebase_storage_list_failed");
  }

  const data = await response.json();
  return {
    ok: true,
    bucket: config.bucket,
    items: (data.items || []).map((item) => ({
      name: item.name,
      size: Number(item.size || 0),
      contentType: item.contentType || null,
      updated: item.updated || null,
    })),
  };
}

function getConfigStatus() {
  const bucket = readEnv("FIREBASE_UPLOAD_BUCKET");
  const clientEmail = readEnv("FIREBASE_UPLOAD_CLIENT_EMAIL");
  const privateKey = readEnv("FIREBASE_UPLOAD_PRIVATE_KEY");

  return {
    ok: Boolean(bucket && clientEmail && privateKey),
    envFile: process.env.FIREBASE_UPLOAD_ENV_FILE || DEFAULT_ENV_FILE,
    configured: {
      FIREBASE_UPLOAD_BUCKET: Boolean(bucket),
      FIREBASE_UPLOAD_CLIENT_EMAIL: Boolean(clientEmail),
      FIREBASE_UPLOAD_PRIVATE_KEY: Boolean(privateKey),
    },
  };
}

function getUploadConfig() {
  const bucket = readEnv("FIREBASE_UPLOAD_BUCKET");
  const clientEmail = readEnv("FIREBASE_UPLOAD_CLIENT_EMAIL");
  const privateKey = readEnv("FIREBASE_UPLOAD_PRIVATE_KEY");

  if (!bucket || !clientEmail || !privateKey) {
    throw new Error("firebase_upload_env_missing");
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
    throw new Error("firebase_storage_upload_failed");
  }

  const uploaded = await response.json();

  return {
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
    throw new Error("firebase_storage_auth_failed");
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

function sanitizeObjectPath(value) {
  const cleaned = value
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.replace(/[\u0000-\u001f\u007f]/g, "").trim())
    .filter(Boolean)
    .join("/");

  if (!cleaned || cleaned.includes("..") || cleaned.length > 512) return "";
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

function loadDotEnvFile(envPath) {
  if (!envPath || !existsSync(envPath)) return;

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

function textResult(text) {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

function writeJsonRpc(payload) {
  const json = JSON.stringify(payload);
  const message = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
  process.stdout.write(message);
}
