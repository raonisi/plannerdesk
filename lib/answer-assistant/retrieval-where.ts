// Stricter KnowledgeArticle visibility for answer-assist retrieval (PR-93/94).

import {
  KnowledgeArticleStatus,
  KnowledgeRiskLevel,
  type Prisma,
} from "@prisma/client";

/** Answer-assist baseline — stricter than PUBLIC_KNOWLEDGE_WHERE. */
export const ANSWER_ASSIST_KNOWLEDGE_WHERE = {
  isPublished: true,
  status: KnowledgeArticleStatus.verified,
  aiUsable: true,
  riskLevel: { not: KnowledgeRiskLevel.blocked },
  reviewedById: { not: null },
} as const satisfies Prisma.KnowledgeArticleWhereInput;
