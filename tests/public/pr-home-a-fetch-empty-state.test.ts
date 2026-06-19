import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  HOME_DATA_STATUS_COPY,
  HOME_DATA_STATUS_FORBIDDEN_PHRASES,
  buildHomePublicStats,
  resolveHomeLoadState,
} from "@/lib/dashboard/home-data-state";

const ROOT = process.cwd();

describe("PR-HOME-A home data state helpers", () => {
  it("treats all fetch failures as error load state", () => {
    const state = resolveHomeLoadState({
      fetch: {
        insurers: "error",
        claimDocuments: "error",
        disclosureLinks: "error",
        messageTemplates: "error",
        workTools: "error",
        knowledge: "error",
      },
      insurerCount: 0,
      claimDocumentCount: 0,
      disclosureLinkCount: 0,
      messageTemplateCount: 0,
      workToolCount: 0,
      knowledgeArticleCount: 0,
    });
    assert.equal(state, "error");
  });

  it("does not treat fetch failure counts as zero stats", () => {
    const stats = buildHomePublicStats({
      fetch: {
        insurers: "error",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 0,
      claimDocumentCount: 3,
      disclosureLinkCount: 1,
      messageTemplateCount: 1,
      workToolCount: 50,
      knowledgeArticleCount: 2,
    });
    assert.equal(stats.insurers.kind, "unavailable");
    assert.equal(stats.claimDocuments.kind, "count");
    if (stats.claimDocuments.kind === "count") {
      assert.equal(stats.claimDocuments.value, 3);
    }
  });

  it("distinguishes empty success from error", () => {
    const empty = resolveHomeLoadState({
      fetch: {
        insurers: "ok",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 0,
      claimDocumentCount: 0,
      disclosureLinkCount: 0,
      messageTemplateCount: 0,
      workToolCount: 0,
      knowledgeArticleCount: 0,
    });
    assert.equal(empty, "empty");

    const partial = resolveHomeLoadState({
      fetch: {
        insurers: "ok",
        claimDocuments: "error",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 5,
      claimDocumentCount: 0,
      disclosureLinkCount: 1,
      messageTemplateCount: 1,
      workToolCount: 50,
      knowledgeArticleCount: 1,
    });
    assert.equal(partial, "partial-error");
  });
});

describe("PR-HOME-A home fetch failure UX (static)", () => {
  it("page tracks per-domain fetch status instead of silent empty fallback only", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.match(page, /resolveHomeDomainFetchStatus/);
    assert.match(page, /resolveHomeLoadState/);
    assert.match(page, /buildHomePublicStats/);
    assert.match(page, /loadState=/);
  });

  it("home client shows status notice and keeps primary quick links on error", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /HomeDataStatusNotice/);
    assert.match(home, /HomePublicStatsStrip[\s\S]*loadState/);
    assert.match(home, /href="\/directory"/);
    assert.match(home, /href="\/claim-documents"/);
    assert.match(home, /href="\/disclosure-links"/);
    assert.match(home, /href="\/message-templates"/);
    assert.match(home, /href="\/work-tools"/);
  });

  it("stats strip avoids zero display wording on full fetch failure", () => {
    const strip = readFileSync(
      join(ROOT, "components/dashboard/home-public-stats-strip.tsx"),
      "utf8",
    );
    assert.match(strip, /loadState === "error"/);
    assert.match(strip, /statUnavailable|불러오지 못함/);
    assert.match(strip, /kind === "unavailable"/);
  });

  it("public home surfaces avoid forbidden technical phrases", () => {
    const surfaces = [
      "app/page.tsx",
      "app/home-client.tsx",
      "components/dashboard/home-public-stats-strip.tsx",
      "components/dashboard/home-data-status-notice.tsx",
      "lib/dashboard/home-data-state.ts",
    ];
    for (const rel of surfaces) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      const withoutList = source.replace(
        /HOME_DATA_STATUS_FORBIDDEN_PHRASES[\s\S]*?\] as const;/,
        "",
      );
      for (const phrase of HOME_DATA_STATUS_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(
          withoutList,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          `${rel}: ${phrase}`,
        );
      }
    }
  });

  it("status copy includes recommended user guidance", () => {
    assert.match(HOME_DATA_STATUS_COPY.errorDescription, /상단 메뉴/);
    assert.match(HOME_DATA_STATUS_COPY.partialDescription, /전산 바로가기/);
    assert.match(HOME_DATA_STATUS_COPY.emptyDescription, /상단 메뉴/);
  });
});
