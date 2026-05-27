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
  | "insurance_association"
  | "insurer_official_materials"
  | "claim_compensation_reference"
  | "education_practice_reference";

export type MessageTone =
  | "professional"
  | "warm"
  | "concise"
  | "careful"
  | "formal"
  | "calm"
  | "trustworthy";

export type MessageSituation =
  | "claim_documents_request"
  | "claim_received_notice"
  | "supplement_request"
  | "claim_completed_notice"
  | "consultation_schedule"
  | "coverage_review"
  | "cancellation_concern"
  | "referral_response"
  | "long_time_no_contact";

export type SupportedBrowser = "chrome" | "edge";

export type ClaimFaxHandlingType =
  | "fax"
  | "call_center_individual"
  | "unavailable"
  | "unknown";

export type CardPaymentStatus =
  | "available"
  | "unavailable"
  | "conditional"
  | "unknown";

export interface InsurerDirectoryEntry {
  id: string;
  name: string;
  category: InsurerCategory;
  officialWebsiteUrl: string | null;
  plannerPortalUrl: string | null;
  systemUrl: string | null;
  claimPageUrl: string | null;
  claimFormUrl: string | null;
  termsUrl: string | null;
  customerCenterPhone: string | null;
  helpdeskPhone: string | null;
  callMonitoringPhone: string | null;
  faxNumber: string | null;
  claimFaxNumber: string | null;
  claimFaxHandlingType: ClaimFaxHandlingType;
  mailingAddress: string | null;
  registeredMailAddress: string | null;
  cardPaymentInitialAvailable: boolean | null;
  cardPaymentRecurringAvailable: boolean | null;
  cardPaymentStatus: CardPaymentStatus;
  cardPaymentNote: string | null;
  supportedBrowsers: SupportedBrowser[];
  sourceNote: string | null;
  notes: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
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
  notes?: string;
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
}

export interface CustomerMessageTemplate {
  id: string;
  title: string;
  situationCategory: MessageSituation;
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
