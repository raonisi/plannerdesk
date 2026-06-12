import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-12 correction public visibility (static)", () => {
  it("public surfaces do not link to admin correction inbox", () => {
    const targets = [
      "app/page.tsx",
      "app/home-client.tsx",
      "app/directory/page.tsx",
      "app/search/page.tsx",
      "app/claim-documents/page.tsx",
    ];
    for (const rel of targets) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(source, /\/admin\/corrections/);
    }
  });

  it("correction dialog does not expose admin memo or internal status fields", () => {
    const dialog = readFileSync(
      join(ROOT, "components/directory/correction-request-dialog.tsx"),
      "utf8",
    );
    assert.doesNotMatch(dialog, /adminMemo|reviewNote|privateMemo|internalStatus/i);
    assert.doesNotMatch(dialog, /verificationStatus|reviewStatus/);
  });

  it("correction submit action does not log raw message content", () => {
    const actions = readFileSync(
      join(ROOT, "app/correction-requests/actions.ts"),
      "utf8",
    );
    assert.doesNotMatch(actions, /console\.log\(.*message/i);
    assert.doesNotMatch(actions, /console\.error\(.*message/i);
  });

  it("admin correction detail stays under admin route only", () => {
    const adminPage = readFileSync(
      join(ROOT, "app/admin/corrections/page.tsx"),
      "utf8",
    );
    assert.match(adminPage, /getCorrectionAdminAccess|AdminAccessDeniedState/);
    const publicDir = readFileSync(join(ROOT, "app/directory/page.tsx"), "utf8");
    assert.doesNotMatch(publicDir, /correctionRequest\.findMany|prisma\.correctionRequest/i);
  });
});
