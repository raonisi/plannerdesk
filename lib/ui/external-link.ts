/**
 * Security attributes for external links opened in a new tab.
 * Use with target="_blank" to prevent tab-nabbing (opener access).
 */
export const EXTERNAL_LINK_TARGET = "_blank" as const;

export const EXTERNAL_LINK_REL = "noopener noreferrer" as const;

export function isExternalHttpUrl(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}

/**
 * Merges existing rel tokens with noopener/noreferrer without dropping other values.
 */
export function mergeExternalLinkRel(existing?: string): string {
  const tokens = new Set(
    (existing ?? "")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean),
  );
  tokens.add("noopener");
  tokens.add("noreferrer");
  return Array.from(tokens).join(" ");
}

export const externalLinkTabProps = {
  rel: EXTERNAL_LINK_REL,
  target: EXTERNAL_LINK_TARGET,
} as const;
