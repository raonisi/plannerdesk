import Link from "next/link";
import { borders, shadows, textStyles } from "@/lib/design-system";

const featuredMiniLinks = [
  { href: "/directory", label: "보험사 전산" },
  { href: "/work-tools", label: "업무 도구" },
  { href: "/claim-documents", label: "청구서류" },
  { href: "/disclosure-links", label: "공시·약관" },
  { href: "/message-templates", label: "고객 안내문" },
] as const;

const coreWorkLinks = [
  {
    href: "/directory",
    title: "보험사 전산",
    description:
      "보험사 전산 접속, 고객센터, 헬프데스크, 청구 팩스, 카드납 정보를 한곳에서 확인합니다.",
  },
  {
    href: "/work-tools",
    title: "업무 도구",
    description:
      "인수예외질환 검색, 보험나이·BMI·실손·대출·세금 계산기를 빠르게 확인합니다.",
  },
  {
    href: "/claim-documents",
    title: "청구서류",
    description:
      "보험사별·청구 유형별 필요서류를 정리해 실무 확인 시간을 줄입니다.",
  },
  {
    href: "/disclosure-links",
    title: "공시·약관",
    description:
      "상품공시, 약관, 공식 안내 링크를 기준 중심으로 확인합니다.",
  },
  {
    href: "/message-templates",
    title: "고객 안내문",
    description:
      "고객에게 보낼 안내 문구를 상황별로 빠르게 참고합니다.",
  },
] as const;

const roadmapItems = [
  {
    title: "실무 자료",
    description:
      "반복되는 질문과 업무 기준을 검색 가능한 지식 아카이브로 준비 중입니다.",
  },
  {
    title: "설계사 커뮤니티",
    description:
      "검증 설계사 Q&A, 실무 노하우, 업무 팁 공유 공간으로 확장 예정입니다.",
  },
  {
    title: "AI 답변 보조",
    description:
      "검수된 지식 아카이브를 바탕으로 답변 초안을 돕는 기능을 준비 중입니다.",
  },
] as const;

const quickToolGroups = [
  {
    title: "인수·보종 검색",
    items: [
      { id: "disease-search", label: "인수예외질환 검색" },
      { id: "surgery-code", label: "수술분류표" },
      { id: "disease-code", label: "질병코드" },
    ],
  },
  {
    title: "보험계산기",
    items: [
      { id: "silbi-calculator", label: "실손보험금" },
      { id: "insurance-age", label: "보험나이" },
      { id: "bmi-calculator", label: "BMI" },
    ],
  },
  {
    title: "금융계산기",
    items: [
      { id: "currency-value", label: "화폐가치" },
      { id: "loan", label: "대출 이자" },
      { id: "savings", label: "예·적금 이자" },
      { id: "net-salary", label: "연봉 실수령액" },
    ],
  },
  {
    title: "세금 간편 계산",
    items: [
      { id: "earned-tax", label: "근로소득세" },
      { id: "comp-tax", label: "종합소득세" },
      { id: "inheritance-tax", label: "상속세" },
      { id: "card-deduction", label: "카드·현금 공제" },
      { id: "vat", label: "부가세·공급가액" },
    ],
  },
] as const;

function StatusBadge({
  children,
  tone,
}: {
  children: string;
  tone: "active" | "info" | "muted";
}) {
  const toneClasses = {
    active: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
    info: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
    muted: "border-[#d6d8dc] bg-[#f4f5f6] text-[#5f6670]",
  } as const;

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function CoreWorkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-xl border ${borders.divider} bg-[#fbf7ee] p-5 shadow-[0_10px_25px_rgba(16,34,53,0.03)] transition hover:border-[#aa8137]/50 hover:shadow-[0_15px_35px_rgba(16,34,53,0.05)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#102235]">{title}</h3>
        <StatusBadge tone="active">사용 가능</StatusBadge>
      </div>
      <p className="mt-2 flex-1 break-keep text-sm leading-relaxed text-[#4f5661]">
        {description}
      </p>
      <Link
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#173f36] bg-white text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
        href={href}
      >
        바로가기
      </Link>
    </article>
  );
}

function RoadmapCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-xl border ${borders.divider} bg-[#f7f1e5]/80 p-5 opacity-90`}
    >
      <p className="sr-only">{title} 영역은 아직 준비 중입니다.</p>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#5f6670]">{title}</h3>
        <StatusBadge tone="muted">준비 중</StatusBadge>
      </div>
      <p className="mt-2 break-keep text-sm leading-relaxed text-[#5f6670]">
        {description}
      </p>
      <p className="mt-5 text-xs font-medium text-[#8a909a]">
        서비스 준비가 완료되면 안내드립니다.
      </p>
    </article>
  );
}

export function MajorWorkLinks() {
  return (
    <section aria-labelledby="major-work-links-heading" className="space-y-8">
      <header className="space-y-2">
        <p className={textStyles.eyebrow}>WORK HUB</p>
        <h2
          className="text-2xl font-semibold text-[#102235] sm:text-3xl"
          id="major-work-links-heading"
        >
          주요 업무 링크
        </h2>
        <p className="max-w-3xl break-keep text-sm leading-6 text-[#4f5661] sm:text-base">
          반복해서 찾는 전산, 업무 도구, 청구서류, 공시·약관, 고객 안내문을
          한곳에서 정리합니다.
        </p>
      </header>

      <article
        className={`rounded-2xl border ${borders.divider} bg-gradient-to-br from-[#fbf7ee] via-[#f7f1e5] to-[#fbf7ee] p-5 sm:p-6 ${shadows.card}`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a612d]">
              Today&apos;s hub
            </p>
            <h3 className="text-xl font-semibold text-[#102235] sm:text-2xl">
              오늘의 업무 진입점
            </h3>
            <p className="max-w-2xl break-keep text-sm leading-6 text-[#4f5661]">
              보험사 전산, 업무 도구, 청구서류, 공시·약관, 고객 안내문까지
              설계사가 자주 확인하는 업무를 빠르게 연결합니다.
            </p>
          </div>
          <nav
            aria-label="오늘의 업무 진입점 바로가기"
            className="flex flex-wrap gap-2"
          >
            {featuredMiniLinks.map((item) => (
              <Link
                className="inline-flex min-h-10 items-center rounded-full border border-[#d9c9a8] bg-white/90 px-4 py-2 text-sm font-semibold text-[#173f36] transition hover:border-[#aa8137] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
                href={item.href}
                key={item.href + item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </article>

      <div>
        <h3 className="sr-only">핵심 업무 링크</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {coreWorkLinks.map((item) => (
            <CoreWorkCard
              description={item.description}
              href={item.href}
              key={item.href}
              title={item.title}
            />
          ))}
        </div>
      </div>

      <article
        className={`rounded-2xl border ${borders.divider} bg-white p-5 sm:p-6 ${shadows.card}`}
      >
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-2">
            <p className={textStyles.eyebrow}>QUICK TOOLS</p>
            <h3 className="break-keep text-xl font-semibold text-[#102235] sm:text-2xl">
              보험학교 주요 업무 링크를 플래너데스크 도구로 정리했습니다
            </h3>
            <p className="break-keep text-sm leading-6 text-[#4f5661]">
              GA 전산시스템은 제외하고, 설계사가 반복해서 여는 검색·계산
              업무를 한 화면에서 사용할 수 있게 구성했습니다.
            </p>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#173f36] bg-[#173f36] px-5 text-sm font-semibold text-[#fbf7ee] transition hover:bg-[#0f2f28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
              href="/work-tools"
            >
              업무 도구 열기
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickToolGroups.map((group) => (
              <section
                className="rounded-xl border border-[#e7ddc9] bg-[#fbf7ee] p-4"
                key={group.title}
              >
                <h4 className="text-sm font-semibold text-[#102235]">
                  {group.title}
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Link
                      className="inline-flex min-h-9 items-center rounded-full border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#173f36] transition hover:border-[#aa8137] hover:bg-[#fff7e6]"
                      href={`/work-tools#${item.id}`}
                      key={item.id}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>

      <article
        className={`rounded-xl border ${borders.divider} bg-white p-5 sm:p-6 ${shadows.card}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-[#102235]">
                수정 요청 / 제보
              </h3>
              <StatusBadge tone="info">안내</StatusBadge>
            </div>
            <p className="break-keep text-sm leading-6 text-[#4f5661]">
              잘못된 링크, 번호, 서류 정보를 발견했다면 검수 요청으로
              남겨주세요.
            </p>
            <p className="break-keep text-xs leading-5 text-[#5f6670]">
              고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하지 마세요.
            </p>
          </div>
          <a
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-lg border border-[#aa8137] bg-[#fff7e6] px-5 text-sm font-semibold text-[#7a612d] transition hover:bg-[#fbf0d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] sm:self-center"
            href="#feedback-section"
          >
            제보 안내
          </a>
        </div>
      </article>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-[#5f6670]">
          확장 예정 영역
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {roadmapItems.map((item) => (
            <RoadmapCard
              description={item.description}
              key={item.title}
              title={item.title}
            />
          ))}
        </div>
      </div>

      <aside
        className="rounded-xl border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] p-5 sm:p-6"
        role="note"
      >
        <h3 className="text-sm font-semibold text-[#102235]">
          안전한 실무 참고 기준
        </h3>
        <p className="mt-3 break-keep text-sm leading-6 text-[#5f6670]">
          플래너데스크는 보험금 지급 여부를 판단하지 않으며, 보험금 지급
          금액을 산정하지 않습니다.
          <br />
          고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하지 마세요.
          <br />본 자료는 설계사 실무 참고와 업무 정리를 위한 용도입니다.
        </p>
      </aside>
    </section>
  );
}
