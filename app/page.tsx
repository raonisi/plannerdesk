import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { FeatureGrid } from "@/components/feature-grid";
import { ProductPreview } from "@/components/product-preview";

const pillars = [
  {
    label: "보험사 실무 디렉터리",
    title: "흩어진 보험사 업무 정보를 한 화면으로",
    description:
      "담당 설계사가 자주 찾는 고객센터, 지점, 청구 채널, 업무 링크를 신뢰 가능한 구조로 정리하는 공간입니다."
  },
  {
    label: "청구 서류 라이브러리",
    title: "고객 안내 전에 먼저 확인하는 서류 기준",
    description:
      "보험금 청구에 필요한 기본 서류, 상황별 참고 자료, 안내 문구를 설계사 관점에서 탐색할 수 있게 준비합니다."
  },
  {
    label: "고객 메시지 템플릿",
    title: "설명은 정확하게, 톤은 더 차분하게",
    description:
      "계약 관리, 청구 안내, 보장 점검, 미팅 리마인드 등 반복되는 고객 커뮤니케이션을 업무용 템플릿으로 정리합니다."
  }
];

const futureModules = [
  "검증된 설계사 커뮤니티",
  "실무 리서치 브리핑",
  "고객 응대 AI 보조 도구",
  "상품 비교 워크스페이스"
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
              플래너데스크
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#efe4cf] sm:text-2xl">
              보험설계사의 하루를 시작하는 실무 플랫폼
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#d8d0c3] sm:text-lg">
              보험사 업무 정보, 청구 서류, 고객 메시지, 성장 리소스를
              차분하고 신뢰할 수 있는 업무 화면으로 정리합니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center bg-[#aa8137] px-5 py-3 text-sm font-semibold text-[#102235] transition hover:bg-[#c19b58]"
                href="#modules"
              >
                플랫폼 살펴보기
              </a>
              <a
                className="inline-flex items-center justify-center border border-[#efe4cf]/35 px-5 py-3 text-sm font-semibold text-[#fbf7ee] transition hover:border-[#efe4cf]"
                href="#roadmap"
              >
                출시 범위 확인
              </a>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-b border-[#d9c9a8] bg-[#fbf7ee]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:px-10">
          {pillars.map((pillar) => (
            <article key={pillar.label} className="border-l border-[#aa8137] pl-5">
              <p className="text-sm font-semibold text-[#7a612d]">{pillar.label}</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#102235]">
                {pillar.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#4f5661]">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="modules" className="bg-[#f7f1e5]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
              MVP Workspace
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#102235] sm:text-4xl">
              출시 첫 화면은 정보 탐색과 업무 준비에 집중합니다.
            </h2>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <section id="roadmap" className="border-y border-[#d9c9a8] bg-[#173f36] text-[#fbf7ee]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]">
              Future Platform
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              커뮤니티와 AI는 검증, 보안, 정책 설계 이후 단계적으로 엽니다.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {futureModules.map((module) => (
              <div key={module} className="border border-[#efe4cf]/20 bg-[#0f3029] p-5">
                <p className="text-lg font-semibold">{module}</p>
                <p className="mt-3 text-sm leading-6 text-[#d8d0c3]">
                  현재는 제품 방향을 보여주는 플레이스홀더이며, 개인정보와
                  민감 정보 처리 범위가 확정된 뒤 구현합니다.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#fbf7ee]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-6 border-y border-[#d9c9a8] py-10 md:grid-cols-[1fr_1.35fr]">
            <h2 className="text-3xl font-semibold leading-tight text-[#102235]">
              설계사 업무 플랫폼은 신뢰가 제품입니다.
            </h2>
            <p className="text-base leading-7 text-[#4f5661]">
              플래너데스크는 첫 배포부터 데이터 연결 없이 빌드되는 공개 랜딩
              페이지로 시작합니다. 이후 Neon PostgreSQL, 인증, 검증된
              커뮤니티, AI 도구는 별도 보안 검토와 제품 범위 확정 후
              도입합니다.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
