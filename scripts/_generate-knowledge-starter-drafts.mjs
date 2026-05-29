/**
 * One-off generator: docs/KNOWLEDGE_STARTER_ARTICLES_30.md -> lib/content/knowledge-starter-drafts.ts
 * Not committed; run manually when starter markdown changes.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mdPath = path.join(root, "docs", "KNOWLEDGE_STARTER_ARTICLES_30.md");
const outPath = path.join(root, "lib", "content", "knowledge-starter-drafts.ts");

const md = fs.readFileSync(mdPath, "utf8");
const sections = md.split(/\n### \d+\. /).slice(1);

function parseTableField(block, key) {
  const re = new RegExp(`\\| ${key} \\| ([^|]+) \\|`, "m");
  const m = block.match(re);
  if (!m) return null;
  let v = m[1].trim();
  if (v.startsWith("`") && v.endsWith("`")) v = v.slice(1, -1);
  if (v === "*(empty)*" || v === "*(per-insurer — use /disclosure-links)*") return null;
  return v;
}

function parseTags(block) {
  const raw = parseTableField(block, "tags");
  if (!raw) return [];
  return raw.split(/,\s*/).map((t) => t.trim()).filter(Boolean);
}

function parseSectionBody(block, label) {
  const marker = `**${label}**`;
  const start = block.indexOf(marker);
  if (start === -1) return "";
  let rest = block.slice(start + marker.length);
  const nextLabels = [
    "**content**",
    "**safeCopy**",
    "**forbiddenClaims**",
    "\n---",
    "\n## ",
  ];
  let end = rest.length;
  for (const nl of nextLabels) {
    if (nl === marker) continue;
    const idx = rest.indexOf(nl);
    if (idx !== -1 && idx < end) end = idx;
  }
  return rest.slice(0, end).trim();
}

function parseForbidden(block) {
  const body = parseSectionBody(block, "forbiddenClaims");
  return body
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line.length > 0 && line !== "--" && !line.startsWith("---"));
}

function escapeTemplate(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const drafts = sections.map((section) => {
  const titleLine = section.split("\n")[0].trim();
  const title = parseTableField(section, "title") ?? titleLine;
  const slug = parseTableField(section, "slug");
  const summary = parseTableField(section, "summary");
  const category = parseTableField(section, "category");
  const type = parseTableField(section, "type");
  const riskLevel = parseTableField(section, "riskLevel");
  const sourceType = parseTableField(section, "sourceType");
  const sourceTitle = parseTableField(section, "sourceTitle");
  const sourceUrl = parseTableField(section, "sourceUrl");
  const workflowLabel = parseTableField(section, "workflowLabel");
  const content = parseSectionBody(section, "content");
  const safeCopy = parseSectionBody(section, "safeCopy");
  const forbiddenClaims = parseForbidden(section);
  const tags = parseTags(section);

  return {
    title,
    slug,
    summary,
    category,
    type,
    riskLevel,
    sourceType,
    sourceTitle,
    sourceUrl,
    workflowLabel,
    tags,
    content,
    safeCopy,
    forbiddenClaims,
  };
});

if (drafts.length !== 30) {
  throw new Error(`Expected 30 drafts, got ${drafts.length}`);
}

const header = `// Starter knowledge drafts for admin import (PR-KNOW-IMPORT-01).
// Not auto-published; import script forces draft + isPublished=false + aiUsable=false.

import type {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
} from "@prisma/client";

export interface KnowledgeStarterDraft {
  title: string;
  slug: string;
  summary: string;
  category: KnowledgeArticleCategory;
  type: KnowledgeArticleType;
  riskLevel: KnowledgeRiskLevel;
  status: KnowledgeArticleStatus;
  isPublished: boolean;
  aiUsable: boolean;
  sourceType: KnowledgeSourceType;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceCheckedAt: string | null;
  workflowLabel: string | null;
  tags: string[];
  content: string;
  safeCopy: string;
  forbiddenClaims: string[];
}

const DRAFT_DEFAULTS = {
  status: "draft" as const,
  isPublished: false,
  aiUsable: false,
  sourceCheckedAt: null,
};

`;

function emitDraft(d) {
  const tags = JSON.stringify(d.tags);
  const forbidden = JSON.stringify(d.forbiddenClaims);
  return `  {
    ...DRAFT_DEFAULTS,
    title: ${JSON.stringify(d.title)},
    slug: ${JSON.stringify(d.slug)},
    summary: ${JSON.stringify(d.summary)},
    category: ${JSON.stringify(d.category)},
    type: ${JSON.stringify(d.type)},
    riskLevel: ${JSON.stringify(d.riskLevel)},
    sourceType: ${JSON.stringify(d.sourceType)},
    sourceTitle: ${d.sourceTitle ? JSON.stringify(d.sourceTitle) : "null"},
    sourceUrl: ${d.sourceUrl ? JSON.stringify(d.sourceUrl) : "null"},
    workflowLabel: ${d.workflowLabel ? JSON.stringify(d.workflowLabel) : "null"},
    tags: ${tags},
    content: \`${escapeTemplate(d.content)}\`,
    safeCopy: \`${escapeTemplate(d.safeCopy)}\`,
    forbiddenClaims: ${forbidden},
  }`;
}

const body =
  header +
  `export const knowledgeStarterDrafts: KnowledgeStarterDraft[] = [\n` +
  drafts.map(emitDraft).join(",\n") +
  "\n];\n";

fs.writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${drafts.length} drafts to ${outPath}`);
