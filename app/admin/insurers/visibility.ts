import { VerificationStatus } from "@prisma/client";
import {
  PUBLIC_VERIFICATION_STATUSES,
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
  type InsurerVisibilityFlags,
} from "@/lib/public/insurers";

// Korean copy for the admin-side verification/publish workflow. These strings
// must stay consistent with the canonical visibility rule exported from
// `lib/public/insurers.ts`. The rule is documented in
// docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md (Public visibility policy).
export const ADMIN_VISIBILITY_COPY = {
  policySummary:
    "\uacf5\uac1c \uc870\uac74: \uac8c\uc2dc \uc911\uc774\uba70, \uac80\uc218 \ud544\uc694 \ub610\ub294 \uac80\uc218 \uc644\ub8cc \uc0c1\ud0dc\uc778 \ubcf4\ud5d8\uc0ac\ub9cc \uacf5\uac1c \ud654\uba74\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.",
  draftRule:
    "\ucd08\uc548 \uc0c1\ud0dc\ub294 \uac8c\uc2dc \uc5ec\ubd80\uc640 \uad00\uacc4\uc5c6\uc774 \uacf5\uac1c \ud654\uba74\uc5d0 \ud45c\uc2dc\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  governanceRule:
    "\uac80\uc218 \uc644\ub8cc \uc804 \uc815\ubcf4\ub294 \uacf5\uac1c \uc804 \uacf5\uc2dd \ucd9c\ucc98 \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.",
  draftPublishBlocked:
    "\ucd08\uc548 \uc0c1\ud0dc\uc758 \ubcf4\ud5d8\uc0ac\ub294 \uacf5\uac1c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uac80\uc218 \ud544\uc694 \ub610\ub294 \uac80\uc218 \uc644\ub8cc \uc0c1\ud0dc\ub85c \ubcc0\uacbd\ud55c \ub4a4 \uacf5\uac1c\ud574 \uc8fc\uc138\uc694.",
  insurerNotFound: "\ubcf4\ud5d8\uc0ac \uad00\ub9ac \ub808\ucf54\ub4dc\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
} as const;

// The Insurer admin UI only offers draft / needs_review / verified because
// those are the operational states for editorial content. The remaining enum
// values (`unverified`, `pending`) exist on the shared VerificationStatus enum
// for the User model and are surfaced here only to keep the label exhaustive.
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

// True when the next save/publish would land in the forbidden state of
// isPublished=true + verificationStatus=draft. The server enforces this in
// every write path; the UI uses the same check to disable affordances early.
export function wouldPublishDraft(flags: InsurerVisibilityFlags): boolean {
  return flags.isPublished && flags.verificationStatus === VerificationStatus.draft;
}

export {
  PUBLIC_VERIFICATION_STATUSES,
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
};
