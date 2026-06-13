export type ClaimDocumentReviewStatus =
  | "verified"
  | "needs_review"
  | "outdated"
  | "hidden"
  | "unknown";

export type ClaimDocumentGovernance = {
  id: string;
  insurerId?: string;
  insurerName: string;
  documentId?: string;
  documentTitle: string;
  fileName: string;
  filePath: string;
  fileType: "pdf";
  officialSourceUrl?: string;
  officialSourceLabel?: string;
  lastVerifiedAt?: string;
  nextReviewDueAt?: string;
  reviewStatus: ClaimDocumentReviewStatus;
  isVisible: boolean;
  isDownloadEnabled: boolean;
  cautionText?: string;
  adminMemo?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ClaimDocumentWithGovernance = {
  governance: ClaimDocumentGovernance;
  /** Static PDF href from claim-form-files SSOT — never rewritten by governance merge */
  href: string;
};

export type ClaimDocumentGovernanceRegistryEntry = Partial<
  Omit<ClaimDocumentGovernance, "fileType">
> & {
  filePath?: string;
  fileName?: string;
  insurerName?: string;
  documentTitle?: string;
};

export type ClaimDocumentGovernanceSummary = {
  total: number;
  verifiedComplete: number;
  needsReview: number;
  missingOfficialUrl: number;
};

export type ClaimDocumentGovernanceFilters = {
  insurerQuery: string;
  documentQuery: string;
  reviewStatus: ClaimDocumentReviewStatus | "all";
  officialUrl: "all" | "present" | "missing";
  lastVerified: "all" | "present" | "missing";
  visibility: "all" | "visible" | "hidden";
  download: "all" | "enabled" | "disabled";
};
