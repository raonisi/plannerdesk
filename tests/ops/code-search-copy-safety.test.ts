import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CODE_SEARCH_ALLOWED_NOTICES,
  CODE_SEARCH_FORBIDDEN_INPUT_HINTS,
  CODE_SEARCH_FORBIDDEN_PHRASES,
  CODE_SEARCH_FORBIDDEN_UI_PHRASES,
  containsForbiddenCodeSearchInputHint,
  containsForbiddenCodeSearchPhrase,
} from "@/lib/work-tools/code-search-safety";

const ROOT = process.cwd();
const CLIENT = join(ROOT, "app/work-tools/work-tools-client.tsx");

function extractCodeSearchPanels(source: string): string {
  const markers = [
    "function DiseaseSearchTool",
    "function SurgeryCodeSearchTool",
    "function DiseaseCodeSearchTool",
  ] as const;
  const chunks: string[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = source.indexOf(markers[i]!);
    const end =
      i + 1 < markers.length
        ? source.indexOf(markers[i + 1]!)
        : source.indexOf("function SilbiCalculatorTool");
    if (start >= 0) {
      chunks.push(source.slice(start, end > start ? end : undefined));
    }
  }
  return chunks.join("\n");
}

describe("PR-BS-18 code search copy safety", () => {
  it("detects forbidden code search certainty phrases", () => {
    for (const phrase of CODE_SEARCH_FORBIDDEN_PHRASES) {
      assert.equal(containsForbiddenCodeSearchPhrase(phrase), true);
    }
    assert.equal(
      containsForbiddenCodeSearchPhrase(CODE_SEARCH_ALLOWED_NOTICES[0]!),
      false,
    );
  });

  it("detects forbidden sensitive input hints", () => {
    for (const hint of CODE_SEARCH_FORBIDDEN_INPUT_HINTS) {
      assert.equal(containsForbiddenCodeSearchInputHint(`예: ${hint} 입력`), true);
    }
  });

  it("code search panels avoid forbidden affirmative phrases", () => {
    const client = readFileSync(CLIENT, "utf8");
    const panels = extractCodeSearchPanels(client);
    assert.ok(panels.length > 500);
    for (const phrase of CODE_SEARCH_FORBIDDEN_UI_PHRASES) {
      assert.doesNotMatch(
        panels,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden: ${phrase}`,
      );
    }
    assert.equal(containsForbiddenCodeSearchPhrase("보험금 지급 가능합니다"), true);
    assert.equal(
      containsForbiddenCodeSearchPhrase("보험금 지급·청구 가능 여부는 확정하지 않습니다"),
      false,
    );
  });

  it("work-tools client does not solicit diagnosis or consultation raw text", () => {
    const client = readFileSync(CLIENT, "utf8");
    const inputBlock = client.slice(
      client.indexOf("function DiseaseCodeSearchTool"),
      client.indexOf("function SurgeryCodeSearchTool"),
    );
    for (const hint of [
      "진단서를 붙여넣",
      "상담 내용을 입력",
      "병력을 입력",
      "주민번호",
      "계약번호",
      "보험증권",
    ]) {
      assert.doesNotMatch(inputBlock, new RegExp(hint));
    }
  });

  it("code search panels include official policy and non-judgment notices", () => {
    const client = readFileSync(CLIENT, "utf8");
    assert.match(client, /보험금 지급·청구 가능 여부는 확정하지 않습니다/);
    assert.match(client, /공식 약관과 보험사 심사 기준/);
    assert.match(client, /관련 표준 담보 참고/);
    assert.match(client, /단순 참고용/);
  });

  it("does not label archive proxy as official source in API routes", () => {
    for (const route of [
      "app/api/work-tools/disease-codes/route.ts",
      "app/api/work-tools/surgery-codes/route.ts",
    ]) {
      const src = readFileSync(join(ROOT, route), "utf8");
      assert.match(src, /bohumschool-archive/);
      assert.doesNotMatch(src, /officialSource|공식 출처/i);
    }
  });
});
