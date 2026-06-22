import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import {
  COPY_FAILURE_MESSAGE,
  isCopyableText,
  performCopyAction,
  resolveCopySuccessMessage,
} from "@/lib/public/copy-action";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicClaimLibrarySurface,
} from "@/lib/public/public-surface-resolvers";
import { MAIN_CONTENT_ID } from "@/components/skip-to-content";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-UX-14 copy UX unification", () => {
  it("copy utility rejects empty and whitespace-only text", async () => {
    assert.equal(isCopyableText(""), false);
    assert.equal(isCopyableText("   "), false);
    assert.equal(isCopyableText("안내 문구"), true);

    const empty = await performCopyAction({ text: "  " });
    assert.equal(empty.ok, false);
    assert.equal(empty.userMessage, COPY_FAILURE_MESSAGE);
  });

  it("returns source-specific success messages and safe failure copy", () => {
    assert.equal(
      resolveCopySuccessMessage("message-template"),
      "안전 문구를 복사했습니다.",
    );
    assert.equal(
      resolveCopySuccessMessage("claim-guide"),
      "안내 문구를 복사했습니다.",
    );
    assert.equal(
      resolveCopySuccessMessage("directory"),
      "연락 안내를 복사했습니다.",
    );
    assert.match(COPY_FAILURE_MESSAGE, /직접 선택해 복사/);
  });

  it("performCopyAction does not persist text to storage or network", async () => {
    const util = readSource("lib/public/copy-action.ts");
    const hook = readSource("hooks/useCopyFeedback.ts");
    assert.doesNotMatch(util, /localStorage/);
    assert.doesNotMatch(util, /fetch\(/);
    assert.doesNotMatch(hook, /localStorage/);
    assert.doesNotMatch(hook, /fetch\(/);
  });

  it("message templates copy safeCopy with unified feedback", () => {
    const library = readSource("app/message-templates/message-template-library.tsx");
    assert.match(library, /applySafeCopyPlaceholders/);
    assert.match(library, /template\.safeCopy/);
    assert.match(library, /useCopyFeedback/);
    assert.match(library, /CopyActionButton/);
    assert.match(library, /source: "message-template"/);
    assert.match(library, /안전 문구 복사/);
    assert.doesNotMatch(library, /async function copyTextToClipboard/);
  });

  it("claim documents use shared copy feedback and guide labels", () => {
    const item = readSource("components/claim-documents/claim-form-list-item.tsx");
    const group = readSource("app/claim-documents/insurer-claim-group.tsx");
    assert.match(item, /useCopyFeedback/);
    assert.match(item, /CopyToast/);
    assert.match(item, /source: "claim-guide"/);
    assert.match(item, /안내 문구 복사/);
    assert.match(group, /useCopyFeedback/);
    assert.match(group, /안내 문구 복사/);
    assert.doesNotMatch(item, /async function copyTextToClipboard/);
    assert.doesNotMatch(group, /async function copyTextToClipboard/);
  });

  it("CopyToast exposes status and alert roles for screen readers", () => {
    const toast = readSource("components/ui/copy-toast.tsx");
    assert.match(toast, /role=\{isFailure \? "alert" : "status"\}/);
    assert.match(toast, /aria-live=\{isFailure \? "assertive" : "polite"\}/);
  });

  it("CopyActionButton keeps visible labels, busy state, and focus ref", () => {
    const button = readSource("components/ui/copy-action-button.tsx");
    assert.match(button, /복사 중…/);
    assert.match(button, /aria-busy/);
    assert.match(button, /buttonRef\.current\?\.focus/);
    assert.match(button, /aria-label/);
  });

  it("directory mail address copy uses directory source", () => {
    const card = readSource("components/directory/insurer-action-card.tsx");
    assert.match(card, /source: "directory"/);
    assert.match(card, /연락 안내 복사/);
    assert.doesNotMatch(card, /navigator\.clipboard\.writeText/);
  });

  it("preserves claim library 220 count and PR-UX-11 main landmark", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const overlay = {};
    const surface = resolveVisiblePublicClaimLibrarySurface(
      { status: "ok", data: [] },
      overlay,
    );
    assert.equal(buildClaimLibraryItems(guides, overlay).length, 220);
    assert.equal(surface.libraryItemCount, 220);
    assert.equal(countPublicClaimLibraryItems(guides, overlay), 220);
    assert.equal(MAIN_CONTENT_ID, "main-content");
  });

  it("does not alter recent-work or favorites storage modules", () => {
    const recent = readSource("lib/planner-favorites/recent-work.ts");
    assert.doesNotMatch(recent, /copyTextToClipboard/);
    assert.equal(
      readSource("lib/planner-favorites/storage-keys.ts").includes("homeRecents"),
      true,
    );
  });
});
