# PR-FEATURE-GAP-01 Home Public SSOT Integration

## Summary

Home public stats now use the same visible-data resolvers as each public page, eliminating mismatches (e.g. claim documents showing 0 on home while `/claim-documents` shows fallback content).

## SSOT modules

- `lib/public/public-surface-resolvers.ts` — per-domain visible item/count + surface status
- `lib/work-tools/work-tool-catalog.ts` — canonical Work Tools id list
- `lib/work-tools/work-tools-registry.ts` — `countPublicWorkTools()`

## Claim documents count (P0 fix)

Home `claimDocumentCount` uses `resolveVisiblePublicClaimLibrarySurface` →
`countPublicClaimLibraryItems` → `buildClaimLibraryItems` (PDFs + guides + governance overlay).

Same path as `ClaimDocumentExplorer` `allItems.length` before filters.

`needs_review` on guides/PDFs follows existing public visibility policy — unchanged in this PR.
