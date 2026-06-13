import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DIRECTORY_CORRECTION_SECTION_TITLE,
  DIRECTORY_WORKBENCH_GLOBAL_NOTICE,
} from "@/lib/directory/directory-workbench-copy";
import {
  VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES,
} from "@/lib/work-links/verified-copy";

const ROOT = process.cwd();

describe("PR-BS-29 directory compact workbench list", () => {
  it("defaults directory explorer to compact list with workbench rows", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );

    assert.match(explorer, /useState<ViewMode>\("list"\)/);
    assert.match(explorer, /InsurerCompactWorkbenchRow/);
    assert.doesNotMatch(explorer, /InsurerActionCard/);
    assert.match(explorer, /DIRECTORY_WORKBENCH_GLOBAL_NOTICE/);
    assert.match(row, /insurerWorkbenchRowShell/);
    assert.match(row, /PDF \{pdfCount\}/);
  });

  it("keeps PDF list collapsed on the default row surface", () => {
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );

    assert.match(row, /pdfPanelOpen/);
    assert.match(row, /hideToggle/);
    assert.doesNotMatch(row, /ClaimFormListItem/);
    assert.match(section, /hideToggle/);
    assert.match(section, /ClaimFormListItem/);
  });

  it("opens PDF download links only after PDF panel interaction", () => {
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );

    assert.match(row, /setPdfPanelOpen/);
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
    assert.equal(DIRECTORY_WORKBENCH_GLOBAL_NOTICE.length > 0, true);
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
    assert.match(row, /\/claim-documents\?insurer=/);
    assert.match(adminActions, /saveClaimDocumentGovernance/);
  });
});
