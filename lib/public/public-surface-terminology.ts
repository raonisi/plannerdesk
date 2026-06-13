import { DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES } from "@/lib/directory/public-directory-surface";

/**
 * PR-COPY-A: phrases that must not appear on public user-facing surfaces.
 * Admin routes, schema field names in code, and leak-prevention tests may reference these.
 */
export const PUBLIC_SURFACE_FORBIDDEN_UI_PHRASES = [
  ...DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES,
  "safeCopy",
  "검수 완료",
  "관리자 검수",
  "검증 설계사 권한",
  "검증 설계사",
  "mock 공개",
  "예시 보험사",
  "adminMemo",
  "audit log",
  "changeReason",
  "updatedBy",
  "sourceNote",
  "needs_review",
  "미검수",
  "내부 상태",
  "운영자가 확인 필요",
  "BohumSchool",
  "보험학교",
  "archive.pages.dev",
] as const;

/** Shared empty-state copy when public content is not yet available. */
export const PUBLIC_EMPTY_CONTENT_UPDATING =
  "준비되면 순차적으로 업데이트됩니다.";

/** Neutral placeholder when a field value is not yet available on public cards. */
export const PUBLIC_PLACEHOLDER_UNAVAILABLE = "준비 중";

/** Public route source files scanned for forbidden terminology (static tests). */
export const PUBLIC_SURFACE_ROUTE_FILES = [
  "app/page.tsx",
  "app/home-client.tsx",
  "app/directory/page.tsx",
  "app/directory/directory-explorer.tsx",
  "app/claim-documents/page.tsx",
  "app/claim-documents/claim-document-explorer.tsx",
  "app/work-tools/page.tsx",
  "app/work-tools/work-tools-client.tsx",
  "app/disclosure-links/page.tsx",
  "app/disclosure-links/disclosure-links-client.tsx",
  "app/message-templates/page.tsx",
  "app/message-templates/message-template-library.tsx",
  "components/disclosure/disclosure-card.tsx",
  "components/content/work-tools-planner-notice.tsx",
  "components/content/data-freshness-meta.tsx",
  "components/content/data-responsibility-inline-notice.tsx",
  "components/footer.tsx",
  "components/dashboard/home-public-stats-strip.tsx",
  "lib/public/public-ux-copy.ts",
  "lib/dashboard/work-hub-copy.ts",
  "lib/planner-favorites/copy.ts",
  "lib/correction-request/constants.ts",
] as const;
