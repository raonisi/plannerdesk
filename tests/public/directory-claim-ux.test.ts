import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("Directory / claim documents UX (PR112, static)", () => {
  it("directory supports insurer deep-link query param", () => {
    const source = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    assert.match(source, /searchParams\.get\("insurer"\)/);
    assert.match(source, /\/claim-documents\?insurer=/);
  });

  it("insurer card exposes quick claim actions inside the claim panel", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const desk = readFileSync(
      join(ROOT, "components/directory/insurer-card-desk-actions.tsx"),
      "utf8",
    );
    const quick = readFileSync(
      join(ROOT, "components/directory/insurer-quick-claim-actions.tsx"),
      "utf8",
    );
    assert.match(card, /InsurerCardDeskActions/);
    assert.match(desk, /InsurerQuickClaimActions/);
    assert.match(quick, /WORK_LINK_ACTION_LABELS\.claimGuide/);
    assert.match(quick, /WORK_LINK_ACTION_LABELS\.claimDocuments/);
  });

  it("claim explorer links back to directory by insurer id", () => {
    const explorer = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    const group = readFileSync(
      join(ROOT, "app/claim-documents/insurer-claim-group.tsx"),
      "utf8",
    );
    assert.match(explorer, /\/directory\?insurer=/);
    assert.match(group, /directoryInsurerId/);
    assert.match(group, /청구안내 보기/);
  });

  it("public claim filters do not expose draft status option", () => {
    const filters = readFileSync(
      join(ROOT, "app/claim-documents/claim-forms-filters.tsx"),
      "utf8",
    );
    assert.doesNotMatch(filters, /VerificationStatus\.draft/);
    assert.match(filters, /공식 확인 완료/);
    assert.match(filters, /확인 진행 중/);
  });

  it("public claim list avoids admin-style verification badges", () => {
    const item = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.doesNotMatch(item, /StatusBadge/);
    assert.match(item, /publicClaimTrustHint/);
  });

  it("public fetch visibility guards remain unchanged", () => {
    const insurers = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    const claims = readFileSync(
      join(ROOT, "lib/public/claim-documents.ts"),
      "utf8",
    );
    assert.match(insurers, /isPublished:\s*true/);
    assert.match(claims, /isPublished:\s*true/);
    assert.match(insurers, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(claims, /PUBLIC_VERIFICATION_STATUSES/);
  });

  it("group-by-insurer resolves directoryInsurerId from guide rows", () => {
    const source = readFileSync(
      join(ROOT, "lib/claim-documents/group-by-insurer.ts"),
      "utf8",
    );
    assert.match(source, /directoryInsurerId/);
    assert.match(source, /resolveDirectoryInsurerId/);
    assert.match(source, /item\.document\.insurerId/);
  });
});
