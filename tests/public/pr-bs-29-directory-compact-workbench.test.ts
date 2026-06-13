import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DIRECTORY_CORRECTION_SECTION_TITLE,
} from "@/lib/directory/directory-workbench-copy";
import {
  VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES,
} from "@/lib/work-links/verified-copy";

const ROOT = process.cwd();

describe("PR-BS-29 directory compact workbench list", () => {
  it("keeps compact list as optional view with workbench rows", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const ui = readFileSync(
      join(ROOT, "lib/directory/insurer-workbench-ui.ts"),
      "utf8",
    );

    assert.match(explorer, /useState<ViewMode>\("grid"\)/);
    assert.match(explorer, /InsurerCompactWorkbenchRow/);
    assert.match(explorer, /InsurerActionCard/);
    assert.match(explorer, /viewMode === "list"/);
    assert.match(row, /insurerWorkbenchRowShell/);
    assert.match(ui, /min-h-11/);
    assert.match(row, /InsurerCardDeskActions/);
  });

  it("keeps PDF list collapsed on the default row surface", () => {
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const desk = readFileSync(
      join(ROOT, "components/directory/insurer-card-desk-actions.tsx"),
      "utf8",
    );
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );

    assert.match(row, /InsurerCardDeskActions/);
    assert.match(desk, /hideToggle/);
    assert.doesNotMatch(row, /ClaimFormListItem/);
    assert.match(section, /hideToggle/);
    assert.match(section, /ClaimFormListItem/);
  });

  it("opens PDF download links only after claim panel interaction", () => {
    const desk = readFileSync(
      join(ROOT, "components/directory/insurer-card-desk-actions.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );

    assert.match(desk, /claimOpen/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /download=\{item\.fileName\}/);
    assert.match(listItem, /바로 열기/);
  });

  it("avoids mock and admin review wording on directory surfaces", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const actionCard = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );

    for (const phrase of VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES) {
      assert.doesNotMatch(explorer, new RegExp(phrase));
      assert.doesNotMatch(row, new RegExp(phrase));
    }

    assert.doesNotMatch(explorer, /adminMemo/);
    assert.doesNotMatch(explorer, /changeReason/);
    assert.doesNotMatch(actionCard, /adminMemo/);
    assert.equal(DIRECTORY_CORRECTION_SECTION_TITLE, "정보 수정 요청");
    assert.match(explorer, /DIRECTORY_CORRECTION_SECTION_TITLE/);
  });

  it("keeps claim-documents and admin governance routes intact", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const adminActions = readFileSync(
      join(ROOT, "app/admin/claim-documents/governance/actions.ts"),
      "utf8",
    );

    assert.match(explorer, /getClaimItemsForInsurer/);
    assert.match(row, /InsurerCardDeskActions/);
    assert.match(adminActions, /saveClaimDocumentGovernance/);
  });
});
