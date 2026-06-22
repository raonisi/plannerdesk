import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import {
  HOME_FAVORITES_EMPTY_DESCRIPTION,
  HOME_RECENTS_EMPTY_DESCRIPTION,
  HOME_RECENTS_EMPTY_TITLE,
  HOME_RECENTS_FAVORITES_UNIFIED_NOTICE,
} from "@/lib/planner-favorites/copy";
import {
  HOME_FAVORITES_DISPLAY_LIMIT,
  HOME_RECENT_DISPLAY_LIMIT,
  PUBLIC_WORKSPACE_KINDS,
  RECENT_WORK_MAX_ITEMS,
  enrichRecentWorkItem,
  isAllowedRecentWorkItem,
  publicWorkspaceKindLabel,
  pushRecentWorkItem,
  readRecentWorkFromStorage,
  sanitizeRecentWorkItems,
  serializeRecentWorkForStorage,
  writeRecentWorkToStorage,
} from "@/lib/planner-favorites/recent-work";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import {
  buildHomePublicStats,
  resolveHomeLoadState,
} from "@/lib/dashboard/home-data-state";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicClaimLibrarySurface,
} from "@/lib/public/public-surface-resolvers";
import { MAIN_CONTENT_ID } from "@/components/skip-to-content";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("PR-UX-12 home recent favorites integration", () => {
  it("storage model accepts only allowed kinds and internal hrefs", () => {
    for (const kind of PUBLIC_WORKSPACE_KINDS) {
      const href =
        kind === "directory"
          ? "/directory"
          : kind === "claim-document"
            ? "/claim-documents"
            : kind === "disclosure-link"
              ? "/disclosure-links"
              : kind === "work-tool"
                ? "/work-tools?tool=planner-stats"
                : kind === "message-template"
                  ? "/message-templates"
                  : "/knowledge/sample-slug";
      assert.equal(
        isAllowedRecentWorkItem({
          id: "stable-id",
          label: "공개 제목",
          href,
          type: "shortcut",
          kind,
        }),
        true,
      );
    }

    assert.equal(
      isAllowedRecentWorkItem({
        id: "x",
        label: "외부",
        href: "https://evil.example",
        type: "shortcut",
      }),
      false,
    );

    assert.equal(
      isAllowedRecentWorkItem({
        id: "",
        label: "제목",
        href: "/directory",
        type: "insurer",
      }),
      false,
    );
  });

  it("rejects PII-like labels and prohibited storage values", () => {
    const prohibited = [
      { id: "1", label: "고객: 홍길동", href: "/directory", type: "insurer" },
      { id: "2", label: "주민번호 123456-1234567", href: "/work-tools", type: "tool" },
      { id: "3", label: "계약번호 12345", href: "/claim-documents", type: "doc" },
      { id: "4", label: "진단명 당뇨", href: "/knowledge", type: "knowledge" },
    ];
    for (const item of prohibited) {
      assert.equal(isAllowedRecentWorkItem(item), false);
    }
  });

  it("serializes version 1 storage and parses legacy rows", () => {
    const legacy = {
      id: "ins-1",
      label: "삼성화재",
      href: "/directory?search=삼성화재",
      type: "insurer",
    };
    const pushed = pushRecentWorkItem([], legacy);
    assert.equal(pushed.length, 1);
    assert.equal(pushed[0]?.kind, "directory");
    assert.equal(pushed[0]?.id, "ins-1");

    const serialized = writeRecentWorkToStorage(pushed);
    const parsed = JSON.parse(serialized) as unknown[];
    assert.equal((parsed[0] as { version: number }).version, 1);

    const roundTrip = readRecentWorkFromStorage(serialized);
    assert.equal(roundTrip[0]?.label, "삼성화재");

    const fromLegacyJson = readRecentWorkFromStorage(JSON.stringify([legacy]));
    assert.equal(fromLegacyJson[0]?.kind, "directory");
  });

  it("dedupes by kind+publicId, moves reuse to top, caps at six", () => {
    const base = {
      label: "업무 도구",
      href: "/work-tools?tool=planner-stats",
      type: "tool",
    };
    let items = pushRecentWorkItem([], { id: "planner-stats", ...base });
    items = pushRecentWorkItem(items, {
      id: "disease-search",
      label: "인수예외질환",
      href: "/work-tools?tool=disease-search",
      type: "tool",
    });
    items = pushRecentWorkItem(items, { id: "planner-stats", ...base });
    assert.equal(items.length, 2);
    assert.equal(items[0]?.id, "planner-stats");

    for (let index = 0; index < 8; index += 1) {
      items = pushRecentWorkItem(items, {
        id: `tool-${index}`,
        label: `도구 ${index}`,
        href: `/work-tools?tool=tool-${index}`,
        type: "tool",
      });
    }
    assert.equal(items.length, RECENT_WORK_MAX_ITEMS);
    assert.equal(RECENT_WORK_MAX_ITEMS, 6);

    const timestamps = items.map((item) => item.updatedAt);
    const sorted = [...timestamps].sort((a, b) => b - a);
    assert.deepEqual(timestamps, sorted);
  });

  it("ignores corrupted storage safely", () => {
    assert.deepEqual(readRecentWorkFromStorage("{not-json"), []);
    const sanitized = sanitizeRecentWorkItems([
      null,
      {
        version: 1,
        kind: "directory",
        publicId: "",
        title: "x",
        href: "/directory",
        updatedAt: 1,
      },
      { id: "ok", label: "삼성화재", href: "/directory", type: "insurer" },
    ]);
    assert.equal(sanitized.length, 1);
    assert.equal(sanitized[0]?.id, "ok");
    assert.equal(sanitized[0]?.kind, "directory");
  });

  it("home UI exposes empty states, kind labels, privacy notice, and aria labels", () => {
    const home = readSource("app/home-client.tsx");
    const copy = readSource("lib/planner-favorites/copy.ts");
    assert.match(home, /HOME_RECENTS_EMPTY_TITLE/);
    assert.match(home, /HOME_RECENTS_EMPTY_DESCRIPTION/);
    assert.match(home, /HOME_RECENTS_FAVORITES_UNIFIED_NOTICE/);
    assert.match(copy, new RegExp(escapeRegex(HOME_RECENTS_EMPTY_TITLE)));
    assert.match(copy, new RegExp(escapeRegex(HOME_RECENTS_FAVORITES_UNIFIED_NOTICE)));
    assert.match(home, /HOME_RECENT_DISPLAY_LIMIT/);
    assert.match(home, /publicWorkspaceKindLabel/);
    assert.match(home, /aria-label=\{`\$\{rec\.label\}/);

    const panel = readSource("components/dashboard/planner-work-favorites-panel.tsx");
    assert.match(panel, /HOME_FAVORITES_EMPTY_DESCRIPTION/);
    assert.match(copy, new RegExp(escapeRegex(HOME_FAVORITES_EMPTY_DESCRIPTION)));
    assert.match(panel, /HOME_FAVORITES_DISPLAY_LIMIT/);
    assert.match(panel, /즐겨찾기에서 제거/);
    assert.match(panel, /aria-pressed=\{true\}/);
    assert.match(panel, /messageTemplates/);
  });

  it("records recent visits from work tools and knowledge pages", () => {
    const workTools = readSource("app/work-tools/work-tools-client.tsx");
    assert.match(workTools, /recordRecentWorkVisit/);

    const knowledge = readSource("app/knowledge/knowledge-archive-list.tsx");
    assert.match(knowledge, /recordRecentWorkVisit/);
  });

  it("uses documented localStorage keys without server persistence", () => {
    assert.equal(PLANNER_FAVORITE_STORAGE_KEYS.homeRecents, "plannerdesk.home.recents");
    assert.equal(
      PLANNER_FAVORITE_STORAGE_KEYS.messageTemplates,
      "plannerdesk.messages.favorites",
    );

    const client = readSource("lib/planner-favorites/recent-work-client.ts");
    assert.doesNotMatch(client, /fetch\(/);
  });

  it("preserves home count SSOT and claim library 220 regression", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const overlay = {};
    const items = buildClaimLibraryItems(guides, overlay);
    const surface = resolveVisiblePublicClaimLibrarySurface(
      { status: "ok", data: [] },
      overlay,
    );

    assert.equal(items.length, 220);
    assert.equal(surface.libraryItemCount, 220);
    assert.equal(countPublicClaimLibraryItems(guides, overlay), 220);

    const stats = buildHomePublicStats({
      fetch: {
        insurers: "ok",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 10,
      claimDocumentCount: 220,
      disclosureLinkCount: 5,
      messageTemplateCount: 41,
      workToolCount: 8,
      knowledgeArticleCount: 12,
    });
    assert.equal(stats.claimDocuments.kind, "count");
    if (stats.claimDocuments.kind === "count") {
      assert.equal(stats.claimDocuments.value, 220);
    }
    assert.equal(stats.workTools.kind, "count");
    if (stats.workTools.kind === "count") {
      assert.equal(stats.workTools.value, 8);
    }

    const loadState = resolveHomeLoadState({
      fetch: {
        insurers: "ok",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 10,
      claimDocumentCount: 220,
      disclosureLinkCount: 5,
      messageTemplateCount: 41,
      workToolCount: 8,
      knowledgeArticleCount: 12,
    });
    assert.equal(loadState, "success");
  });

  it("keeps PR-UX-11 skip link and main-content regression", () => {
    const home = readSource("app/page.tsx");
    assert.match(home, /AppShell/);
    assert.equal(MAIN_CONTENT_ID, "main-content");
  });

  it("public workspace kind labels cover all stored kinds", () => {
    for (const kind of PUBLIC_WORKSPACE_KINDS) {
      assert.match(publicWorkspaceKindLabel(kind), /\S/);
    }
    assert.equal(HOME_RECENT_DISPLAY_LIMIT, 4);
    assert.equal(HOME_FAVORITES_DISPLAY_LIMIT, 8);
  });

  it("serializeRecentWorkForStorage stores only public shortcut fields", () => {
    const item = enrichRecentWorkItem({
      id: "planner-stats",
      label: "통계실",
      href: "/work-tools?tool=planner-stats",
      type: "tool",
    });
    const stored = serializeRecentWorkForStorage([item])[0];
    assert.deepEqual(Object.keys(stored ?? {}).sort(), [
      "href",
      "kind",
      "publicId",
      "title",
      "updatedAt",
      "version",
    ]);
  });
});
