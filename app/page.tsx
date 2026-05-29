import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
    <main className="min-h-screen bg-[#F8F7F3] text-[#17202A] flex flex-col justify-between">
      <div>
        <Header />
        <HomeClient insurers={insurers} claimDocuments={claimDocuments} />
      </div>
      <Footer />
    </main>
  );
}
