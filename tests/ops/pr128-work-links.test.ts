import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  WORK_LINK_ACTION_LABELS,
  WORK_LINK_COPY,
  WORK_LINK_GROUP_LABELS,
  plannerSystemAccessNote,
  resolveSystemLinks,
} from "@/lib/directory/work-links";
import { isInsurerPubliclyVisible } from "@/lib/public/insurers";
import { VerificationStatus } from "@prisma/client";

const ROOT = process.cwd();

const FORBIDDEN_LINK_PHRASES = [
  "무조건",
  "100% 정확",
  "최신 링크 확정",
  "검수 없이 공개",
  "보험금 바로",
];

describe("PR128 work links ops (static, no database)", () => {
  it("hub doc links structure and no secrets", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-128-WORK-LINKS-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-128-WORK-LINK-TYPES-AND-STATUS/);
    assert.match(hub, /미접근/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("work link labels avoid forbidden claim phrases", () => {
    const text = Object.values(WORK_LINK_ACTION_LABELS).join(" ");
    for (const phrase of FORBIDDEN_LINK_PHRASES) {
      assert.doesNotMatch(text, new RegExp(phrase));
    }
  });

  it("planner system access note appears for login-style URLs", () => {
    assert.match(
      plannerSystemAccessNote("https://sales.heungkukfire.co.kr/#/login") ?? "",
      /접근 권한/,
    );
    assert.equal(plannerSystemAccessNote("https://www.samsungfire.com/"), null);
  });

  it("resolveSystemLinks prefers systemUrl over planner portal", () => {
    const links = resolveSystemLinks({
      systemUrl: "https://erp.example.com/",
      plannerPortalUrl: "https://portal.example.com/",
    } as Parameters<typeof resolveSystemLinks>[0]);
    assert.equal(links.primary, "https://erp.example.com/");
    assert.equal(links.secondary, "https://portal.example.com/");
  });

  it("insurer card uses grouped work link components and labels", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const primary = readFileSync(
      join(ROOT, "components/directory/insurer-primary-work-links.tsx"),
      "utf8",
    );
    const labels = readFileSync(join(ROOT, "lib/directory/work-links.ts"), "utf8");
    assert.match(card, /InsurerPrimaryWorkLinks/);
    assert.match(card, /WORK_LINK_GROUP_LABELS\.claim/);
    assert.match(primary, /WORK_LINK_ACTION_LABELS\.system/);
    assert.match(primary, /WORK_LINK_ACTION_LABELS\.homepage/);
    assert.match(labels, /전산 바로가기/);
    assert.match(labels, /공식 홈페이지/);
    assert.doesNotMatch(card, /전산 접속/);
    assert.doesNotMatch(card, /verificationStatusLabel/);
  });

  it("quick claim actions use shared action labels", () => {
    const quick = readFileSync(
      join(ROOT, "components/directory/insurer-quick-claim-actions.tsx"),
      "utf8",
    );
    const labels = readFileSync(join(ROOT, "lib/directory/work-links.ts"), "utf8");
    assert.match(quick, /WORK_LINK_ACTION_LABELS\.claimGuide/);
    assert.match(labels, /청구안내 보기/);
  });

  it("public insurer visibility guard unchanged for draft", () => {
    assert.equal(
      isInsurerPubliclyVisible({
        isPublished: true,
        verificationStatus: VerificationStatus.draft,
      }),
      false,
    );
    assert.equal(
      isInsurerPubliclyVisible({
        isPublished: false,
        verificationStatus: VerificationStatus.verified,
      }),
      false,
    );
  });

  it("public insurers fetch file not weakened in PR128", () => {
    const insurers = readFileSync(
      join(ROOT, "lib/public/insurers.ts"),
      "utf8",
    );
    assert.match(insurers, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(insurers, /isInsurerPubliclyVisible/);
    assert.doesNotMatch(insurers, /PR-128 bypass/i);
  });

  it("work link copy uses neutral missing state", () => {
    assert.match(WORK_LINK_COPY.missing, /공식 확인/);
    assert.match(WORK_LINK_GROUP_LABELS.system, /전산/);
  });
});
