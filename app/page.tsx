import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { AppShell } from "@/components/app-shell";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [insurerResult, claimResult] = await Promise.all([
    getPublicInsurers(),
    getPublicClaimDocuments(),
  ]);

  const insurers = insurerResult.status === "ok" ? insurerResult.insurers : [];
  const claimDocuments = claimResult.status === "ok" ? claimResult.data : [];

  return (
    <AppShell>
      <HomeClient insurers={insurers} claimDocuments={claimDocuments} />
    </AppShell>
  );
}
