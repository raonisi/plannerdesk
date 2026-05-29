/**
 * Import starter knowledge drafts into KnowledgeArticle (draft only).
 * Default: dry-run (no DB writes). Use --apply to insert.
 */
import { PrismaClient } from "@prisma/client";
import { knowledgeStarterDrafts } from "../lib/content/knowledge-starter-drafts";
import { isValidSlug } from "../lib/validators/knowledge-article";

const prisma = new PrismaClient();

const REQUIRED_FIELDS = [
  "title",
  "slug",
  "summary",
  "category",
  "type",
  "riskLevel",
  "content",
  "safeCopy",
  "forbiddenClaims",
] as const;

const FORCED_STATUS = "draft" as const;
const FORCED_PUBLISHED = false;
const FORCED_AI_USABLE = false;

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.RAILWAY_ENVIRONMENT === "production" ||
    process.env.RAILWAY_ENVIRONMENT_NAME === "production"
  );
}

function parseArgs(argv: string[]) {
  return {
    apply: argv.includes("--apply"),
    allowProduction: argv.includes("--allow-production-draft-import"),
  };
}

type ValidationIssue = {
  slug: string;
  reason: string;
};

function validateDraft(
  draft: (typeof knowledgeStarterDrafts)[number],
): ValidationIssue | null {
  for (const field of REQUIRED_FIELDS) {
    const value = draft[field];
    if (field === "forbiddenClaims") {
      if (!Array.isArray(value) || value.length < 3) {
        return {
          slug: draft.slug || "(missing slug)",
          reason: "forbiddenClaims must have at least 3 entries",
        };
      }
      continue;
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      return {
        slug: draft.slug || "(missing slug)",
        reason: `missing required field: ${field}`,
      };
    }
  }

  if (!isValidSlug(draft.slug)) {
    return { slug: draft.slug, reason: "invalid slug format" };
  }

  return null;
}

function toCreatePayload(draft: (typeof knowledgeStarterDrafts)[number]) {
  return {
    slug: draft.slug,
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    category: draft.category,
    type: draft.type,
    riskLevel: draft.riskLevel,
    status: FORCED_STATUS,
    isPublished: FORCED_PUBLISHED,
    aiUsable: FORCED_AI_USABLE,
    sourceType: draft.sourceType,
    sourceTitle: draft.sourceTitle,
    sourceUrl: draft.sourceUrl,
    sourceCheckedAt: null,
    workflowLabel: draft.workflowLabel,
    tags: draft.tags,
    safeCopy: draft.safeCopy,
    forbiddenClaims: draft.forbiddenClaims,
    publishedAt: null,
  };
}

async function loadExistingSlugs(slugs: string[]): Promise<Set<string>> {
  const rows = await prisma.knowledgeArticle.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  });
  return new Set(rows.map((row) => row.slug));
}

async function loadExistingSlugsOrEmpty(
  slugs: string[],
  options: { apply: boolean },
): Promise<{ existing: Set<string>; skippedDuplicateCheck: boolean }> {
  try {
    const existing = await loadExistingSlugs(slugs);
    return { existing, skippedDuplicateCheck: false };
  } catch (error) {
    if (options.apply) throw error;
    console.warn(
      "DB unavailable; dry-run continues without existing-slug duplicate check.",
    );
    return { existing: new Set(), skippedDuplicateCheck: true };
  }
}

export async function runKnowledgeDraftImport(argv: string[] = process.argv) {
  const { apply, allowProduction } = parseArgs(argv);

  if (apply && isProductionRuntime() && !allowProduction) {
    throw new Error(
      "Refusing to write in production. Re-run with --allow-production-draft-import only after explicit approval.",
    );
  }

  const slugs = knowledgeStarterDrafts.map((d) => d.slug);
  const duplicateSlugsInData = slugs.filter(
    (slug, index) => slugs.indexOf(slug) !== index,
  );
  if (duplicateSlugsInData.length > 0) {
    throw new Error(
      `Duplicate slugs in starter data: ${[...new Set(duplicateSlugsInData)].join(", ")}`,
    );
  }

  const invalid: ValidationIssue[] = [];
  for (const draft of knowledgeStarterDrafts) {
    const issue = validateDraft(draft);
    if (issue) invalid.push(issue);
  }

  const { existing: existingSlugs, skippedDuplicateCheck } =
    await loadExistingSlugsOrEmpty(slugs, { apply });
  const toCreate = knowledgeStarterDrafts.filter(
    (d) => !existingSlugs.has(d.slug) && !invalid.some((i) => i.slug === d.slug),
  );
  const skippedExisting = knowledgeStarterDrafts.filter((d) =>
    existingSlugs.has(d.slug),
  );

  console.log("Knowledge starter draft import");
  console.log(`mode=${apply ? "apply" : "dry-run"}`);
  console.log(`totalInFile=${knowledgeStarterDrafts.length}`);
  console.log(`validToImport=${toCreate.length}`);
  console.log(`invalid=${invalid.length}`);
  console.log(`skippedExistingSlug=${skippedExisting.length}`);
  console.log("Forced on write: status=draft, isPublished=false, aiUsable=false");
  console.log("No external fetch; no auto-publish.");
  if (skippedDuplicateCheck) {
    console.log(
      "Note: existing-slug check skipped (DB unreachable). Re-run dry-run with DB for full duplicate report.",
    );
  }

  if (invalid.length > 0) {
    console.log("\nInvalid drafts (will not import):");
    console.table(invalid);
  }

  if (skippedExisting.length > 0) {
    console.log("\nSkipped (slug already exists):");
    console.table(
      skippedExisting.map((d) => ({
        slug: d.slug,
        title: d.title,
        category: d.category,
      })),
    );
  }

  if (toCreate.length > 0) {
    console.log("\nReady to import:");
    console.table(
      toCreate.map((d) => ({
        slug: d.slug,
        title: d.title,
        category: d.category,
        type: d.type,
        riskLevel: d.riskLevel,
        status: FORCED_STATUS,
        isPublished: FORCED_PUBLISHED,
        aiUsable: FORCED_AI_USABLE,
        forbiddenClaims: d.forbiddenClaims.length,
      })),
    );
  }

  if (!apply) {
    console.log("\nDry-run complete. No database writes were performed.");
    console.log("To apply: npm run knowledge:import:drafts -- --apply");
    return;
  }

  let created = 0;
  for (const draft of toCreate) {
    const payload = toCreatePayload(draft);
    await prisma.knowledgeArticle.create({ data: payload });
    created += 1;
  }

  console.log(`\nImport completed. created=${created}`);
}

runKnowledgeDraftImport()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
