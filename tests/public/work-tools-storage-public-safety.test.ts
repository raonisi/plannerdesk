import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  isWorkToolsStoragePublicUrl,
  WORK_TOOLS_STORAGE_FORBIDDEN_UI_TERMS,
  WORK_TOOLS_STORAGE_LOAD_ERROR,
} from "@/lib/work-tools/storage-public-copy";

const ROOT = process.cwd();

describe("PR-RELEASE-BLOCKER-A work-tools storage public safety", () => {
  it("storage route does not return dev fallback sample PDFs or public_url hash", () => {
    const route = readFileSync(
      join(ROOT, "app/api/work-tools/storage/route.ts"),
      "utf8",
    );
    assert.doesNotMatch(route, /getDevFallbackResponse/);
    assert.doesNotMatch(route, /샘플_테스트/);
    assert.doesNotMatch(route, /public_url:\s*"#"/);
    assert.match(route, /storageUnavailableResponse/);
    assert.match(route, /WORK_TOOLS_STORAGE_EMPTY_MESSAGE/);
    assert.doesNotMatch(route, /Failed to list storage files/);
    assert.doesNotMatch(route, /Internal Server Error/);
  });

  it("work-tools client uses public-safe storage messages", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(client, /WORK_TOOLS_STORAGE_LOAD_ERROR/);
    assert.match(client, /WORK_TOOLS_STORAGE_EMPTY_MESSAGE/);
    assert.match(client, /isWorkToolsStoragePublicUrl/);
    for (const term of [
      ".env",
      "WORK_TOOLS_FIREBASE_BUCKET",
      "WORK_TOOLS_SUPABASE",
      "ANON_KEY",
    ]) {
      assert.doesNotMatch(client, new RegExp(term), term);
    }
  });

  it("public_url hash is not treated as a valid download link", () => {
    assert.equal(isWorkToolsStoragePublicUrl("#"), false);
    assert.equal(isWorkToolsStoragePublicUrl(""), false);
    assert.equal(isWorkToolsStoragePublicUrl("https://example.com/file.pdf"), true);
  });

  it("forbidden internal terms stay out of public work-tools client UI", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    for (const term of WORK_TOOLS_STORAGE_FORBIDDEN_UI_TERMS) {
      if (term === "sample" || term === "mock") continue;
      assert.doesNotMatch(client, new RegExp(term), term);
    }
    assert.match(WORK_TOOLS_STORAGE_LOAD_ERROR, /잠시 후 다시 확인/);
  });
});

describe("PR-RELEASE-BLOCKER-A insurer system portal CTA a11y", () => {
  it("does not combine role=status with aria-disabled", () => {
    const cta = readFileSync(
      join(ROOT, "components/directory/insurer-system-portal-primary-cta.tsx"),
      "utf8",
    );
    assert.doesNotMatch(cta, /role="status"/);
    assert.doesNotMatch(cta, /aria-disabled/);
    assert.match(cta, /disabled/);
    assert.match(cta, /type="button"/);
  });
});
