import { AppShell } from "@/components/app-shell";
import { HomeClient } from "./home-client";
import { getWorkToolsAccess } from "@/lib/auth/access";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { getPublicDisclosureLinks } from "@/lib/public/disclosure-links";
import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicKnowledgeArticles } from "@/lib/public/knowledge-articles";
import { getPublicMessageTemplates } from "@/lib/public/message-templates";
import {
  resolveVisiblePublicClaimLibrarySurface,
  resolveVisiblePublicDisclosureLinks,
  resolveVisiblePublicInsurers,
  resolveVisiblePublicKnowledgeArticles,
  resolveVisiblePublicMessageTemplates,
} from "@/lib/public/public-surface-resolvers";
import { safeGetPublicClaimPdfGovernanceOverlay } from "@/lib/claim-documents/governance-repository";
import { getPlannerVerifiedWorkLinks } from "@/lib/work-links/verified-catalog";
import { countPublicWorkTools } from "@/lib/work-tools/work-tools-registry";
import {
  buildHomePublicStats,
  resolveHomeDomainFetchStatus,
  resolveHomeLoadState,
  type HomeDataFetchSnapshot,
} from "@/lib/dashboard/home-data-state";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    insurerResult,
    claimResult,
    disclosureResult,
    messageTemplateResult,
    knowledgeResult,
    workToolsAccess,
    pdfGovernanceOverlay,
  ] = await Promise.all([
    getPublicInsurers(),
    getPublicClaimDocuments(),
    getPublicDisclosureLinks(),
    getPublicMessageTemplates(),
    getPublicKnowledgeArticles(),
    getWorkToolsAccess(),
    safeGetPublicClaimPdfGovernanceOverlay(),
  ]);

  const insurerSurface = resolveVisiblePublicInsurers(insurerResult);
  const claimSurface = resolveVisiblePublicClaimLibrarySurface(
    claimResult,
    pdfGovernanceOverlay,
  );
  const disclosureSurface = resolveVisiblePublicDisclosureLinks(disclosureResult);
  const messageTemplateSurface =
    resolveVisiblePublicMessageTemplates(messageTemplateResult);
  const knowledgeSurface = resolveVisiblePublicKnowledgeArticles(knowledgeResult);
  const workToolCount = countPublicWorkTools();

  const fetchStatus: HomeDataFetchSnapshot = {
    insurers: resolveHomeDomainFetchStatus(insurerSurface.surfaceStatus),
    claimDocuments: resolveHomeDomainFetchStatus(claimSurface.surfaceStatus),
    disclosureLinks: resolveHomeDomainFetchStatus(disclosureSurface.surfaceStatus),
    messageTemplates: resolveHomeDomainFetchStatus(
      messageTemplateSurface.surfaceStatus,
    ),
    workTools: "ok",
    knowledge: resolveHomeDomainFetchStatus(knowledgeSurface.surfaceStatus),
  };

  const counts = {
    insurerCount: insurerSurface.items.length,
    claimDocumentCount: claimSurface.libraryItemCount,
    disclosureLinkCount: disclosureSurface.count,
    messageTemplateCount: messageTemplateSurface.count,
    workToolCount,
    knowledgeArticleCount: knowledgeSurface.count,
  };

  const loadState = resolveHomeLoadState({ fetch: fetchStatus, ...counts });
  const publicStats = buildHomePublicStats({ fetch: fetchStatus, ...counts });

  const plannerFavoritesEnabled = isPlannerFavoritesEnabled(workToolsAccess);
  const plannerVerifiedWorkLinks = plannerFavoritesEnabled
    ? getPlannerVerifiedWorkLinks()
    : [];

  return (
    <AppShell>
      <HomeClient
        claimDocuments={claimSurface.guideDocuments}
        insurers={insurerSurface.items}
        knowledgeArticles={
          knowledgeResult.status === "ok" ? knowledgeResult.articles : []
        }
        loadState={loadState}
        plannerFavoritesEnabled={plannerFavoritesEnabled}
        plannerVerifiedWorkLinks={plannerVerifiedWorkLinks}
        publicStats={publicStats}
      />
    </AppShell>
  );
}
