import { VerificationStatus } from "@prisma/client";
import {
  PUBLIC_VERIFICATION_STATUSES,
  isPublicVerificationStatus,
} from "@/lib/public/insurers";

export interface PublishedContentFlags {
  isPublished: boolean;
  verificationStatus: VerificationStatus;
}

/**
 * Canonical public visibility predicate for published editorial content
 * (Insurer, ClaimDocument, and future hubs).
 *
 * Visible when isPublished === true AND verificationStatus is verified or needs_review.
 * Draft and unpublished rows must never pass this check.
 */
export function isPublishedContentPubliclyVisible(
  flags: PublishedContentFlags,
): boolean {
  return (
    flags.isPublished && isPublicVerificationStatus(flags.verificationStatus)
  );
}

/** Forbidden combination: published while still in draft verification state. */
export function wouldPublishDraft(flags: PublishedContentFlags): boolean {
  return (
    flags.isPublished && flags.verificationStatus === VerificationStatus.draft
  );
}

export { PUBLIC_VERIFICATION_STATUSES, isPublicVerificationStatus };
