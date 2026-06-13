import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  buildWorkToolsStorageMetadataUrl,
  buildWorkToolsStorageObjectPath,
  buildWorkToolsStorageUploadUrl,
  getWorkToolsFirebaseUploadConfig,
} from "@/lib/api/work-tools-storage-config";

const ROOT = process.cwd();
const UPLOAD_ENV_KEYS = [
  "WORK_TOOLS_FIREBASE_BUCKET",
  "WORK_TOOLS_FIREBASE_CLIENT_EMAIL",
  "WORK_TOOLS_FIREBASE_PRIVATE_KEY",
] as const;
const previousEnv = new Map<string, string | undefined>();

function rememberUploadEnv() {
  for (const key of UPLOAD_ENV_KEYS) {
    if (!previousEnv.has(key)) previousEnv.set(key, process.env[key]);
  }
}

afterEach(() => {
  for (const [key, value] of previousEnv.entries()) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  previousEnv.clear();
});

describe("Firebase work-tools upload", () => {
  it("upload route is protected and does not use the public read guard", () => {
    const route = readFileSync(
      join(ROOT, "app/api/work-tools/storage/upload/route.ts"),
      "utf8",
    );

    assert.match(route, /workToolsRouteGuard/);
    assert.doesNotMatch(route, /workToolsPublicReadRouteGuard/);
    assert.match(route, /MAX_UPLOAD_BYTES/);
    assert.match(route, /ALLOWED_CONTENT_TYPES/);
    assert.doesNotMatch(route, /console\.error\([^)]*err/);
  });

  it("env example documents upload placeholders without real service account values", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");

    assert.match(example, /WORK_TOOLS_FIREBASE_BUCKET=/);
    assert.match(example, /WORK_TOOLS_FIREBASE_CLIENT_EMAIL=/);
    assert.match(example, /WORK_TOOLS_FIREBASE_PRIVATE_KEY=/);
    assert.doesNotMatch(example, /-----BEGIN PRIVATE KEY-----/);
    assert.doesNotMatch(example, /firebase-adminsdk/);
  });

  it("returns null upload config until all server upload env values are present", () => {
    rememberUploadEnv();
    for (const key of UPLOAD_ENV_KEYS) delete process.env[key];
    process.env.WORK_TOOLS_FIREBASE_BUCKET = "plannerdesk-dev.appspot.com";

    assert.equal(getWorkToolsFirebaseUploadConfig(), null);
  });

  it("normalizes escaped private key newlines when upload config is complete", () => {
    rememberUploadEnv();
    process.env.WORK_TOOLS_FIREBASE_BUCKET = "plannerdesk-dev.appspot.com";
    process.env.WORK_TOOLS_FIREBASE_CLIENT_EMAIL = "firebase@example.iam.gserviceaccount.com";
    process.env.WORK_TOOLS_FIREBASE_PRIVATE_KEY = "line1\\nline2";

    assert.deepEqual(getWorkToolsFirebaseUploadConfig(), {
      bucket: "plannerdesk-dev.appspot.com",
      clientEmail: "firebase@example.iam.gserviceaccount.com",
      privateKey: "line1\nline2",
    });
  });

  it("builds upload urls and blocks unsafe object paths", () => {
    assert.equal(
      buildWorkToolsStorageUploadUrl("plannerdesk-dev.appspot.com", "guides/file.pdf"),
      "https://storage.googleapis.com/upload/storage/v1/b/plannerdesk-dev.appspot.com/o?uploadType=media&name=guides%2Ffile.pdf",
    );
    assert.equal(
      buildWorkToolsStorageMetadataUrl("plannerdesk-dev.appspot.com", "guides/file.pdf"),
      "https://storage.googleapis.com/storage/v1/b/plannerdesk-dev.appspot.com/o/guides%2Ffile.pdf",
    );
    assert.equal(
      buildWorkToolsStorageObjectPath("guides/2026", "guide.pdf"),
      "guides/2026/guide.pdf",
    );
    assert.equal(buildWorkToolsStorageObjectPath("../secrets", "guide.pdf"), null);
    assert.equal(buildWorkToolsStorageObjectPath("guides", ""), null);
  });
});
