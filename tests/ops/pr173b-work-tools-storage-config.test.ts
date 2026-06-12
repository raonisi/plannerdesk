import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildWorkToolsStorageListUrl,
  buildWorkToolsStoragePublicUrl,
  getWorkToolsSupabaseConfig,
  isWorkToolsSupabaseConfigured,
  WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR,
} from "@/lib/api/work-tools-storage-config";

const ROOT = process.cwd();

const HARDCODED_KEY_PATTERN = /sb_publishable_[A-Za-z0-9_-]+/;
const HARDCODED_SUPABASE_HOST = /oomhivvzfyckwfubxveb\.supabase\.co/;

describe("PR173-B work-tools storage hardcoded key removal (static)", () => {
  it("storage route has no hardcoded Supabase key or project host", () => {
    const route = readFileSync(
      join(ROOT, "app/api/work-tools/storage/route.ts"),
      "utf8",
    );
    assert.doesNotMatch(route, HARDCODED_KEY_PATTERN);
    assert.doesNotMatch(route, HARDCODED_SUPABASE_HOST);
    assert.match(route, /getWorkToolsSupabaseConfig/);
    assert.match(route, /WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR/);
    assert.match(route, /workToolsPublicReadRouteGuard/);
  });

  it("storage route does not log secrets or provider details", () => {
    const route = readFileSync(
      join(ROOT, "app/api/work-tools/storage/route.ts"),
      "utf8",
    );
    assert.doesNotMatch(route, /console\.log/);
    assert.doesNotMatch(route, /catch\s*\(\s*error/);
    assert.doesNotMatch(route, /console\.error\(\s*error/);
    assert.match(route, /console\.error\("Error in storage proxy"\)/);
    assert.doesNotMatch(route, /from Supabase/i);
    assert.doesNotMatch(route, /Failed to list files from/i);
    assert.doesNotMatch(route, /=\s*["']sb_/);
    assert.doesNotMatch(route, /const apiKey\s*=/);
  });

  it("env example documents work-tools supabase placeholders only", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");
    assert.match(example, /WORK_TOOLS_SUPABASE_URL/);
    assert.match(example, /WORK_TOOLS_SUPABASE_ANON_KEY/);
    assert.doesNotMatch(example, HARDCODED_KEY_PATTERN);
  });

  it("security model forbids hardcoded api keys and documents env fallback", () => {
    const doc = readFileSync(join(ROOT, "docs/SECURITY_MODEL.md"), "utf8");
    assert.match(doc, /Hardcoded third-party API keys/);
    assert.match(doc, /WORK_TOOLS_SUPABASE_URL/);
    assert.match(doc, /storage_not_configured/);
  });

  it("returns null config when env unset", () => {
    const prevUrl = process.env.WORK_TOOLS_SUPABASE_URL;
    const prevKey = process.env.WORK_TOOLS_SUPABASE_ANON_KEY;
    delete process.env.WORK_TOOLS_SUPABASE_URL;
    delete process.env.WORK_TOOLS_SUPABASE_ANON_KEY;

    try {
      assert.equal(getWorkToolsSupabaseConfig(), null);
      assert.equal(isWorkToolsSupabaseConfigured(), false);
    } finally {
      if (prevUrl === undefined) {
        delete process.env.WORK_TOOLS_SUPABASE_URL;
      } else {
        process.env.WORK_TOOLS_SUPABASE_URL = prevUrl;
      }
      if (prevKey === undefined) {
        delete process.env.WORK_TOOLS_SUPABASE_ANON_KEY;
      } else {
        process.env.WORK_TOOLS_SUPABASE_ANON_KEY = prevKey;
      }
    }
  });

  it("builds storage urls from base url without embedding secrets", () => {
    const base = "https://example.supabase.co";
    assert.equal(
      buildWorkToolsStorageListUrl(base, "claim-docs"),
      "https://example.supabase.co/storage/v1/object/list/claim-docs",
    );
    assert.equal(
      buildWorkToolsStoragePublicUrl(base, "claim-docs", "life", "form.pdf"),
      "https://example.supabase.co/storage/v1/object/public/claim-docs/life/form.pdf",
    );
    const joined = [
      buildWorkToolsStorageListUrl(base, "b"),
      buildWorkToolsStoragePublicUrl(base, "b", "", "f"),
    ].join(" ");
    assert.doesNotMatch(joined, HARDCODED_KEY_PATTERN);
  });

  it("not configured error constant is safe for clients", () => {
    assert.equal(WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR, "storage_not_configured");
    assert.doesNotMatch(WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR, /key|secret|token/i);
  });
});
