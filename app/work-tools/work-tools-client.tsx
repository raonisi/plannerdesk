"use client";

import { useMemo, useState } from "react";

type ToolId =
  | "disease-search"
  | "surgery-code"
  | "disease-code"
  | "silbi-calculator"
  | "insurance-age"
  | "bmi-calculator"
  | "currency-value"
  | "loan"
  | "savings"
  | "net-salary"
  | "earned-tax"
  | "comp-tax"
  | "inheritance-tax"
  | "card-deduction"
  | "vat";

type ToolItem = {
  id: ToolId;
  label: string;
  description: string;
};

type ToolGroup = {
  title: string;
  description: string;
  tools: ToolItem[];
};

type InputSpec = {
  key: "a" | "b" | "c";
  label: string;
  placeholder?: string;
};

const toolGroups: ToolGroup[] = [
  {
    title: "인수·보종 검색",
    description: "업무 중 자주 확인하는 질환명, 수술분류, 질병코드 기준을 빠르게 찾습니다.",
    tools: [
      {
        id: "disease-search",
        label: "인수예외질환 검색",
        description: "질환 키워드로 인수 확인 시 챙길 항목을 정리합니다.",
      },
      {
        id: "surgery-code",
        label: "수술분류표·수술코드",
        description: "수술명 키워드로 분류 확인 때 참고할 항목을 찾습니다.",
      },
      {
        id: "disease-code",
        label: "질병코드 검색",
        description: "KCD 예시 코드와 질환명을 빠르게 찾습니다.",
      },
    ],
  },
  {
    title: "보험계산기",
    description: "고객 안내 전 빠르게 확인하는 보험 실무 계산 도구입니다.",
    tools: [
      {
        id: "silbi-calculator",
        label: "실손보험금",
        description: "진료비와 공제액 기준으로 참고 보험금을 계산합니다.",
      },
      {
        id: "insurance-age",
        label: "보험나이",
        description: "생년월일 기준 만 나이와 보험나이를 계산합니다.",
      },
      {
        id: "bmi-calculator",
        label: "BMI",
        description: "키와 체중으로 BMI와 표준체중을 계산합니다.",
      },
    ],
  },
  {
    title: "금융계산기",
    description: "상담 중 함께 묻는 생활 금융 계산을 보조합니다.",
    tools: [
      {
        id: "currency-value",
        label: "화폐가치",
        description: "현재 금액의 미래 가치를 물가상승률 기준으로 계산합니다.",
      },
      {
        id: "loan",
        label: "대출 이자",
        description: "원리금균등 기준 월 납입액과 총 이자를 계산합니다.",
      },
      {
        id: "savings",
        label: "예·적금 이자",
        description: "예치금, 금리, 기간 기준 만기 참고금액을 계산합니다.",
      },
      {
        id: "net-salary",
        label: "연봉 실수령액",
        description: "연봉 기준 대략적인 월 실수령액을 계산합니다.",
      },
    ],
  },
  {
    title: "세금 간편 계산",
    description: "세무 상담이 아닌 실무 참고용 간단 계산식을 제공합니다.",
    tools: [
      {
        id: "earned-tax",
        label: "근로소득세",
        description: "과세표준 구간별 간편 근로소득세를 계산합니다.",
      },
      {
        id: "comp-tax",
        label: "종합소득세",
        description: "종합소득 과세표준 기준 간편 세액을 계산합니다.",
      },
      {
        id: "inheritance-tax",
        label: "상속세",
        description: "상속재산과 공제액 기준 참고 세액을 계산합니다.",
      },
      {
        id: "card-deduction",
        label: "카드·현금 소득공제",
        description: "연봉과 사용액 기준 공제 가능 참고액을 계산합니다.",
      },
      {
        id: "vat",
        label: "부가세·공급가액",
        description: "합계금액에서 공급가액과 부가세를 분리합니다.",
      },
    ],
  },
];

const searchableItems = [
  {
    group: "인수예외질환",
    keyword: "고혈압",
    detail: "복약 여부, 최근 혈압, 합병증, 입원·검사 이력 확인",
  },
  {
    group: "인수예외질환",
    keyword: "당뇨",
    detail: "HbA1c, 합병증, 인슐린 사용 여부, 최근 치료 이력 확인",
  },
  {
    group: "인수예외질환",
    keyword: "갑상선 결절",
    detail: "초음파 결과, 조직검사 여부, 추적관찰 주기 확인",
  },
  {
    group: "수술분류",
    keyword: "백내장",
    detail: "렌즈 삽입, 양안 수술, 약관상 수술분류표 확인",
  },
  {
    group: "수술분류",
    keyword: "대장용종",
    detail: "내시경 절제 여부, 병리 결과, 수술 인정 기준 확인",
  },
  {
    group: "질병코드",
    keyword: "I10",
    detail: "본태성 고혈압 예시 코드. 진단서 원본 입력 금지",
  },
  {
    group: "질병코드",
    keyword: "E11",
    detail: "2형 당뇨병 예시 코드. 최종 코드는 의료기관 자료 확인",
  },
];

const moneyFormatter = new Intl.NumberFormat("ko-KR");

function money(value: number) {
  if (!Number.isFinite(value)) return "-";
  return `${moneyFormatter.format(Math.max(0, Math.round(value)))}원`;
}

function numberValue(value: string) {
  return Number(value) || 0;
}

function taxByBracket(value: number) {
  const brackets = [
    [14_000_000, 0.06, 0],
    [50_000_000, 0.15, 1_260_000],
    [88_000_000, 0.24, 5_760_000],
    [150_000_000, 0.35, 15_440_000],
    [300_000_000, 0.38, 19_940_000],
    [500_000_000, 0.4, 25_940_000],
    [1_000_000_000, 0.42, 35_940_000],
    [Infinity, 0.45, 65_940_000],
  ] as const;
  const [, rate, deduction] =
    brackets.find(([limit]) => value <= limit) ?? brackets[0];
  return value * rate - deduction;
}

function getToolCopy(id: ToolId) {
  return toolGroups.flatMap((group) => group.tools).find((tool) => tool.id === id);
}

function inputsForTool(id: ToolId): InputSpec[] {
  switch (id) {
    case "insurance-age":
      return [{ key: "a", label: "생년월일 8자리", placeholder: "예: 19900115" }];
    case "bmi-calculator":
      return [
        { key: "a", label: "키(cm)", placeholder: "예: 170" },
        { key: "b", label: "체중(kg)", placeholder: "예: 65" },
      ];
    case "silbi-calculator":
      return [
        { key: "a", label: "총 진료비", placeholder: "예: 120000" },
        { key: "b", label: "본인부담 공제", placeholder: "예: 20000" },
        { key: "c", label: "추가 공제", placeholder: "예: 0" },
      ];
    case "currency-value":
      return [
        { key: "a", label: "현재 금액", placeholder: "예: 10000000" },
        { key: "b", label: "연 상승률(%)", placeholder: "예: 3" },
        { key: "c", label: "기간(년)", placeholder: "예: 10" },
      ];
    case "loan":
      return [
        { key: "a", label: "대출 원금", placeholder: "예: 100000000" },
        { key: "b", label: "연 금리(%)", placeholder: "예: 4.5" },
        { key: "c", label: "기간(개월)", placeholder: "예: 360" },
      ];
    case "savings":
      return [
        { key: "a", label: "예치금", placeholder: "예: 10000000" },
        { key: "b", label: "연 금리(%)", placeholder: "예: 3.5" },
        { key: "c", label: "기간(개월)", placeholder: "예: 12" },
      ];
    case "net-salary":
      return [{ key: "a", label: "연봉", placeholder: "예: 50000000" }];
    case "inheritance-tax":
      return [
        { key: "a", label: "상속재산", placeholder: "예: 1000000000" },
        { key: "b", label: "공제액", placeholder: "예: 500000000" },
      ];
    case "card-deduction":
      return [
        { key: "a", label: "연봉", placeholder: "예: 60000000" },
        { key: "b", label: "카드 사용액", placeholder: "예: 18000000" },
        { key: "c", label: "현금 사용액", placeholder: "예: 3000000" },
      ];
    case "vat":
      return [{ key: "a", label: "합계금액", placeholder: "예: 110000" }];
    default:
      return [{ key: "a", label: "과세표준", placeholder: "예: 50000000" }];
  }
}

export function WorkToolsClient() {
  const [activeTool, setActiveTool] = useState<ToolId>("disease-search");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {toolGroups.map((group) => (
            <div
              className="rounded-xl border border-[#e7ddc9] bg-[#fbf7ee] p-4"
              key={group.title}
            >
              <h2 className="text-base font-semibold text-[#102235]">
                {group.title}
              </h2>
              <p className="mt-2 break-keep text-xs leading-5 text-[#5f6670]">
                {group.description}
              </p>
              <div className="mt-4 grid gap-2">
                {group.tools.map((tool) => (
                  <a
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      activeTool === tool.id
                        ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee]"
                        : "border-[#d9c9a8] bg-white text-[#173f36] hover:border-[#aa8137]"
                    }`}
                    href={`#${tool.id}`}
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    {tool.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ToolPanel id={activeTool} />

      <aside className="rounded-xl border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] p-5">
        <h2 className="text-sm font-semibold text-[#102235]">안전 안내</h2>
        <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
          이 도구는 설계사 업무 참고용입니다. 보험금 지급 여부, 지급 금액,
          손해사정, 의료 진단 해석을 판단하지 않습니다. 고객 개인정보, 의료자료,
          진단서 원본은 입력하지 마세요.
        </p>
      </aside>
    </div>
  );
}

function ToolPanel({ id }: { id: ToolId }) {
  if (id === "disease-search" || id === "surgery-code" || id === "disease-code") {
    return <SearchTool id={id} />;
  }

  return <CalculatorTool id={id} />;
}

function SearchTool({ id }: { id: ToolId }) {
  const [query, setQuery] = useState("");
  const filtered = searchableItems.filter((item) => {
    const target = `${item.group} ${item.keyword} ${item.detail}`.toLocaleLowerCase(
      "ko-KR",
    );
    return target.includes(query.trim().toLocaleLowerCase("ko-KR"));
  });
  const title =
    id === "disease-search"
      ? "인수예외질환 검색"
      : id === "surgery-code"
        ? "수술분류표·수술코드 검색"
        : "질병코드 검색";

  return (
    <section
      className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6"
      id={id}
    >
      <h2 className="text-2xl font-semibold text-[#102235]">{title}</h2>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-[#303845]">검색어</span>
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-[#d9c9a8] bg-white px-4 text-base outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/20"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 고혈압, 백내장, I10"
          type="search"
          value={query}
        />
      </label>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {filtered.map((item) => (
          <article
            className="rounded-xl border border-[#e7ddc9] bg-[#fbf7ee] p-4"
            key={`${item.group}-${item.keyword}`}
          >
            <p className="text-xs font-semibold text-[#7a612d]">{item.group}</p>
            <h3 className="mt-1 text-lg font-semibold text-[#102235]">
              {item.keyword}
            </h3>
            <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
              {item.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CalculatorTool({ id }: { id: ToolId }) {
  const [values, setValues] = useState({ a: "", b: "", c: "" });
  const inputs = inputsForTool(id);
  const copy = getToolCopy(id);

  const result = useMemo(() => {
    const x = numberValue(values.a);
    const y = numberValue(values.b);
    const z = numberValue(values.c);

    switch (id) {
      case "bmi-calculator": {
        const heightM = x / 100;
        const bmi = heightM > 0 ? y / (heightM * heightM) : 0;
        return `BMI ${bmi ? bmi.toFixed(1) : "-"} / 표준체중 ${
          heightM ? (heightM * heightM * 22).toFixed(1) : "-"
        }kg`;
      }
      case "insurance-age": {
        if (!/^\d{8}$/.test(values.a)) return "생년월일 8자리를 입력하세요.";
        const birth = new Date(
          Number(values.a.slice(0, 4)),
          Number(values.a.slice(4, 6)) - 1,
          Number(values.a.slice(6, 8)),
        );
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const birthday = new Date(
          today.getFullYear(),
          birth.getMonth(),
          birth.getDate(),
        );
        if (today < birthday) age -= 1;
        const halfBirthday = new Date(
          today.getFullYear(),
          birth.getMonth() + 6,
          birth.getDate(),
        );
        const insuranceAge = today >= halfBirthday ? age + 1 : age;
        return `만 나이 ${age}세 / 보험나이 ${insuranceAge}세`;
      }
      case "silbi-calculator":
        return `참고 보험금: ${money(Math.max(0, x - y - z))}`;
      case "currency-value":
        return `${z || 10}년 후 가치: ${money(x * Math.pow(1 + y / 100, z || 10))}`;
      case "loan": {
        const monthlyRate = y / 100 / 12;
        const months = z || 12;
        const payment =
          monthlyRate > 0
            ? (x * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1)
            : x / months;
        return `월 납입액 ${money(payment)} / 총 이자 ${money(payment * months - x)}`;
      }
      case "savings": {
        const months = z || 12;
        const amount = x * Math.pow(1 + y / 100, months / 12);
        return `만기 참고금액: ${money(amount)}`;
      }
      case "net-salary":
        return `월 실수령 참고: ${money((x * 0.83) / 12)}`;
      case "earned-tax":
      case "comp-tax":
        return `간편 산출세액: ${money(taxByBracket(x))}`;
      case "inheritance-tax":
        return `참고 상속세: ${money(taxByBracket(Math.max(0, x - y)))}`;
      case "card-deduction":
        return `공제 가능 참고액: ${money(Math.max(0, y + z - x * 0.25) * 0.15)}`;
      case "vat":
        return `공급가액 ${money(x / 1.1)} / 부가세 ${money(x - x / 1.1)}`;
      default:
        return "-";
    }
  }, [id, values]);

  return (
    <section
      className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6"
      id={id}
    >
      <h2 className="text-2xl font-semibold text-[#102235]">{copy?.label}</h2>
      <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
        {copy?.description}
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {inputs.map((input) => (
          <NumberInput
            key={input.key}
            label={input.label}
            onChange={(value) =>
              setValues((current) => ({ ...current, [input.key]: value }))
            }
            placeholder={input.placeholder}
            value={values[input.key]}
          />
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-[#d9c9a8] bg-[#fbf7ee] p-4">
        <p className="text-xs font-semibold text-[#7a612d]">계산 결과</p>
        <p className="mt-2 break-keep text-lg font-semibold text-[#102235]">
          {result}
        </p>
      </div>
    </section>
  );
}

function NumberInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#303845]">{label}</span>
      <input
        className="mt-2 min-h-12 w-full rounded-lg border border-[#d9c9a8] bg-white px-4 text-base outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/20"
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value.replace(/[^0-9.]/g, ""))}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
