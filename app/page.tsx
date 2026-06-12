import { getWorkToolsAccess } from "@/lib/auth/access";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { getPublicKnowledgeArticles } from "@/lib/public/knowledge-articles";
import { AppShell } from "@/components/app-shell";
import type { HomePublicStats } from "@/components/dashboard/home-public-stats-strip";
import { HomeClient } from "./home-client";
import { getPlannerVerifiedWorkLinks } from "@/lib/work-links/verified-catalog";

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

  const insurers = insurerResult.status === "ok" ? insurerResult.insurers : [];
  const claimDocuments = claimResult.status === "ok" ? claimResult.data : [];
  const knowledgeArticles =
    knowledgeResult.status === "ok" ? knowledgeResult.articles : [];

  const publicStats: HomePublicStats = {
    insurerCount: insurers.length,
    claimDocumentCount: claimDocuments.length,
    knowledgeArticleCount: knowledgeArticles.length,
  };

  return (
    <AppShell>
      <HomeClient
        claimDocuments={claimDocuments}
        insurers={insurers}
        knowledgeArticles={knowledgeArticles}
        plannerFavoritesEnabled={plannerFavoritesEnabled}
        plannerVerifiedWorkLinks={plannerVerifiedWorkLinks}
        publicStats={publicStats}
      />
    </AppShell>
  );
}
