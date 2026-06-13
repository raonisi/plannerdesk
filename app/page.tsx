import { getWorkToolsAccess } from "@/lib/auth/access";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { getPublicKnowledgeArticles } from "@/lib/public/knowledge-articles";
import { AppShell } from "@/components/app-shell";
import { HomeClient } from "./home-client";
import { getPlannerVerifiedWorkLinks } from "@/lib/work-links/verified-catalog";
import {
  buildHomePublicStats,
  resolveHomeDomainFetchStatus,
  resolveHomeLoadState,
  type HomeDataFetchSnapshot,
} from "@/lib/dashboard/home-data-state";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [insurerResult, claimResult, knowledgeResult, workToolsAccess] =
    await Promise.all([
      getPublicInsurers(),
      getPublicClaimDocuments(),
      getPublicKnowledgeArticles(),
      getWorkToolsAccess(),
    ]);
  const plannerFavoritesEnabled = isPlannerFavoritesEnabled(workToolsAccess);
  const plannerVerifiedWorkLinks = plannerFavoritesEnabled
    ? getPlannerVerifiedWorkLinks()
    : [];

  const fetchStatus: HomeDataFetchSnapshot = {
    insurers: resolveHomeDomainFetchStatus(insurerResult.status),
    claimDocuments: resolveHomeDomainFetchStatus(claimResult.status),
    knowledge: resolveHomeDomainFetchStatus(knowledgeResult.status),
  };

  const insurers =
    insurerResult.status === "ok" ? insurerResult.insurers : [];
  const claimDocuments =
    claimResult.status === "ok" ? claimResult.data : [];
  const knowledgeArticles =
    knowledgeResult.status === "ok" ? knowledgeResult.articles : [];

  const loadState = resolveHomeLoadState({
    fetch: fetchStatus,
    insurerCount: insurers.length,
    claimDocumentCount: claimDocuments.length,
    knowledgeArticleCount: knowledgeArticles.length,
  });

  const publicStats = buildHomePublicStats({
    fetch: fetchStatus,
    insurerCount: insurers.length,
    claimDocumentCount: claimDocuments.length,
    knowledgeArticleCount: knowledgeArticles.length,
  });

  return (
    <AppShell>
      <HomeClient
        claimDocuments={claimDocuments}
        insurers={insurers}
        knowledgeArticles={knowledgeArticles}
        loadState={loadState}
        plannerFavoritesEnabled={plannerFavoritesEnabled}
        plannerVerifiedWorkLinks={plannerVerifiedWorkLinks}
        publicStats={publicStats}
      />
    </AppShell>
  );
}
