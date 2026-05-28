import Link from "next/link";
import {
  ContentSection,
  PremiumCard,
  SectionHeader
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductPreview } from "@/components/product-preview";
import { getPublicInsurers } from "@/lib/public/insurers";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { claimFormFiles } from "@/lib/content/claim-form-files";
import { customerMessageTemplates } from "@/lib/content/message-templates";
import { disclosureLinkEntries } from "@/lib/content/disclosure-links";

export const dynamic = "force-dynamic";

const practiceSteps = [
  {
    step: "Step 1",
    title: "보험사 선택",
    desc: "검색이나 카테고리 필터로 필요한 보험사를 먼저 선택합니다."
  },
  {
    step: "Step 2",
    title: "청구안내 및 서류 확인",
    desc: "해당 보험사의 필요 서류 목록과 공식 PDF 양식을 확인합니다."
  },
  {
    step: "Step 3",
    title: "공시·약관으로 기준 확인",
    desc: "상품공시실 링크와 약관 자료를 통해 최종 보장 기준을 검토합니다."
  },
  {
    step: "Step 4",
    title: "고객 안내 문구 활용",
    desc: "안내 상황에 맞는 신뢰감 있는 템플릿 멘트를 참고하여 발송합니다."
  }
];

const featureCards = [
  {
    title: "보험사 바로가기",
    desc: "보험사별 공식 홈페이지, 전산실, 고객센터 번호 및 청구 팩스 주소를 빠르게 연결합니다.",
    href: "/directory",
    actionLabel: "디렉토리 이동"
  },
  {
    title: "업무 도구",
    desc: "숨은보험금찾기, 인수·청구 검색, 보험·금융 계산기, 자동차·화재·공문서 링크를 한곳에서 확인합니다.",
    href: "/work-tools",
    actionLabel: "도구 열기"
  },
  {
    title: "청구서류 창고",
    desc: "분산된 보험사별 청구 양식 PDF와 유형별 제출 필수 서류를 한눈에 모아 제공합니다.",
    href: "/claim-documents",
    actionLabel: "서류 목록 검색"
  },
  {
    title: "공시·약관 링크센터",
    desc: "보험사 공식 상품공시실과 보장 범위 해석을 돕는 공식 약관 링크를 한곳에서 지원합니다.",
    href: "/disclosure-links",
    actionLabel: "공시실 연결"
  },
  {
    title: "고객 안내 문구",
    desc: "고객 안내 및 보완 요청 시 사용하기 좋은 차분하고 정중한 메시지 템플릿을 제공합니다.",
    href: "/message-templates",
    actionLabel: "문구 템플릿 확인"
  }
];

export default async function Home() {
  const [insurerResult, claimResult] = await Promise.all([
    getPublicInsurers(),
    getPublicClaimDocuments(),
  ]);

  const insurerCount = insurerResult.status === "ok" ? insurerResult.insurers.length : 0;
  const guideDocumentCount = claimResult.status === "ok" ? claimResult.data.length : 0;
  const claimDocumentCount = guideDocumentCount + claimFormFiles.length;
  const messageTemplateCount = customerMessageTemplates.length;
  const disclosureLinkCount = disclosureLinkEntries.length;

  return (
    <main className="overflow-hidden bg-[#f7f1e5] text-[#18202b]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative border-b border-[#d9c9a8] bg-[#102235] text-[#fbf7ee]">
        <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border border-[#aa8137]/60 px-3 py-1 text-sm font-medium text-[#e6d4ac]">
              전국 보험설계사를 위한 실무 포털 & 성장 플랫폼
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.15] tracking-normal text-[#fbf7ee] sm:text-5xl lg:text-6xl whitespace-pre-line">
              보험설계사의 실무를{"\n"}빠르게 정리하는 업무 포털
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#d8d0c3] sm:text-lg whitespace-pre-line">
              흩어진 보험사 링크, 청구안내, 공시·약관, 고객 안내 문구를{"\n"}한곳에서 빠르게 확인할 수 있도록 정리했습니다.
            </p>
            <p className="mt-4 max-w-2xl text-xs leading-5 text-[#d8c08f]">
              ※ 플래너데스크는 설계사의 단순 반복 검색을 줄이기 위한 B2B 공용 실무 포털입니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center bg-[#aa8137] px-6 py-3 text-sm font-semibold text-[#102235] transition hover:bg-[#c19b58] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#aa8137]"
                href="/directory"
              >
                보험사 디렉토리 바로가기
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center border border-[#efe4cf]/35 px-6 py-3 text-sm font-semibold text-[#fbf7ee] transition hover:border-[#efe4cf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#efe4cf]"
                href="/work-tools"
              >
                업무 도구 열기
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center border border-[#efe4cf]/35 px-6 py-3 text-sm font-semibold text-[#fbf7ee] transition hover:border-[#efe4cf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#efe4cf]"
                href="/claim-documents"
              >
                청구서류 검색하기
              </Link>
            </div>
          </div>
          
          {/* Quick Execution Board */}
          <ProductPreview
            insurerCount={insurerCount}
            claimDocumentCount={claimDocumentCount}
            messageTemplateCount={messageTemplateCount}
            disclosureLinkCount={disclosureLinkCount}
          />
        </div>
      </section>

      {/* 실무 흐름 안내 Section */}
      <ContentSection>
        <SectionHeader
          eyebrow="Planner Practice Guide"
          title="자주 찾는 실무 업무의 유기적 흐름"
          description="플래너데스크를 이용해 보험사 선택부터 고객 안내 메시지 발송까지의 실무 동선을 단축해 보세요."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {practiceSteps.map((item) => (
            <div className="border border-[#d9c9a8] bg-white p-5 shadow-[0_4px_12px_rgba(16,34,53,0.03)]" key={item.step}>
              <span className="text-xs font-bold text-[#7a612d] uppercase tracking-wider">{item.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-[#102235]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5f6670] break-keep">{item.desc}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* 주요 기능 카드 Section */}
      <section className="border-y border-[#d9c9a8] bg-[#fbf7ee]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Key Features"
            title="실무에 바로 사용하는 핵심 포털 도구"
            description="링크 팜이 아닌 실무 단위로 구조화된 콘텐츠를 통해 필요한 정보를 1초 만에 찾을 수 있습니다."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {featureCards.map((card) => (
              <PremiumCard key={card.title}>
                <h3 className="text-xl font-semibold text-[#102235]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4f5661] min-h-[72px] break-keep">
                  {card.desc}
                </p>
                <div className="mt-5">
                  <Link
                    href={card.href}
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#173f36] bg-white px-4 py-2 text-xs font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
                  >
                    {card.actionLabel}
                  </Link>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      {/* 자료 기준 안내 및 안전 경계 Section */}
      <ContentSection>
        <SectionHeader
          eyebrow="Safety & Integrity Boundary"
          title="안전하고 정확한 정보를 위한 실무 안내"
          description="플래너데스크의 모든 정보는 설계사의 실무를 돕기 위한 공용 참고 자료입니다."
        />
        <div className="mt-8 rounded-xl border-l-4 border-[#aa8137] bg-white p-5 shadow-[0_4px_12px_rgba(16,34,53,0.03)]">
          <p className="text-base font-semibold text-[#102235]">자료 활용 시 주의 사항</p>
          <p className="mt-2 text-sm leading-relaxed text-[#5f6670] break-keep">
            보험사별 서류와 접수 기준은 상시 변경될 수 있습니다. 최종 제출 전 해당 보험사 공식 안내를 함께 확인해 주세요.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#5f6670] break-keep">
            플래너데스크는 설계사가 활용하기 좋은 포털을 지향하며, 개별 보험금 지급 가능 여부 판정, 금액 추정, 손해사정 등의 어떠한 심사 권한도 갖지 않습니다.
          </p>
        </div>
      </ContentSection>

      <Footer />
    </main>
  );
}
