export type VerificationStatus = "draft" | "verified" | "needs_review";

export type InsurerCategory = "life" | "non_life";

export type ClaimType =
  | "actual_medical"
  | "hospitalization"
  | "surgery"
  | "diagnosis"
  | "fracture"
  | "medication"
  | "common";

export type DisclosureCategory =
  | "product_disclosure"
  | "policy_terms"
  | "claim_guidance"
  | "consumer_notice"
  | "regulatory_reference";

export type MessageTone =
  | "professional"
  | "warm"
  | "concise"
  | "careful"
  | "formal";

export interface InsurerDirectoryEntry {
  id: string;
  name: string;
  category: InsurerCategory;
  officialWebsiteUrl: string | null;
  plannerPortalUrl: string | null;
  claimPageUrl: string | null;
  customerCenterPhone: string | null;
  faxNumber: string | null;
  mailingAddress: string | null;
  notes: string;
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
}

export interface ClaimDocumentEntry {
  id: string;
  title: string;
  insurerId: string | null;
  claimType: ClaimType;
  documentName: string;
  sourceUrl: string | null;
  description: string;
  cautionNote: string;
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
}

export interface DisclosureLinkEntry {
  id: string;
  title: string;
  category: DisclosureCategory;
  sourceUrl: string | null;
  description: string;
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
}

export interface CustomerMessageTemplate {
  id: string;
  title: string;
  situation: string;
  tone: MessageTone;
  body: string;
  safetyNote: string;
  lastUpdatedAt: string;
}

export interface ContentSafetyRule {
  id: string;
  title: string;
  description: string;
}
