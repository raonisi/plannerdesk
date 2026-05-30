import type { CustomerMessageTemplate, VerificationStatus } from "@/lib/content";

/** Static templates lack verificationStatus; infer from id suffix for admin workflow. */
export function inferMessageTemplateVerificationStatus(
  template: CustomerMessageTemplate,
): VerificationStatus {
  if (template.id.includes("-draft")) return "draft";
  return "verified";
}

export function inferMessageTemplateIsPublished(
  template: CustomerMessageTemplate,
): boolean {
  const status = inferMessageTemplateVerificationStatus(template);
  return status === "verified" || status === "needs_review";
}

export function filterMessageTemplates(
  templates: CustomerMessageTemplate[],
  params: {
    q?: string;
    situation?: string;
    tone?: string;
    status?: string;
    published?: string;
  },
): CustomerMessageTemplate[] {
  const query = params.q?.trim().toLocaleLowerCase("ko-KR");

  return templates.filter((template) => {
    if (query) {
      const haystack = [
        template.title,
        template.situation,
        template.body,
        template.safetyNote,
        template.id,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");
      if (!haystack.includes(query)) return false;
    }

    if (
      params.situation &&
      params.situation !== "all" &&
      template.situationCategory !== params.situation
    ) {
      return false;
    }

    if (params.tone && params.tone !== "all" && template.tone !== params.tone) {
      return false;
    }

    const verificationStatus = inferMessageTemplateVerificationStatus(template);
    if (
      params.status &&
      params.status !== "all" &&
      verificationStatus !== params.status
    ) {
      return false;
    }

    const isPublished = inferMessageTemplateIsPublished(template);
    if (params.published === "true" && !isPublished) return false;
    if (params.published === "false" && isPublished) return false;

    return true;
  });
}
