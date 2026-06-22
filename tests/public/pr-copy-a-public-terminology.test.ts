import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PUBLIC_SURFACE_FORBIDDEN_UI_PHRASES,
  PUBLIC_SURFACE_ROUTE_FILES,
  stripPublicCopyScanNoise,
} from "@/lib/public/public-copy-guard";

const ROOT = process.cwd();

function readRouteSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-COPY-A public internal terminology cleanup", () => {
  it("public route sources avoid forbidden internal UI phrases", () => {
    for (const rel of PUBLIC_SURFACE_ROUTE_FILES) {
      const source = stripPublicCopyScanNoise(readRouteSource(rel));
      const withoutForbiddenList = source.replace(
        /PUBLIC_SURFACE_FORBIDDEN_UI_PHRASES[\s\S]*?\] as const;/,
        "",
      );
      for (const phrase of PUBLIC_SURFACE_FORBIDDEN_UI_PHRASES) {
        assert.doesNotMatch(
          withoutForbiddenList,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${rel}: ${phrase}`,
        );
      }
    }
  });

  it("message-templates keeps copy action wiring", () => {
    const library = readRouteSource("app/message-templates/message-template-library.tsx");
    assert.match(library, /CopyActionButton/);
    assert.match(library, /copyWithFeedback/);
    assert.match(library, /CopyToast/);
    assert.match(library, /안전 문구 복사/);
    assert.match(library, /template\.safeCopy/);
  });

  it("work-tools keeps external link panels", () => {
    const client = readRouteSource("app/work-tools/work-tools-client.tsx");
    assert.match(client, /ExternalTool/);
    assert.match(client, /공식 사이트 열기/);
    assert.match(client, /rel="noopener noreferrer"/);
  });

  it("directory keeps system portal and PDF actions", () => {
    const systemCta = readRouteSource(
      "components/directory/insurer-system-portal-primary-cta.tsx",
    );
    const claimSection = readRouteSource(
      "components/directory/insurer-card-claim-documents-section.tsx",
    );
    const claimItem = readRouteSource("components/claim-documents/claim-form-list-item.tsx");
    assert.match(systemCta, /insurerWorkbenchSystemPrimaryCta/);
    assert.match(systemCta, /전산 바로가기/);
    assert.match(claimSection, /PDF 다운로드/);
    assert.match(claimItem, /PDF 바로 열기/);
  });

  it("claim-documents keeps PDF download on public explorer", () => {
    const item = readRouteSource("components/claim-documents/claim-form-list-item.tsx");
    assert.match(item, /PDF 다운로드/);
    assert.match(item, /PDF 바로 열기/);
  });

  it("admin claim-documents routes are excluded from public scan list", () => {
    for (const rel of PUBLIC_SURFACE_ROUTE_FILES) {
      assert.doesNotMatch(rel, /^app\/admin\//);
    }
  });
});
