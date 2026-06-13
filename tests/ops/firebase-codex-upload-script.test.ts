import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("Firebase Codex upload helper", () => {
  it("keeps Firebase upload out of app routes", () => {
    const packageJson = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.match(packageJson, /"firebase:upload": "node scripts\/firebase-upload\.mjs"/);
    assert.doesNotMatch(packageJson, /firebase-storage-upload\.test/);
  });

  it("documents Codex-only upload env placeholders without real service account values", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");

    assert.match(example, /FIREBASE_UPLOAD_BUCKET=/);
    assert.match(example, /FIREBASE_UPLOAD_CLIENT_EMAIL=/);
    assert.match(example, /FIREBASE_UPLOAD_PRIVATE_KEY=/);
    assert.match(example, /scripts\/firebase-upload\.mjs only/);
    assert.doesNotMatch(example, /-----BEGIN PRIVATE KEY-----/);
    assert.doesNotMatch(example, /firebase-adminsdk/);
  });

  it("upload script reads env locally and does not depend on Firebase app runtime", () => {
    const script = readFileSync(join(ROOT, "scripts/firebase-upload.mjs"), "utf8");

    assert.match(script, /FIREBASE_UPLOAD_BUCKET/);
    assert.match(script, /FIREBASE_UPLOAD_CLIENT_EMAIL/);
    assert.match(script, /FIREBASE_UPLOAD_PRIVATE_KEY/);
    assert.match(script, /loadDotEnvLocal/);
    assert.match(script, /GOOGLE_OAUTH_TOKEN_URL/);
    assert.doesNotMatch(script, /WORK_TOOLS_FIREBASE_CLIENT_EMAIL/);
    assert.doesNotMatch(script, /WORK_TOOLS_FIREBASE_PRIVATE_KEY/);
    assert.doesNotMatch(script, /NextRequest|NextResponse|workToolsRouteGuard/);
  });
});
