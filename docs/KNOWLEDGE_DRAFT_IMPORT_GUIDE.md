# Knowledge Starter Draft Import Guide

PR-KNOW-IMPORT-01 — bulk register 30 starter knowledge articles as **draft** rows only.

## Files

| Path | Role |
|------|------|
| `lib/content/knowledge-starter-drafts.ts` | Static draft data (30 articles) |
| `scripts/import-knowledge-drafts.ts` | Dry-run-first import script |
| `docs/KNOWLEDGE_STARTER_ARTICLES_30.md` | Human-readable source memo (PR-KNOW-CONTENT-01) |

## Defaults (enforced on write)

- `status`: `draft`
- `isPublished`: `false`
- `aiUsable`: `false`
- `publishedAt`: `null`
- No auto-publish, no AI enablement, no external URL fetch

## Commands

Dry-run (default — **no DB writes**):

```bash
npm run knowledge:import:drafts
```

Apply (local/staging only — after Antigravity / policy review):

```bash
npm run knowledge:import:drafts -- --apply
```

Production (requires explicit double opt-in):

```bash
npm run knowledge:import:drafts -- --apply --allow-production-draft-import
```

## Safety behavior

1. **Dry-run by default** — reports valid count, invalid rows, and existing slug skips.
2. **`--apply` required** for any insert.
3. **Production blocked** unless `--allow-production-draft-import` is also passed.
4. **Slug dedup** — existing `KnowledgeArticle.slug` rows are skipped (no overwrite).
5. **Forced fields** on create — `status`, `isPublished`, `aiUsable` overwritten even if data file drifts.
6. **Validation** — required fields + `forbiddenClaims` length ≥ 3; invalid rows are skipped.
7. **No network** — `sourceUrl` is stored only; never fetched.

## After import

1. Review each row in `/admin/knowledge`.
2. Follow `docs/KNOWLEDGE_CONTENT_POLICY.md` before `needs_review` / `verified`.
3. Publish (`isPublished=true`) only after official-source review.
4. Enable `aiUsable` only under separate policy approval.

## Regenerating data from markdown

If `docs/KNOWLEDGE_STARTER_ARTICLES_30.md` changes, run locally (not part of CI):

```bash
node scripts/_generate-knowledge-starter-drafts.mjs
```

Then re-run dry-run import and typecheck.
