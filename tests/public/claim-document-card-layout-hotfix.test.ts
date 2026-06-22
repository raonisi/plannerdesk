import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("hotfix claim document card fixed layout", () => {
  it("locks card variant to title-first vertical layout", () => {
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    const cardBlock = listItem.slice(
      listItem.indexOf('if (variant === "card")'),
      listItem.indexOf('if (variant === "card")') + 1200,
    );

    assert.match(listItem, /insurerCardClaimDocumentTitle/);
    assert.match(listItem, /insurerCardClaimDocumentActions/);
    assert.match(listItem, /insurerCardClaimDocumentCard/);
    assert.doesNotMatch(cardBlock, /sm:flex-row/);
    assert.doesNotMatch(cardBlock, /sm:items-center/);
    assert.doesNotMatch(cardBlock, /sm:justify-between/);
    assert.match(listItem, /renderPdfAssetActions/);
    assert.match(listItem, /publicAssetView/);
    assert.match(listItem, /official_external/);
  });

  it("stabilizes claim panel list wrappers", () => {
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );
    assert.match(section, /min-w-0 w-full space-y-3/);
    assert.match(section, /ul className="min-w-0 w-full space-y-3"/);
  });
});
