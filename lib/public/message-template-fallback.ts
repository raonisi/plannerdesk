/**
 * PR-MESSAGE-01: Static fallback projection for public message templates.
 */

import {
  publicMessageTemplateCatalog,
  publicMessageTemplateDraftSampleId,
} from "@/lib/content/public-message-template-catalog";
import {
  findProhibitedPhrase,
  findSensitiveVariable,
} from "@/lib/message-template/safety";
import type { PublicMessageTemplate } from "@/lib/public/message-templates";

function isCatalogEntryPubliclyVisible(entry: PublicMessageTemplate): boolean {
  if (entry.id === publicMessageTemplateDraftSampleId) return false;
  if (entry.id.includes("-draft")) return false;
  const safeCopy = entry.safeCopy.trim();
  if (!safeCopy) return false;
  if (findProhibitedPhrase(safeCopy)) return false;
  if (findSensitiveVariable(safeCopy)) return false;
  return true;
}

/** Static catalog entries eligible for /message-templates when DB is empty or unavailable. */
export function getStaticMessageTemplateFallback(): PublicMessageTemplate[] {
  return publicMessageTemplateCatalog
    .filter(isCatalogEntryPubliclyVisible)
    .map((entry) => ({
      ...entry,
      safeCopy: entry.safeCopy.trim(),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ko"));
}

export function countStaticMessageTemplateFallback(): number {
  return getStaticMessageTemplateFallback().length;
}

export function mergePublicMessageTemplates(
  primary: PublicMessageTemplate[],
  fallback: PublicMessageTemplate[] = getStaticMessageTemplateFallback(),
): PublicMessageTemplate[] {
  const seen = new Set(primary.map((item) => item.id));
  const merged = [...primary];
  for (const entry of fallback) {
    if (seen.has(entry.id)) continue;
    merged.push(entry);
  }
  return merged.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ko"),
  );
}
