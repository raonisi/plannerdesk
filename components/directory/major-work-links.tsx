import Link from "next/link";
import { WorkToolsPlannerNotice } from "@/components/content/work-tools-planner-notice";
import { textStyles } from "@/lib/design-system";

const featuredMiniLinks = [
  { href: "/directory", label: "보험사 전산" },
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
      "실무 Q&A, 업무 노하우, 업무 팁 공유 공간으로 확장 예정입니다.",
  },
  {
    title: "AI 답변 보조",
    description:
      "지식 아카이브를 바탕으로 답변 초안을 돕는 기능을 준비 중입니다.",
  },
] as const;

const quickToolGroups = [
  {
    title: "통계·인수 검색",
    items: [
      { id: "planner-stats", label: "통계실" },
      { id: "disease-search", label: "인수예외질환" },
      { id: "surgery-code", label: "수술분류표" },
      { id: "disease-code", label: "상병코드" },
    ],
  },
  {
    title: "보험금청구",
    items: [
      { id: "hospital-pharmacy", label: "병원/약국찾기" },
      { id: "silson24", label: "실손24" },
      { id: "hidden-insurance", label: "숨은보험금찾기" },
      { id: "lost-health-standard", label: "실손 인수기준" },
    ],
  },
  {
    title: "보험·금융 계산기",
    items: [
      { id: "silbi-calculator", label: "실손보험금" },
      { id: "insurance-age", label: "보험나이" },
      { id: "bmi-calculator", label: "BMI" },
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
  {
    title: "자동차·화재보험",
    items: [
      { id: "car-face-quote", label: "대면 간편견적" },
      { id: "car-einsmarket", label: "보험다모아" },
      { id: "car-premium-factor", label: "할인/할증" },
      { id: "car-fault-ratio", label: "과실비율" },
      { id: "fire-special-building", label: "특수건물" },
      { id: "building-register", label: "건축물대장" },
      { id: "elevator-info", label: "승강기" },
    ],
  },
  {
    title: "공문서·모집·학습",
    items: [
      { id: "gov-resident", label: "정부24" },
      { id: "hometax-income", label: "홈택스" },
      { id: "court-family", label: "가족관계" },
      { id: "knia-agent", label: "손보협회" },
      { id: "klia-agent", label: "생보협회" },
      { id: "insurance-institute", label: "보험연수원" },
      { id: "insurer-newsletter", label: "보험사소식지" },
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
    active: "border-indigo-200 bg-indigo-50 text-indigo-700",
    info: "border-slate-200 bg-slate-100 text-slate-700",
    muted: "border-slate-200 bg-slate-50 text-slate-500",
  } as const;

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${toneClasses[tone]}`}
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
      className={`flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <StatusBadge tone="active">사용 가능</StatusBadge>
      </div>
      <p className="mt-3 flex-1 break-keep text-sm leading-relaxed text-slate-600">
        {description}
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
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
      className={`flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50/80 p-6 opacity-90`}
    >
      <p className="sr-only">{title} 영역은 아직 준비 중입니다.</p>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-500">{title}</h3>
        <StatusBadge tone="muted">준비 중</StatusBadge>
      </div>
      <p className="mt-3 break-keep text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      <p className="mt-6 text-xs font-medium text-slate-400">
        서비스 준비가 완료되면 안내드립니다.
      </p>
    </article>
  );
}

export function MajorWorkLinks() {
  return (
    <section aria-labelledby="major-work-links-heading" className="space-y-10">
      <header className="space-y-3">
        <p className={textStyles.eyebrow}>오늘의 업무 진입점</p>
        <h2
          className="text-2xl font-bold text-slate-900 sm:text-3xl"
          id="major-work-links-heading"
        >
          주요 업무 링크
        </h2>
        <p className="max-w-3xl break-keep text-sm leading-7 text-slate-600 sm:text-base">
          반복해서 찾는 전산, 업무 도구, 청구서류, 공시·약관, 고객 안내문을
          한곳에서 정리합니다.
        </p>
      </header>

      <article
        className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-6 sm:p-8 shadow-sm`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className={textStyles.eyebrow}>바로가기</p>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
              오늘의 업무 진입점
            </h3>
            <p className="max-w-2xl break-keep text-sm leading-6 text-slate-600">
              보험사 전산, 업무 도구, 청구서류, 공시·약관, 고객 안내문까지
              설계사가 자주 확인하는 업무를 빠르게 연결합니다.
            </p>
          </div>
          <nav
            aria-label="오늘의 업무 진입점 바로가기"
            className="flex flex-wrap gap-3 mt-2 lg:mt-0"
          >
            {featuredMiniLinks.map((item) => (
              <Link
                className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
        className={`rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm`}
      >
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            <p className={textStyles.eyebrow}>자주 쓰는 업무 도구</p>
            <h3 className="break-keep text-xl font-bold text-slate-900 sm:text-2xl leading-snug">
              자주 쓰는 업무 도구를 한 화면에서 정리했습니다
            </h3>
            <p className="break-keep text-sm leading-relaxed text-slate-600">
              전산 로그인 그룹은 제외하고, 설계사가 반복해서 여는 검색·계산
              업무를 한 화면에서 사용할 수 있게 구성했습니다.
            </p>
            <div className="pt-4">
              <WorkToolsPlannerNotice />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickToolGroups.map((group) => (
              <section
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                key={group.title}
              >
                <h4 className="text-sm font-bold text-slate-900">
                  {group.title}
                </h4>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <span
                      className="inline-flex min-h-9 items-center rounded-full border border-dashed border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500"
                      key={item.id}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>

      <article
        className={`rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                수정 요청 / 제보
              </h3>
              <StatusBadge tone="info">안내</StatusBadge>
            </div>
            <p className="break-keep text-sm leading-6 text-slate-600 mt-2">
              잘못된 링크, 번호, 서류 정보를 발견했다면 정보 수정 요청으로
              남겨주세요.
            </p>
            <p className="break-keep text-xs leading-5 text-slate-500">
              고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하지 마세요.
            </p>
          </div>
          <a
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 sm:self-center mt-2 sm:mt-0"
            href="#feedback-section"
          >
            제보 안내
          </a>
        </div>
      </article>

      <div>
        <h3 className="mb-5 text-sm font-bold text-slate-500">
          확장 예정 영역
        </h3>
        <div className="grid gap-5 md:grid-cols-3">
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
        className="rounded-xl border border-slate-200 border-l-4 border-l-slate-400 bg-slate-50 p-6 sm:p-8"
        role="note"
      >
        <h3 className="text-sm font-bold text-slate-900">
          안전한 실무 참고 기준
        </h3>
        <p className="mt-3 break-keep text-sm leading-relaxed text-slate-600">
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
