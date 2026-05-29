export {
  getAdminAccess as getClaimDocumentAdminAccess,
  requireContentManagerAccess as requireClaimDocumentContentManager,
  requirePublisherAccess as requireClaimDocumentPublisher,
  getSessionUserId,
  type AdminAccessState,
  type AdminSession,
} from "@/lib/auth/access";
