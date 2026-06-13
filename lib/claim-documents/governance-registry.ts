import type { ClaimDocumentGovernanceRegistryEntry } from "./governance-types";

/**
 * Static governance overrides for stored PDFs.
 * Only add entries with explicitly confirmed review metadata.
 * Missing entries default to reviewStatus "unknown" via merge helpers.
 */
export const CLAIM_DOCUMENT_GOVERNANCE_REGISTRY: ClaimDocumentGovernanceRegistryEntry[] =
  [];
