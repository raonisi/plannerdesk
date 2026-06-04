import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CHANGE_HISTORY_LIMITATION_NOTE,
  CHANGE_HISTORY_REASON_GUIDANCE,
} from "@/lib/admin/change-history-metadata";

const ROOT = process.cwd();

const FORBIDDEN_IN_HISTORY = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "PrismaClientKnownRequestError",
  "고객명",
  "주민번호",
  "beforeValue",
  "afterValue",
];

describe("PR133 change history (static)", () => {
  it("hub documents B branch and PR133-B separation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-133-CHANGE-HISTORY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-133-B-DB-FOUNDATION-DESIGN/);
    assert.match(hub, /schema migration/);
    assert.match(hub, /AnswerAssistantUsageAudit/);
  });

  it("schema has no ContentChangeEvent or AdminAuditLog model", () => {
    const schema = readFileSync(
      join(ROOT, "prisma/schema.prisma"),
      "utf8",
    );
    assert.doesNotMatch(schema, /model ContentChangeEvent/);
    assert.doesNotMatch(schema, /model AdminAuditLog/);
    assert.match(schema, /model AnswerAssistantUsageAudit/);
  });

  it("metadata helpers avoid full operator id and PII phrases", () => {
    const lib = readFileSync(
      join(ROOT, "lib/admin/change-history-metadata.ts"),
      "utf8",
    );
    assert.match(lib, /maskOperatorId/);
    assert.match(lib, /PR133-B/);
    for (const phrase of FORBIDDEN_IN_HISTORY) {
      assert.doesNotMatch(CHANGE_HISTORY_REASON_GUIDANCE, new RegExp(phrase));
    }
  });

  it("admin panel is used on edit routes only not public app", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminChangeHistoryMetadataPanel.tsx"),
      "utf8",
    );
    assert.match(panel, /public 미노출/);
    assert.match(CHANGE_HISTORY_LIMITATION_NOTE, /diff/);

    const publicPaths = [
      "app/page.tsx",
      "app/directory/page.tsx",
      "app/knowledge/page.tsx",
      "app/search/page.tsx",
    ];
    for (const rel of publicPaths) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /AdminChangeHistoryMetadataPanel/);
      assert.doesNotMatch(src, /change-history-metadata/);
    }

    const insurerEdit = readFileSync(
      join(ROOT, "app/admin/insurers/[id]/edit/page.tsx"),
      "utf8",
    );
    assert.match(insurerEdit, /AdminChangeHistoryMetadataPanel/);
    assert.match(insurerEdit, /buildInsurerChangeHistoryMetadata/);
    assert.match(panel, /sm:grid-cols-2/);
  });

  it("all five admin edit surfaces include metadata panel", () => {
    const edits = [
      "app/admin/insurers/[id]/edit/page.tsx",
      "app/admin/claim-documents/[id]/edit/page.tsx",
      "app/admin/knowledge/[id]/edit/page.tsx",
      "app/admin/disclosure-links/[id]/edit/page.tsx",
      "app/admin/message-templates/[id]/edit/page.tsx",
    ];
    for (const path of edits) {
      const src = readFileSync(join(ROOT, path), "utf8");
      assert.match(src, /AdminChangeHistoryMetadataPanel/);
    }
  });

  it("PII rules doc lists forbidden storage categories", () => {
    const pii = readFileSync(
      join(ROOT, "docs/PR-133-PII-STORAGE-RULES.md"),
      "utf8",
    );
    assert.match(pii, /상담 원문/);
    assert.match(pii, /secret/);
    assert.match(pii, /token/);
  });

  it("PR133-B design proposes indexes but no migration file in repo", () => {
    const design = readFileSync(
      join(ROOT, "docs/PR-133-B-DB-FOUNDATION-DESIGN.md"),
      "utf8",
    );
    assert.match(design, /ContentChangeEvent/);
    assert.match(design, /not applied in PR133-A/i);
  });
});
