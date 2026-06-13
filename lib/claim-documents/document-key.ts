import { createHash } from "node:crypto";

export type ClaimDocumentKeyInput = {
  filePath?: string;
  href?: string;
  fileName?: string;
  insurerName?: string;
  documentTitle?: string;
};

/**
 * Stable governance mapping key derived from static PDF identity.
 * Does not replace download href/filePath — DB lookup only.
 */
export function buildClaimDocumentKey(input: ClaimDocumentKeyInput): string {
  const filePath = input.filePath?.trim() || input.href?.trim();
  if (filePath) {
    return hashKey(`path:${filePath}`);
  }

  const fileName = input.fileName?.trim();
  const insurerName = input.insurerName?.trim();
  if (fileName && insurerName) {
    return hashKey(`file:${insurerName}:${fileName}`);
  }

  const documentTitle = input.documentTitle?.trim();
  if (documentTitle && insurerName) {
    return hashKey(`title:${insurerName}:${documentTitle}`);
  }

  throw new Error("CLAIM_DOCUMENT_KEY_INPUT_REQUIRED");
}

function hashKey(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 32);
}
