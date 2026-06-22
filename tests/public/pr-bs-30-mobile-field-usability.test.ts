import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  MOBILE_FAVORITES_NOTICE_SHORT,
  MOBILE_TOUCH_MIN_HEIGHT,
} from "@/lib/mobile/field-usability";
import {
  VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES,
} from "@/lib/work-links/verified-copy";

const ROOT = process.cwd();

describe("PR-BS-30 mobile field usability polish", () => {
  it("directory workbench rows use 44px touch targets and panel close controls", () => {
    const row = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    const ui = readFileSync(
      join(ROOT, "lib/directory/insurer-workbench-ui.ts"),
      "utf8",
    );
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );

    assert.match(ui, /min-h-11/);
    assert.match(ui, /min-h-12 w-full/);
    assert.match(row, /WorkbenchPanelHeader/);
    assert.match(row, /닫기/);
    assert.match(row, /InsurerCardDeskActions/);
    assert.match(explorer, /MOBILE_FAVORITES_NOTICE_SHORT/);
    assert.equal(MOBILE_TOUCH_MIN_HEIGHT, "min-h-11");
  });

  it("claim-documents keeps PDF actions and collapsible mobile notice", () => {
    const explorer = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );

    assert.match(explorer, /CollapsibleNotice/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /PUBLIC_CTA_PDF_OPEN/);
    assert.match(listItem, /mobileCardTitle|break-words/);
  });

  it("admin claim documents keeps mobile card list and pagination patterns", () => {
    const adminList = readFileSync(
      join(ROOT, "app/admin/claim-documents/claim-documents-admin-list.tsx"),
      "utf8",
    );
    const pagination = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-pagination.tsx",
      ),
      "utf8",
    );

    assert.match(adminList, /md:hidden/);
    assert.match(adminList, /MOBILE_ADMIN_ACTION/);
    assert.match(pagination, /min-h-\[44px\]|min-h-11/);
  });

  it("message templates and work-tools keep copy/external actions with touch targets", () => {
    const templates = readFileSync(
      join(ROOT, "app/message-templates/message-template-library.tsx"),
      "utf8",
    );
    const workTools = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );

    assert.match(templates, /PUBLIC_CTA_COPY_SAFE/);
    assert.match(templates, /min-h-11 min-w-11/);
    assert.match(workTools, /touchTargets\.paginationButton/);
    assert.match(workTools, /ExternalLink/);
  });

  it("public surfaces avoid admin wording and horizontal overflow guard exists", () => {
    const frame = readFileSync(
      join(ROOT, "components/content-page.tsx"),
      "utf8",
    );
    const directory = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );

    assert.match(frame, /overflow-x-hidden/);
    for (const phrase of VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES.slice(0, 2)) {
      assert.doesNotMatch(directory, new RegExp(phrase));
    }
    assert.doesNotMatch(directory, /adminMemo/);
    assert.equal(MOBILE_FAVORITES_NOTICE_SHORT.length > 0, true);
  });
});
