import Link from "next/link";
import {
  ContentSection,
  LinkButton,
  PremiumCard,
  SafetyNotice,
  SectionHeader
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductPreview } from "@/components/product-preview";

const problemItems = [
  "보험사 시스템과 업무 링크를 반복해서 다시 찾습니다.",
  "청구 양식과 필요 서류가 보험사별로 흩어져 있습니다.",
  "고객센터, 팩스, 우편 주소를 빠르게 확인하기 어렵습니다.",
  "공시, 약관, 소비자 안내 링크가 여러 경로로 분산됩니다.",
  "고객에게 보낼 안내 문구를 매번 새로 다듬어야 합니다.",
  "기존 사이트는 단순 링크 모음처럼 보여 신뢰와 맥락이 부족합니다."
];

const mvpModules = [
  {
    title: "보험사 바로가기",
    description: "보험사별 공식 채널, 청구 안내, 연락처를 검증 가능한 구조로 정리합니다.",
    status: "MVP",
    href: "/directory"
  },
  {
    title: "청구서류 창고",
    description: "청구 유형별 서류명, 설명, 주의 문구, 공식 출처를 함께 확인합니다.",
    status: "MVP",
    href: "/claim-documents"
  },
  {
    title: "공시·약관 링크센터",
    description: "상품공시, 약관, 청구 안내, 소비자 안내 링크를 업무 흐름에 맞게 모읍니다.",
    status: "MVP",
    href: "/disclosure-links"
  },
  {
    title: "고객 안내 문구",
    description: "반복되는 고객 커뮤니케이션을 전문적이고 조심스러운 톤으로 준비합니다.",
    status: "MVP",
    href: "/message-templates"
  },
  {
    title: "검수 예정 데이터 구조",
    description: "공개 전 검증 상태와 최종 확인일을 남길 수 있는 정보 구조를 먼저 세웁니다.",
    status: "검수 필요",
    href: null
  },
  {
    title: "인증 설계사 커뮤니티",
    description: "검증, 운영 정책, 신고 체계가 준비된 뒤 단계적으로 열 예정입니다.",
    status: "준비 중",
    href: null
  },
  {
    title: "AI 영업 도구",
    description: "민감 정보를 입력하지 않는 범위에서 문장 정리와 업무 리서치 보조부터 검토합니다.",
    status: "준비 중",
    href: null
  }
];

const differentiators = [
  "단순 링크 나열이 아니라 보험설계사 업무 단위로 정보를 구조화합니다.",
  "초안, 검증 완료, 재검토 필요 상태를 명확히 드러낼 수 있습니다.",
  "청구 관련 안전 경계를 제품 화면 안에서 함께 안내합니다.",
  "향후 인증 설계사 계정, 커뮤니티, SaaS 도구로 확장할 수 있는 기반입니다.",
  "모바일에서 빠르게 읽고 이동할 수 있는 프리미엄 업무 UI를 지향합니다."
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "무료 실무 포털",
    description: "보험사, 청구 서류, 공시 링크, 고객 안내 문구를 정적 페이지로 제공합니다."
  },
  {
    phase: "Phase 2",
    title: "인증 설계사 계정",
    description: "설계사 검증, 계정 정책, 개인정보 처리 기준을 확정한 뒤 도입합니다."
  },
  {
    phase: "Phase 3",
    title: "검증 설계사 커뮤니티",
    description: "운영 정책과 신고 체계를 갖춘 전문 커뮤니티를 단계적으로 엽니다."
  },
  {
    phase: "Phase 4",
    title: "AI 고객 메시지 도구",
    description: "보장·지급 결과를 단정하지 않는 안전한 문장 정리 도구를 검토합니다."
  },
  {
    phase: "Phase 5",
    title: "랜딩페이지 빌더와 팀 도구",
    description: "설계사 개인 브랜딩, 팀 운영, 업무 루틴 도구로 확장합니다."
  }
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#f7f1e5] text-[#18202b]">
      <Header />
      <section className="relative border-b border-[#d9c9a8] bg-[#102235] text-[#fbf7ee]">
        <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border border-[#aa8137]/60 px-3 py-1 text-sm font-medium text-[#e6d4ac]">
              전국 보험설계사를 위한 실무 포털 & 성장 플랫폼
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-normal text-[#fbf7ee] sm:text-6xl lg:text-7xl">
              보험설계사의 하루를 시작하는 실무 플랫폼
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#d8d0c3] sm:text-lg">
              플래너데스크는 보험설계사를 위한 업무 데스크입니다. 흩어진 보험사
              링크, 청구서류, 공시 자료, 고객 안내 문구를 한곳에 정리합니다.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d8c08f]">
              일반 고객용 보험 정보 사이트가 아니라, 설계사의 반복 업무를 줄이기
              위한 B2B SaaS 플랫폼입니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center bg-[#aa8137] px-5 py-3 text-sm font-semibold text-[#102235] transition hover:bg-[#c19b58]"
                href="/directory"
              >
                보험사 디렉터리 보기
              </Link>
              <Link
                className="inline-flex items-center justify-center border border-[#efe4cf]/35 px-5 py-3 text-sm font-semibold text-[#fbf7ee] transition hover:border-[#efe4cf]"
                href="/claim-documents"
              >
                청구서류 확인하기
              </Link>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <ContentSection>
        <SectionHeader
          eyebrow="Field Problem"
          title="현장의 문제는 정보가 없어서가 아니라, 매일 흩어져 있다는 점입니다."
          description="설계사는 고객을 만나기 전후로 같은 정보를 반복해서 찾습니다. 플래너데스크는 이 반복 검색을 업무 구조로 바꾸는 데서 시작합니다."
        />
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {problemItems.map((item) => (
            <div className="border-l border-[#aa8137] bg-[#fbf7ee] px-5 py-4" key={item}>
              <p className="text-base leading-7 text-[#303845]">{item}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <section className="border-y border-[#d9c9a8] bg-[#fbf7ee]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <SectionHeader
            eyebrow="Solution"
            title="플래너데스크는 설계사의 프리미엄 데일리 워크 데스크입니다."
            description="보험사 업무 정보, 서류 기준, 공식 링크, 고객 안내 문구를 검증 가능한 콘텐츠 구조로 정리하고, 향후 커뮤니티와 SaaS 도구로 확장합니다."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {["실무 포털", "검증 정보 구조", "모바일 업무 화면", "미래 SaaS 툴킷"].map((item) => (
              <PremiumCard key={item}>
                <p className="text-lg font-semibold text-[#102235]">{item}</p>
                <p className="mt-3 text-sm leading-6 text-[#4f5661]">
                  단순 링크가 아니라 설계사의 업무 흐름 안에서 바로 읽고 움직일 수
                  있는 구조를 지향합니다.
                </p>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      <ContentSection>
        <div id="modules">
          <SectionHeader
            eyebrow="Phase 1 MVP"
            title="첫 버전은 설계사가 매일 찾는 실무 자료를 안전하게 보여줍니다."
            description="현재 데이터는 초안 플레이스홀더이며, 공식 링크와 연락처는 공개 전 검증이 필요합니다."
          />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mvpModules.map((module) => (
            <PremiumCard key={module.title}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-semibold text-[#102235]">{module.title}</h3>
                <span className="whitespace-nowrap border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
                  {module.status}
                </span>
              </div>
              <p className="mt-4 text-base leading-7 text-[#4f5661]">
                {module.description}
              </p>
              {module.href ? (
                <div className="mt-5">
                  <LinkButton href={module.href}>페이지 열기</LinkButton>
                </div>
              ) : (
                <p className="mt-5 text-sm font-semibold text-[#7a612d]">준비 중</p>
              )}
            </PremiumCard>
          ))}
        </div>
      </ContentSection>

      <section className="border-y border-[#d9c9a8] bg-[#173f36] text-[#fbf7ee]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]">
              Not A Link Farm
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              링크 모음이 아니라, 설계사 업무를 위한 콘텐츠 아키텍처입니다.
            </h2>
          </div>
          <div className="grid gap-3">
            {differentiators.map((item) => (
              <div className="border border-[#efe4cf]/20 bg-[#0f3029] p-5" key={item}>
                <p className="text-base leading-7 text-[#efe4cf]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContentSection>
        <SectionHeader
          eyebrow="Safety Boundary"
          title="청구 관련 정보는 실무 참고용이며, 공식 안내가 우선합니다."
          description="플래너데스크는 정보 구조와 문장 정리를 돕지만 보험금 판단, 금액 추정, 손해사정 업무를 수행하지 않습니다."
        />
        <div className="mt-8">
          <SafetyNotice variant="claim" />
        </div>
      </ContentSection>

      <section id="roadmap" className="border-y border-[#d9c9a8] bg-[#fbf7ee]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Roadmap"
            title="무료 실무 포털에서 인증 설계사 SaaS 플랫폼으로 확장합니다."
            description="각 단계는 개인정보, 검증, 운영 정책을 먼저 정리한 뒤 순차적으로 도입합니다."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {roadmap.map((item) => (
              <div className="border border-[#d9c9a8] bg-[#f7f1e5] p-5" key={item.phase}>
                <p className="text-sm font-semibold text-[#7a612d]">{item.phase}</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-[#102235]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#4f5661]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102235] text-[#fbf7ee]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_1.1fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]">
              Start With MVP
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              오늘은 정리된 실무 페이지부터 확인해 보세요.
            </h2>
          </div>
          <div>
            <p className="text-base leading-7 text-[#d8d0c3]">
              가입 폼이나 저장 기능 없이, 현재 공개된 MVP 페이지를 통해
              플래너데스크가 지향하는 업무 구조를 먼저 볼 수 있습니다.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center bg-[#aa8137] px-5 py-3 text-sm font-semibold text-[#102235] transition hover:bg-[#c19b58]"
                href="/directory"
              >
                보험사 디렉터리
              </Link>
              <Link
                className="inline-flex items-center justify-center border border-[#efe4cf]/35 px-5 py-3 text-sm font-semibold text-[#fbf7ee] transition hover:border-[#efe4cf]"
                href="/message-templates"
              >
                고객 안내 문구
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
