import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildWorkToolsStorageListUrl,
  buildWorkToolsStoragePublicUrl,
  buildSupabaseStorageListUrl,
  buildSupabaseStoragePublicUrl,
  getWorkToolsFirebaseConfig,
  getWorkToolsSupabaseConfig,
  isWorkToolsStorageConfigured,
  WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR,
} from "@/lib/api/work-tools-storage-config";

const ROOT = process.cwd();

describe("PR173-B work-tools storage hardcoded key removal (static)", () => {
  it("storage route has no hardcoded Supabase key or project host", () => {
    const route = readFileSync(
      join(ROOT, "app/api/work-tools/storage/route.ts"),
      "utf8",
    );
    assert.doesNotMatch(route, /sb_publishable_[A-Za-z0-9_-]+/);
    assert.doesNotMatch(route, /oomhivvzfyckwfubxveb\.supabase\.co/);
    assert.match(route, /getWorkToolsFirebaseConfig/);
    assert.match(route, /getWorkToolsSupabaseConfig/);
    assert.match(route, /WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR/);
    assert.match(route, /workToolsPublicReadRouteGuard/);
  });

  it("storage route does not log secrets or provider details", () => {
    const route = readFileSync(
      join(ROOT, "app/api/work-tools/storage/route.ts"),
      "utf8",
    );
    assert.match(route, /console\.error\("Error in storage proxy:", err\)/);
    assert.doesNotMatch(route, /from Supabase/i);
    assert.doesNotMatch(route, /Failed to list files from/i);
    assert.doesNotMatch(route, /=\s*["']sb_/);
    assert.doesNotMatch(route, /const apiKey\s*=/);
  });

  it("env example documents work-tools firebase and supabase placeholders", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");
    assert.match(example, /WORK_TOOLS_FIREBASE_BUCKET/);
    assert.match(example, /WORK_TOOLS_SUPABASE_URL/);
    assert.match(example, /WORK_TOOLS_SUPABASE_ANON_KEY/);
  });

  it("returns null config when env unset", () => {
    const prevBucket = process.env.WORK_TOOLS_FIREBASE_BUCKET;
    const prevSupaUrl = process.env.WORK_TOOLS_SUPABASE_URL;
    const prevSupaKey = process.env.WORK_TOOLS_SUPABASE_ANON_KEY;

    delete process.env.WORK_TOOLS_FIREBASE_BUCKET;
    delete process.env.WORK_TOOLS_SUPABASE_URL;
    delete process.env.WORK_TOOLS_SUPABASE_ANON_KEY;

    try {
      assert.equal(getWorkToolsFirebaseConfig(), null);
      assert.equal(getWorkToolsSupabaseConfig(), null);
      assert.equal(isWorkToolsStorageConfigured(), false);
    } finally {
      if (prevBucket !== undefined) {
        process.env.WORK_TOOLS_FIREBASE_BUCKET = prevBucket;
      }
      if (prevSupaUrl !== undefined) {
        process.env.WORK_TOOLS_SUPABASE_URL = prevSupaUrl;
      }
      if (prevSupaKey !== undefined) {
        process.env.WORK_TOOLS_SUPABASE_ANON_KEY = prevSupaKey;
      }
    }
  });

  it("builds storage urls from bucket name and base url", () => {
    const bucket = "test-bucket.appspot.com";
    assert.equal(
      buildWorkToolsStorageListUrl(bucket, "claim-docs"),
      "https://firebasestorage.googleapis.com/v0/b/test-bucket.appspot.com/o?prefix=claim-docs",
    );
    assert.equal(
      buildWorkToolsStoragePublicUrl(bucket, "claim-docs", "file.pdf"),
      "https://firebasestorage.googleapis.com/v0/b/test-bucket.appspot.com/o/claim-docs%2Ffile.pdf?alt=media",
    );

    const supaBase = "https://example.supabase.co";
    assert.equal(
      buildSupabaseStorageListUrl(supaBase, "claim-docs"),
      "https://example.supabase.co/storage/v1/object/list/claim-docs",
    );
    assert.equal(
      buildSupabaseStoragePublicUrl(supaBase, "claim-docs", "life", "form.pdf"),
      "https://example.supabase.co/storage/v1/object/public/claim-docs/life/form.pdf",
    );
  });

  it("not configured error constant is safe for clients", () => {
    assert.equal(WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR, "storage_not_configured");
    assert.doesNotMatch(WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR, /key|secret|token/i);
  });
});

