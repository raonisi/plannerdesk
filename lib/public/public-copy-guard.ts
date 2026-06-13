import { DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES } from "@/lib/directory/public-directory-surface";

/**
 * PR-PUBLIC-SAFETY-A: forbidden copy dictionary and scan helpers for public surfaces.
 * Admin routes, validators, and test fixtures may reference these strings internally.
 */

/** A. Internal review / ops terminology — must not appear on public UI. */
export const PUBLIC_FORBIDDEN_REVIEW_OPS_PHRASES = [
  "검수 완료",
  "관리자 검수",
  "검수 대기",
  "미검수",
  "내부 검수",
  "게시 승인",
  "관리자 승인",
  "검증 설계사 권한",
  "검증 설계사",
] as const;

/** B. Developer / schema labels — must not appear on public UI. */
export const PUBLIC_FORBIDDEN_SCHEMA_PHRASES = [
  "safeCopy",
  "reviewStatus",
  "adminMemo",
  "internalStatus",
  "sourceNote",
  "audit log",
  "changeReason",
  "updatedBy",
  "changedBy",
  "previousValue",
  "nextValue",
  "needs_review",
  "outdated",
] as const;

/** C. External benchmark / source branding — must not appear on public UI. */
export const PUBLIC_FORBIDDEN_BENCHMARK_PHRASES = [
  "BohumSchool",
  "보험학교",
  "archive.pages.dev",
  "bohumschool-archive",
  "긁어서",
  "크롤",
] as const;

/** D. Mock / fixture wording — must not appear on public UI. */
export const PUBLIC_FORBIDDEN_MOCK_PHRASES = [
  "mock 공개",
  "예시 보험사",
  "테스트용",
  "fixture",
  "dummy",
] as const;

/** E. Awkward internal status copy on public cards. */
export const PUBLIC_FORBIDDEN_STATUS_PHRASES = [
  "확인일 정보 부족",
  "공식 확인 후 업데이트 예정",
  "최신성 확인 필요",
] as const;

/** F. Technical error strings — must not appear on public UI. */
export const PUBLIC_FORBIDDEN_TECH_ERROR_PHRASES = [
  "fetch failed",
  "database",
  "prisma",
  "supabase",
  "railway",
  "stack trace",
  "TypeError",
  "ReferenceError",
] as const;

/** Combined forbidden copy list for public rendered text scans. */
export const PUBLIC_FORBIDDEN_COPY_ALL = [
  ...DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES,
  ...PUBLIC_FORBIDDEN_REVIEW_OPS_PHRASES,
  ...PUBLIC_FORBIDDEN_SCHEMA_PHRASES,
  ...PUBLIC_FORBIDDEN_BENCHMARK_PHRASES,
  ...PUBLIC_FORBIDDEN_MOCK_PHRASES,
  ...PUBLIC_FORBIDDEN_STATUS_PHRASES,
  ...PUBLIC_FORBIDDEN_TECH_ERROR_PHRASES,
  "내부 상태",
  "운영자가 확인 필요",
] as const;

/** @deprecated PR-COPY-A alias — use PUBLIC_FORBIDDEN_COPY_ALL. */
export const PUBLIC_SURFACE_FORBIDDEN_UI_PHRASES = PUBLIC_FORBIDDEN_COPY_ALL;

/** Admin-only fields that must not flow into public projections or components. */
export const PUBLIC_ADMIN_ONLY_FIELD_NAMES = [
  "sourceNote",
  "adminMemo",
  "reviewStatus",
  "reviewNotePrivate",
  "internalReviewNote",
  "rawSourceMemo",
  "internalStatus",
  "changeReason",
  "updatedBy",
  "changedBy",
  "previousValue",
  "nextValue",
  "createdById",
  "updatedById",
  "reviewedById",
  "auditLog",
  "audit log",
] as const;

/** PDF asset path prefix — allowed in href/src; brand names in visible text are still forbidden. */
export const BOHUMSCHOOL_PDF_PATH_PREFIX = "/claim-forms/bohumschool/";

/** Public route → source files scanned for forbidden visible copy (static tests). */
export const PUBLIC_ROUTE_SOURCE_FILES: Readonly<
  Record<
    "/" | "/directory" | "/claim-documents" | "/work-tools" | "/disclosure-links" | "/message-templates",
    readonly string[]
  >
> = {
  "/": [
    "app/page.tsx",
    "app/home-client.tsx",
    "components/dashboard/home-public-stats-strip.tsx",
    "components/dashboard/home-data-status-notice.tsx",
    "components/footer.tsx",
  ],
  "/directory": [
    "app/directory/page.tsx",
    "app/directory/directory-explorer.tsx",
    "components/directory/insurer-action-card.tsx",
    "components/directory/insurer-card-desk-actions.tsx",
    "components/directory/insurer-card-claim-documents-section.tsx",
    "lib/directory/public-directory-surface.ts",
  ],
  "/claim-documents": [
    "app/claim-documents/page.tsx",
    "app/claim-documents/claim-document-explorer.tsx",
    "components/claim-documents/claim-form-list-item.tsx",
  ],
  "/work-tools": [
    "app/work-tools/page.tsx",
    "app/work-tools/work-tools-client.tsx",
    "components/work-tools/work-tools-public-notice.tsx",
    "components/content/work-tools-planner-notice.tsx",
  ],
  "/disclosure-links": [
    "app/disclosure-links/page.tsx",
    "app/disclosure-links/disclosure-links-client.tsx",
    "app/disclosure-links/disclosure-link-center.tsx",
    "components/disclosure/disclosure-card.tsx",
  ],
  "/message-templates": [
    "app/message-templates/page.tsx",
    "app/message-templates/message-template-library.tsx",
  ],
};

/** Flat list for backward-compatible scans (PR-COPY-A). */
export const PUBLIC_SURFACE_ROUTE_FILES = [
  ...new Set(Object.values(PUBLIC_ROUTE_SOURCE_FILES).flat()),
  "components/content/data-freshness-meta.tsx",
  "components/content/data-responsibility-inline-notice.tsx",
  "lib/public/public-ux-copy.ts",
  "lib/planner-favorites/copy.ts",
] as const;

/** Public fetch helpers that must omit admin-only fields from prisma select. */
export const PUBLIC_SOURCE_LEAK_GUARD_FILES = [
  "lib/public/insurers.ts",
  "lib/public/claim-documents.ts",
  "lib/public/disclosure-links.ts",
  "lib/public/message-templates.ts",
  "lib/public/knowledge-articles.ts",
  "lib/work-links/verified-projection.ts",
  "lib/work-links/review-types.ts",
] as const;

/** Shared empty-state copy (PR-COPY-A). */
export const PUBLIC_EMPTY_CONTENT_UPDATING =
  "준비되면 순차적으로 업데이트됩니다.";

export const PUBLIC_PLACEHOLDER_UNAVAILABLE = "준비 중";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Remove noise that should not fail public copy scans. */
export function stripPublicCopyScanNoise(source: string): string {
  return (
    source
      // Dictionary / list definitions
      .replace(/PUBLIC_FORBIDDEN[\w_]*[\s\S]*?\] as const;/g, "")
      .replace(/PUBLIC_SURFACE_FORBIDDEN_UI_PHRASES[\s\S]*?\] as const;/g, "")
      .replace(/DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES[\s\S]*?\] as const;/g, "")
      .replace(/PUBLIC_ADMIN_ONLY_FIELD_NAMES[\s\S]*?\] as const;/g, "")
      // Schema field references in code (not user-visible labels)
      .replace(/\.safeCopy\b/g, "")
      .replace(/applySafeCopyPlaceholders/g, "")
      .replace(/safeCopy:\s*\{/g, "")
      .replace(/safeCopy:\s*true/g, "")
      .replace(/template\.safeCopy/g, "")
      // Prisma / storage implementation details (not user-visible copy)
      .replace(/from\s+["']@prisma\/client["']/g, "")
      .replace(/from\s+["']@\/lib\/prisma["']/g, "")
      .replace(/import\s+\{[^}]*\}\s+from\s+["']@prisma\/client["']/g, "")
      .replace(/https?:\/\/[^\s"'`]*supabase[^\s"'`]*/gi, "")
      .replace(/process\.env\.DATABASE_URL[^\n]*/g, "")
      // TypeScript enum/type noise
      .replace(/:\s*unknown\b/g, "")
      .replace(/case\s+"unknown"/g, "")
      .replace(/\w+-mock\b/g, "")
      .replace(/quick-link-files\/[^"'`\s]*/g, "")
      .replace(/getMock[A-Za-z]*/g, "")
      .replace(/===\s*"needs_review"/g, "")
      .replace(/===\s*"verified"/g, "")
      .replace(/VerificationStatus\.\w+/g, "")
      // Allowed PDF asset paths (not visible brand copy)
      .replace(/\/claim-forms\/bohumschool\/[^\s"'`]*/gi, "")
      .replace(/BOHUMSCHOOL_PDF_PATH_PREFIX/g, "")
  );
}

export function getForbiddenPublicCopyMatches(
  text: string,
  phrases: readonly string[] = PUBLIC_FORBIDDEN_COPY_ALL,
): string[] {
  const cleaned = stripPublicCopyScanNoise(text);
  const matches: string[] = [];
  for (const phrase of phrases) {
    if (new RegExp(escapeRegExp(phrase)).test(cleaned)) {
      matches.push(phrase);
    }
  }
  return matches;
}

export function assertNoForbiddenPublicCopy(
  text: string,
  context: string,
  phrases: readonly string[] = PUBLIC_FORBIDDEN_COPY_ALL,
): void {
  const matches = getForbiddenPublicCopyMatches(text, phrases);
  if (matches.length > 0) {
    throw new Error(`${context}: forbidden public copy — ${matches.join(", ")}`);
  }
}
