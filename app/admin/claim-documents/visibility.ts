import { ClaimDocumentCategory, VerificationStatus } from "@prisma/client";
import { PUBLIC_VERIFICATION_STATUSES } from "@/lib/public/insurers";

// Korean copy for the admin-side ClaimDocument workflow. These strings stay
// consistent with the canonical visibility rule exported from
// `lib/public/insurers.ts` (the same rule applies to ClaimDocument records;
// the future PR-39 public read will import that rule directly).
//
// Two notices in this object are MANDATED by the PR-38 task specification
// and must be surfaced verbatim on both the list and form pages:
//   - guidanceNotice  (no payout / coverage / amount judgment)
//   - sensitiveNotice (no PII, no policy numbers, no medical records, no
//     claim documents, no customer-specific medical info)
export const ADMIN_CLAIM_DOC_COPY = {
  policySummary:
    "\uacf5\uac1c \uc870\uac74: \uac8c\uc2dc \uc911\uc774\uba70, \uac80\uc218 \ud544\uc694 \ub610\ub294 \uac80\uc218 \uc644\ub8cc \uc0c1\ud0dc\uc778 \uccad\uad6c\uc11c\ub958\ub9cc \uacf5\uac1c \ud654\uba74\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.",
  draftRule:
    "\ucd08\uc548 \uc0c1\ud0dc\ub294 \uac8c\uc2dc \uc5ec\ubd80\uc640 \uad00\uacc4\uc5c6\uc774 \uacf5\uac1c \ud654\uba74\uc5d0 \ud45c\uc2dc\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  governanceRule:
    "\uacf5\uac1c \uc804 \ubc18\ub4dc\uc2dc \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \uc57d\uad00\u00b7\uacf5\uc2dd \uccad\uad6c \uc548\ub0b4 \uc790\ub8cc\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694.",
  draftPublishBlocked:
    "\ucd08\uc548 \uc0c1\ud0dc\uc758 \uccad\uad6c\uc11c\ub958\ub294 \uacf5\uac1c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uac80\uc218 \ud544\uc694 \ub610\ub294 \uac80\uc218 \uc644\ub8cc \uc0c1\ud0dc\ub85c \ubcc0\uacbd\ud55c \ub4a4 \uacf5\uac1c\ud574 \uc8fc\uc138\uc694.",
  notFound: "\uccad\uad6c\uc11c\ub958 \uad00\ub9ac \ub808\ucf54\ub4dc\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
  duplicateSlug:
    "\uc774\ubbf8 \uc0ac\uc6a9 \uc911\uc778 \uc2ac\ub7ec\uadf8\uc785\ub2c8\ub2e4. \ub2e4\ub978 \uc2ac\ub7ec\uadf8\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.",
  insurerNotFound:
    "\uc120\ud0dd\ud558\uc2e0 \ubcf4\ud5d8\uc0ac\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \ud3ec\ub7fc\uc744 \uc0c8\ub85c\uace0\uce68\ud55c \ub4a4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.",

  // Verbatim notices required by the PR-38 task specification.
  guidanceNotice:
    "\uccad\uad6c\uc11c\ub958 \uc548\ub0b4\ub294 \ubcf4\ud5d8\uae08 \uc9c0\uae09 \uc5ec\ubd80\ub098 \uc9c0\uae09 \uae08\uc561\uc744 \ud310\ub2e8\ud558\ub294 \ub0b4\uc6a9\uc774 \uc544\ub2d9\ub2c8\ub2e4. \uacf5\uc2dd \uc57d\uad00\uacfc \ubcf4\ud5d8\uc0ac \uae30\uc900 \ud655\uc778 \ud6c4 \uacf5\uac1c\ud574 \uc8fc\uc138\uc694.",
  sensitiveNotice:
    "\uc8fc\ubbfc\ub4f1\ub85d\ubc88\ud638, \uc99d\uad8c\ubc88\ud638, \uc9c4\ub8cc\uae30\ub85d, \ubcf4\ud5d8\uae08 \uccad\uad6c\uc11c\ub958, \uace0\uac1d\ubcc4 \uc758\ub8cc\uc815\ubcf4\ub294 \uc785\ub825\ud558\uac70\ub098 \uc800\uc7a5\ud558\uc9c0 \ub9c8\uc138\uc694.",

  prohibitedPhraseTitle:
    "\uc0ac\uc6a9\uc774 \uae08\uc9c0\ub41c \ud45c\ud604\uc774 \ud3ec\ud568\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4.",
  prohibitedPhraseDetail:
    "\uadfc\uac70 \uc5c6\ub294 \uc9c0\uae09 \uc57d\uc18d, \ud655\uc815 \ud45c\ud604, \uacf5\ud3ec \ub9c8\ucf00\ud305 \ud45c\ud604\uc740 \uac80\ud1a0 \uc804 \uc81c\uac70\ud574 \uc8fc\uc138\uc694.",
} as const;

// The admin form for ClaimDocument only exposes the operational verification
// states. The remaining VerificationStatus enum values exist on the shared
// enum because of the User model; the labels below stay exhaustive so
// TypeScript can guarantee a label for every enum value.
export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  [VerificationStatus.draft]: "\ucd08\uc548",
  [VerificationStatus.needs_review]: "\uac80\uc218 \ud544\uc694",
  [VerificationStatus.verified]: "\uac80\uc218 \uc644\ub8cc",
  [VerificationStatus.unverified]: "\uac80\uc218 \uc774\ub825 \uc5c6\uc74c",
  [VerificationStatus.pending]: "\uac80\uc218 \ub300\uae30",
};

export const PUBLICATION_LABEL = {
  published: "\uac8c\uc2dc \uc911",
  unpublished: "\ube44\uac8c\uc2dc",
} as const;

export const VISIBILITY_LABEL = {
  visible: "\uacf5\uac1c \ud654\uba74 \ud45c\uc2dc",
  hidden: "\uacf5\uac1c \uc870\uac74 \ubbf8\ucda9\uc871",
} as const;

// Korean labels for the closed enum shipped in PR-37. The PR-36 plan used
// "indemnity" as the working title for 실손; the enum value lands as
// `actual_expense` in PR-37 but the operator label remains 실손.
export const CLAIM_DOCUMENT_CATEGORY_LABEL: Record<
  ClaimDocumentCategory,
  string
> = {
  [ClaimDocumentCategory.actual_expense]: "\uc2e4\uc190",
  [ClaimDocumentCategory.diagnosis]: "\uc9c4\ub2e8",
  [ClaimDocumentCategory.surgery]: "\uc218\uc220",
  [ClaimDocumentCategory.hospitalization]: "\uc785\uc6d0",
  [ClaimDocumentCategory.outpatient]: "\ud1b5\uc6d0",
  [ClaimDocumentCategory.fracture]: "\uacf0\uc808",
  [ClaimDocumentCategory.driver]: "\uc6b4\uc804\uc790",
  [ClaimDocumentCategory.death]: "\uc0ac\ub9dd",
  [ClaimDocumentCategory.disability]: "\ud6c4\uc720\uc7a5\ud574",
  [ClaimDocumentCategory.other]: "\uae30\ud0c0",
};

// The category options offered in the admin form. Order roughly mirrors the
// PR-36 §E sequence so operators see related categories near each other.
export const CLAIM_DOCUMENT_CATEGORY_OPTIONS: {
  value: ClaimDocumentCategory;
  label: string;
}[] = [
  { value: ClaimDocumentCategory.actual_expense, label: "\uc2e4\uc190" },
  { value: ClaimDocumentCategory.diagnosis, label: "\uc9c4\ub2e8" },
  { value: ClaimDocumentCategory.surgery, label: "\uc218\uc220" },
  { value: ClaimDocumentCategory.hospitalization, label: "\uc785\uc6d0" },
  { value: ClaimDocumentCategory.outpatient, label: "\ud1b5\uc6d0" },
  { value: ClaimDocumentCategory.fracture, label: "\uacf0\uc808" },
  { value: ClaimDocumentCategory.driver, label: "\uc6b4\uc804\uc790" },
  { value: ClaimDocumentCategory.death, label: "\uc0ac\ub9dd" },
  { value: ClaimDocumentCategory.disability, label: "\ud6c4\uc720\uc7a5\ud574" },
  { value: ClaimDocumentCategory.other, label: "\uae30\ud0c0" },
];

// Same forbidden combination as Insurer: a draft record must never publish.
// The server enforces this in every write path; the UI uses the same check
// to disable affordances early.
export function wouldPublishDraft(flags: {
  isPublished: boolean;
  verificationStatus: VerificationStatus;
}): boolean {
  return (
    flags.isPublished && flags.verificationStatus === VerificationStatus.draft
  );
}

// PR-39 public read will import the canonical rule from
// `lib/public/insurers.ts` so the visibility predicate cannot drift across
// content hubs. This helper is used only for admin UI badges.
export function isClaimDocumentPubliclyVisible(flags: {
  isPublished: boolean;
  verificationStatus: VerificationStatus;
}): boolean {
  return (
    flags.isPublished &&
    (PUBLIC_VERIFICATION_STATUSES as readonly VerificationStatus[]).includes(
      flags.verificationStatus,
    )
  );
}
