import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { OUTPUT_BLOCKED_PHRASES } from "@/lib/answer-assistant/output-safety";

const ROOT = process.cwd();

const AA_ROOT = join(ROOT, "lib/answer-assistant");
const AA_APP_ROUTES = [
  "app/planner/answer-assistant/page.tsx",
  "app/planner/answer-assistant/actions.ts",
] as const;

function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (/\.tsx?$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("PR-BS-18 code search Answer Assistant boundary", () => {
  it("does not import work-tools code APIs in answer-assistant modules", () => {
    const files = collectTsFiles(AA_ROOT);
    assert.ok(files.length > 10);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      assert.doesNotMatch(src, /\/api\/work-tools\/disease-codes/);
      assert.doesNotMatch(src, /\/api\/work-tools\/surgery-codes/);
      assert.doesNotMatch(src, /\/api\/work-tools\/diseases/);
      assert.doesNotMatch(src, /code-search-safety|work-tools-client/);
    }
  });

  it("does not wire code search in planner answer-assistant routes", () => {
    for (const rel of AA_APP_ROUTES) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /disease-codes|surgery-codes|disease-search/);
      assert.doesNotMatch(src, /work-tools\/disease/);
    }
  });

  it("keeps output safety blocks claim and payout certainty phrases", () => {
    const blocked = OUTPUT_BLOCKED_PHRASES.join("\n");
    assert.match(blocked, /청구 가능합니다/);
    assert.match(blocked, /지급/);
    assert.match(blocked, /보장됩니다/);
  });

  it("does not store raw prompt or response in usage audit schema fields", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const auditBlock = schema.slice(
      schema.indexOf("model AnswerAssistantUsageAudit"),
      schema.indexOf("model AnswerAssistantBetaFeedback"),
    );
    assert.doesNotMatch(auditBlock, /\bprompt\b/i);
    assert.doesNotMatch(auditBlock, /\bdraft\b/i);
    assert.doesNotMatch(auditBlock, /rawMessage|responseText/i);
  });

  it("retrieval module does not include code search domains", () => {
    const retrieval = readFileSync(
      join(ROOT, "lib/answer-assistant/retrieval.ts"),
      "utf8",
    );
    assert.doesNotMatch(retrieval, /disease-codes|surgery-codes|kcd/i);
    assert.doesNotMatch(retrieval, /work-tools/);
  });
});
