import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { getPublicKnowledgeArticles } from "@/lib/public/knowledge-articles";
import { AppShell } from "@/components/app-shell";
import type { HomePublicStats } from "@/components/dashboard/home-public-stats-strip";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [insurerResult, claimResult, knowledgeResult] = await Promise.all([
    getPublicInsurers(),
    getPublicClaimDocuments(),
    getPublicKnowledgeArticles(),
  ]);

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
        insurers={insurers}
        claimDocuments={claimDocuments}
        knowledgeArticles={knowledgeArticles}
        publicStats={publicStats}
      />
    </AppShell>
  );
}
