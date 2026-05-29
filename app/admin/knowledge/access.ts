export {
  getAdminAccess as getKnowledgeAdminAccess,
  requireContentManagerAccess as requireKnowledgeContentManager,
  requirePublisherAccess as requireKnowledgePublisher,
  getSessionUserId,
  type AdminAccessState,
  type AdminSession,
} from "@/lib/auth/access";
