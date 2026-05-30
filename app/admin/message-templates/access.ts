export {
  getAdminAccess as getMessageTemplateAdminAccess,
  requireContentManagerAccess as requireMessageTemplateContentManager,
  requirePublisherAccess as requireMessageTemplatePublisher,
  getSessionUserId,
  type AdminAccessState,
  type AdminSession,
} from "@/lib/auth/access";
