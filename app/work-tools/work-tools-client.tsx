"use client";

import { useMemo, useState } from "react";

type ToolKind = "stats" | "search" | "calculator" | "external" | "newsletter";

type ToolId =
  | "planner-stats"
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
  | "vat"
  | "hospital-pharmacy"
  | "silson24"
  | "hidden-insurance"
  | "lost-health-standard"
  | "car-face-quote"
  | "car-einsmarket"
  | "car-premium-factor"
  | "car-kidi-register"
  | "car-fault-ratio"
  | "fire-special-building"
  | "building-register"
  | "elevator-info"
  | "gov-resident"
  | "hometax-income"
  | "court-family"
  | "knia-agent"
  | "klia-agent"
  | "iaa-product"
  | "insurance-institute"
  | "nonlife-textbook"
  | "nonlife-mock"
  | "life-textbook"
  | "life-mock"
  | "variable-textbook"
  | "variable-mock"
  | "insurer-newsletter";

type ToolItem = {
  id: ToolId;
  label: string;
  description: string;
  kind: ToolKind;
  href?: string;
  source?: string;
};

type ToolGroup = {
  title: string;
  description: string;
  tools: ToolItem[];
};

type InputSpec = {
  key: "a" | "b" | "c" | "d";
  label: string;
  placeholder?: string;
};

const STORAGE_KEY = "plannerdesk.workTools.favorites";

const toolGroups: ToolGroup[] = [
  {
    title: "통계 활용 세일즈",
    description: "상담 소재와 보장 점검 대화를 만들 때 쓸 수 있는 실무형 통계 카드입니다.",
    tools: [
      {
        id: "planner-stats",
        label: "플래너데스크 통계실",
        description: "연령·가구·위험 키워드별 상담 소재와 고객 안내 문구를 확인합니다.",
        kind: "stats",
      },
    ],
  },
  {
    title: "인수예외질환 검색",
    description: "질환명, 수술명, 상병코드를 검색해 확인 포인트를 빠르게 봅니다.",
    tools: [
      {
        id: "disease-search",
        label: "인수예외질환 검색",
        description: "질환 키워드로 인수 확인 시 챙길 항목을 정리합니다.",
        kind: "search",
      },
    ],
  },
  {
    title: "보험계산기",
    description: "고객 안내 전 빠르게 계산하는 보험 실무 도구입니다.",
    tools: [
      {
        id: "silbi-calculator",
        label: "실손보험금",
        description: "총 진료비, 급여·비급여, 공제액을 입력해 참고 금액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "insurance-age",
        label: "보험나이",
        description: "생년월일 기준 만 나이와 보험나이를 계산합니다.",
        kind: "calculator",
      },
      {
        id: "bmi-calculator",
        label: "BMI",
        description: "키와 체중으로 BMI와 표준체중을 계산합니다.",
        kind: "calculator",
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
        description: "현재 금액의 미래 가치와 현재 구매력을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "loan",
        label: "대출 이자",
        description: "원리금균등 기준 월 납입액과 총 이자를 계산합니다.",
        kind: "calculator",
      },
      {
        id: "savings",
        label: "예/적금 이자",
        description: "예치금 또는 월 납입액 기준 만기 금액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "net-salary",
        label: "연봉 실수령액",
        description: "연봉 기준 대략적인 월 실수령액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "earned-tax",
        label: "간편 근로소득세",
        description: "과세표준 구간별 간편 산출세액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "comp-tax",
        label: "간편 종합소득세",
        description: "종합소득 과세표준 기준 간편 산출세액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "inheritance-tax",
        label: "간편 상속세",
        description: "상속재산과 공제액 기준 참고 세액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "card-deduction",
        label: "카드/현금 소득공제",
        description: "연봉과 카드·현금 사용액 기준 공제 가능 참고액을 계산합니다.",
        kind: "calculator",
      },
      {
        id: "vat",
        label: "부가세/공급가액",
        description: "합계금액에서 공급가액과 부가세를 분리합니다.",
        kind: "calculator",
      },
    ],
  },
  {
    title: "보험금청구",
    description: "청구 업무에 자주 쓰는 검색 도구와 공식 사이트입니다.",
    tools: [
      {
        id: "surgery-code",
        label: "수술분류표 검색",
        description: "수술명으로 약관 분류 확인 시 참고할 항목을 검색합니다.",
        kind: "search",
      },
      {
        id: "disease-code",
        label: "상병코드(KCD) 검색",
        description: "상병코드와 질환명을 검색합니다.",
        kind: "search",
      },
      {
        id: "hospital-pharmacy",
        label: "병원/약국찾기",
        description: "건강보험심사평가원 병원·약국 찾기 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://www.hira.or.kr/ra/hosp/getHealthMap.do?pgmid=HIRAA030002010000",
        source: "건강보험심사평가원",
      },
      {
        id: "silson24",
        label: "실손24(전산간편청구)",
        description: "실손24 전산간편청구 공식 서비스로 연결합니다.",
        kind: "external",
        href: "https://www.silson24.or.kr/claim/web/",
        source: "실손24",
      },
      {
        id: "hidden-insurance",
        label: "숨은보험금찾기",
        description: "생명보험협회·손해보험협회 내보험찾아줌 공식 서비스로 연결합니다.",
        kind: "external",
        href: "https://cont.insure.or.kr/cont_web/intro.do",
        source: "내보험찾아줌",
      },
    ],
  },
  {
    title: "실손보험",
    description: "실손보험 인수기준과 비교 공시 확인에 쓰는 공식 링크입니다.",
    tools: [
      {
        id: "lost-health-standard",
        label: "실손 인수기준 확인",
        description: "손해보험협회 실손의료보험 인수기준 공시 페이지로 연결합니다.",
        kind: "external",
        href: "https://kpub.knia.or.kr/productDisc/lostHealth/lostHealthDisclosure.do",
        source: "손해보험협회",
      },
    ],
  },
  {
    title: "자동차보험",
    description: "자동차보험 비교, 할인/할증, 과실비율 확인 공식 링크입니다.",
    tools: [
      {
        id: "car-face-quote",
        label: "대면 간편견적",
        description: "손해보험협회 자동차보험 공시/간편견적 페이지로 연결합니다.",
        kind: "external",
        href: "https://kpub.knia.or.kr/carInsuranceDisc/insurance/carInsurance.do",
        source: "손해보험협회",
      },
      {
        id: "car-einsmarket",
        label: "보험다모아 비교견적",
        description: "보험다모아 자동차보험 비교견적 서비스로 연결합니다.",
        kind: "external",
        href: "https://e-insmarket.or.kr/aimt/aimtRealIntro.knia",
        source: "보험다모아",
      },
      {
        id: "car-premium-factor",
        label: "할인/할증요인 조회",
        description: "자동차보험료 할인·할증요인 조회 시스템으로 연결합니다.",
        kind: "external",
        href: "https://prem.kidi.or.kr:1443/",
        source: "보험개발원",
      },
      {
        id: "car-kidi-register",
        label: "보험개발원 등록",
        description: "자동차보험 관련 등록 업무 페이지로 연결합니다.",
        kind: "external",
        href: "https://iics.kidi.or.kr/insuUserReal/viewInsuUserReal.do",
        source: "보험개발원",
      },
      {
        id: "car-fault-ratio",
        label: "과실비율 정보포털",
        description: "자동차사고 과실비율 인정기준 포털로 연결합니다.",
        kind: "external",
        href: "https://accident.knia.or.kr/",
        source: "손해보험협회",
      },
    ],
  },
  {
    title: "화재보험",
    description: "건물 확인과 화재보험 실무에 쓰는 공식 조회 링크입니다.",
    tools: [
      {
        id: "fire-special-building",
        label: "특수건물 정보조회",
        description: "한국화재보험협회 특수건물 정보조회 서비스로 연결합니다.",
        kind: "external",
        href: "https://bridge.kfpa.or.kr/#/",
        source: "한국화재보험협회",
      },
      {
        id: "building-register",
        label: "건축물대장",
        description: "정부24 건축물대장 발급/열람 서비스로 연결합니다.",
        kind: "external",
        href: "https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=15000000098&HighCtgCD=A02004002&Mcode=10205",
        source: "정부24",
      },
      {
        id: "elevator-info",
        label: "승강기 정보 열람",
        description: "국가승강기정보센터 승강기 정보 열람으로 연결합니다.",
        kind: "external",
        href: "https://www.elevator.go.kr/opn/MainPage.do",
        source: "국가승강기정보센터",
      },
    ],
  },
  {
    title: "온라인공문서",
    description: "고객이 직접 발급해야 하는 주요 공문서 공식 사이트입니다.",
    tools: [
      {
        id: "gov-resident",
        label: "정부24(등본/초본)",
        description: "주민등록표 등본/초본 발급 페이지로 연결합니다.",
        kind: "external",
        href: "https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000015&HighCtgCD=A01010001&tp_seq=01&Mcode=10200",
        source: "정부24",
      },
      {
        id: "hometax-income",
        label: "홈택스(소득금액증명)",
        description: "국세청 홈택스 민원증명 화면으로 연결합니다.",
        kind: "external",
        href: "https://hometax.go.kr/websquare/websquare.html?w2xPath=/ui/pp/index_pp.xml&menuCd=index3",
        source: "국세청 홈택스",
      },
      {
        id: "court-family",
        label: "법원(가족관계증명)",
        description: "전자가족관계등록시스템으로 연결합니다.",
        kind: "external",
        href: "https://efamily.scourt.go.kr/index.jsp",
        source: "대한민국 법원",
      },
    ],
  },
  {
    title: "모집종사자",
    description: "모집종사자 조회, 교육, 상품비교에 쓰는 공식 링크입니다.",
    tools: [
      {
        id: "knia-agent",
        label: "손해보험협회",
        description: "손해보험 모집종사자 관련 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://isi.knia.or.kr/index.do",
        source: "손해보험협회",
      },
      {
        id: "klia-agent",
        label: "생명보험협회",
        description: "생명보험 모집종사자 관련 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://fp.insure.or.kr/",
        source: "생명보험협회",
      },
      {
        id: "iaa-product",
        label: "대리점협회 상품비교",
        description: "보험대리점협회 상품비교 시스템으로 연결합니다.",
        kind: "external",
        href: "https://pcs.iaa.or.kr/comm/login.do",
        source: "보험대리점협회",
      },
      {
        id: "insurance-institute",
        label: "보험연수원",
        description: "보험연수원 공식 교육 포털로 연결합니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
    ],
  },
  {
    title: "시험교재/모의고사",
    description: "자격시험 준비에 필요한 공식 교육기관 링크입니다.",
    tools: [
      {
        id: "nonlife-textbook",
        label: "손해보험교재",
        description: "손해보험 모집종사자 시험 교재 확인용 공식 교육 포털입니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
      {
        id: "nonlife-mock",
        label: "손해보험모의고사",
        description: "손해보험 모집종사자 시험 학습/평가 메뉴 확인용 공식 교육 포털입니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
      {
        id: "life-textbook",
        label: "생명보험교재",
        description: "생명보험 모집종사자 시험 교재 확인용 공식 교육 포털입니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
      {
        id: "life-mock",
        label: "생명보험모의고사",
        description: "생명보험 모집종사자 시험 학습/평가 메뉴 확인용 공식 교육 포털입니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
      {
        id: "variable-textbook",
        label: "변액보험교재",
        description: "변액보험 판매관리사 시험 교재 확인용 공식 교육 포털입니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
      {
        id: "variable-mock",
        label: "변액보험모의고사",
        description: "변액보험 판매관리사 시험 학습/평가 메뉴 확인용 공식 교육 포털입니다.",
        kind: "external",
        href: "https://www.in.or.kr",
        source: "보험연수원",
      },
    ],
  },
  {
    title: "보험사소식지",
    description: "월별 보험사 소식지와 업데이트 확인 흐름입니다.",
    tools: [
      {
        id: "insurer-newsletter",
        label: "2026년 5월",
        description: "보험사 소식지 확인용 체크리스트와 공시·약관 링크센터 연결을 제공합니다.",
        kind: "newsletter",
      },
    ],
  },
];

const searchData = [
  {
    type: "disease-search",
    group: "인수예외질환",
    keyword: "고혈압",
    aliases: "혈압 본태성 I10",
    detail: "복약 여부, 최근 혈압, 합병증, 입원·검사 이력, 건강검진 수치를 확인합니다.",
  },
  {
    type: "disease-search",
    group: "인수예외질환",
    keyword: "당뇨",
    aliases: "혈당 HbA1c E11 인슐린",
    detail: "HbA1c, 합병증, 인슐린 사용 여부, 최근 치료 이력, 입원 이력을 확인합니다.",
  },
  {
    type: "disease-search",
    group: "인수예외질환",
    keyword: "갑상선 결절",
    aliases: "갑상샘 초음파 조직검사",
    detail: "초음파 결과, 조직검사 여부, 크기 변화, 추적관찰 주기를 확인합니다.",
  },
  {
    type: "disease-search",
    group: "인수예외질환",
    keyword: "고지혈증",
    aliases: "이상지질혈증 콜레스테롤",
    detail: "복약 여부, 최근 지질검사, 동반 질환, 심혈관 질환 이력을 확인합니다.",
  },
  {
    type: "surgery-code",
    group: "수술분류",
    keyword: "백내장",
    aliases: "수정체 렌즈 삽입",
    detail: "렌즈 삽입, 양안 수술 여부, 약관상 수술분류표와 가입 시기별 기준을 확인합니다.",
  },
  {
    type: "surgery-code",
    group: "수술분류",
    keyword: "대장용종",
    aliases: "내시경 절제 선종",
    detail: "내시경 절제 여부, 병리 결과, 수술 인정 기준, 약관상 분류표를 확인합니다.",
  },
  {
    type: "surgery-code",
    group: "수술분류",
    keyword: "충수염",
    aliases: "맹장 충수절제",
    detail: "충수절제술 시행 여부, 입원 기간, 수술확인서 기재명을 확인합니다.",
  },
  {
    type: "disease-code",
    group: "상병코드",
    keyword: "I10",
    aliases: "고혈압 본태성",
    detail: "본태성 고혈압 예시 코드입니다. 최종 코드는 의료기관 발급자료를 확인합니다.",
  },
  {
    type: "disease-code",
    group: "상병코드",
    keyword: "E11",
    aliases: "2형 당뇨병",
    detail: "2형 당뇨병 예시 코드입니다. 세부 코드는 진단서/진료확인서와 다를 수 있습니다.",
  },
  {
    type: "disease-code",
    group: "상병코드",
    keyword: "C50",
    aliases: "유방암 악성신생물",
    detail: "유방의 악성신생물 예시 코드입니다. 병기와 조직검사 정보는 해석하지 않습니다.",
  },
] as const;

const statsCards = [
  {
    title: "5060 보장 점검",
    stat: "실손·진단비·간병 리스크",
    script: "최근 병원비보다 회복 기간의 생활비 공백까지 같이 점검해보시면 좋습니다.",
  },
  {
    title: "자녀 독립 전 가구",
    stat: "가족 생활비 방어",
    script: "가장의 소득 공백이 생겼을 때 6개월 생활비를 버틸 구조인지 확인해보겠습니다.",
  },
  {
    title: "자영업자 상담",
    stat: "소득 증빙·상해·배상책임",
    script: "사업장은 사람, 건물, 배상책임 리스크가 같이 움직이기 때문에 한 번에 점검하는 편이 좋습니다.",
  },
  {
    title: "자동차보험 갱신",
    stat: "할인·할증 요인 확인",
    script: "갱신 전 할인/할증 요인을 확인하면 보험료 변동 설명이 훨씬 쉬워집니다.",
  },
] as const;

const newsletterItems = [
  "월별 보험사 상품 개정·인수기준 변경 여부 확인",
  "고객 안내에 쓰기 전 해당 보험사 공식 공지와 약관 링크 재확인",
  "판매 권유 문구가 아니라 설계사 내부 실무 메모로만 활용",
  "불확실한 내용은 수정 요청/제보로 남겨 검수 대상에 올리기",
] as const;

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

function allTools() {
  return toolGroups.flatMap((group) => group.tools);
}

function getToolCopy(id: ToolId) {
  return allTools().find((tool) => tool.id === id);
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
        { key: "b", label: "급여 공제", placeholder: "예: 10000" },
        { key: "c", label: "비급여 공제", placeholder: "예: 20000" },
        { key: "d", label: "보상 제외액", placeholder: "예: 0" },
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
        { key: "a", label: "초기 예치금", placeholder: "예: 5000000" },
        { key: "b", label: "월 납입액", placeholder: "예: 300000" },
        { key: "c", label: "연 금리(%)", placeholder: "예: 3.5" },
        { key: "d", label: "기간(개월)", placeholder: "예: 24" },
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
  const [activeTool, setActiveTool] = useState<ToolId>("planner-stats");
  const [favorites, setFavorites] = useState<ToolId[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ToolId[]) : [];
  });

  function toggleFavorite(id: ToolId) {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const favoriteTools = allTools().filter((tool) => favorites.includes(tool.id));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a612d]">
              Work Links
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#102235]">
              주요 업무 링크 전체
            </h2>
            <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
              보험학교 주요업무링크 항목 중 전산 로그인 그룹만 제외하고, 플래너데스크
              안에서 실행할 수 있는 기능과 공식 외부 링크로 다시 구성했습니다.
            </p>
          </div>
          <p className="rounded-full border border-[#d9c9a8] bg-[#fbf7ee] px-4 py-2 text-xs font-semibold text-[#7a612d]">
            {allTools().length}개 업무 기능
          </p>
        </div>
      </section>

      {favoriteTools.length > 0 ? (
        <section className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5">
          <h2 className="text-sm font-semibold text-[#102235]">즐겨찾기</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {favoriteTools.map((tool) => (
              <ToolChip
                active={activeTool === tool.id}
                favorite
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                onFavorite={() => toggleFavorite(tool.id)}
                tool={tool}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {toolGroups.map((group) => (
          <article
            className="rounded-xl border border-[#e7ddc9] bg-white p-4 shadow-[0_8px_22px_rgba(16,34,53,0.03)]"
            key={group.title}
          >
            <h2 className="text-base font-semibold text-[#102235]">
              {group.title}
            </h2>
            <p className="mt-2 break-keep text-xs leading-5 text-[#5f6670]">
              {group.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.tools.map((tool) => (
                <ToolChip
                  active={activeTool === tool.id}
                  favorite={favorites.includes(tool.id)}
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  onFavorite={() => toggleFavorite(tool.id)}
                  tool={tool}
                />
              ))}
            </div>
          </article>
        ))}
      </section>

      <ToolPanel id={activeTool} />

      <aside className="rounded-xl border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] p-5">
        <h2 className="text-sm font-semibold text-[#102235]">안전 안내</h2>
        <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
          계산 결과와 검색 결과는 설계사 업무 참고용입니다. 보험금 지급 여부,
          지급 금액, 손해사정, 의료 진단 해석을 판단하지 않습니다. 고객 개인정보,
          의료자료, 진단서 원본은 입력하지 마세요.
        </p>
      </aside>
    </div>
  );
}

function ToolChip({
  active,
  favorite,
  onClick,
  onFavorite,
  tool,
}: {
  active: boolean;
  favorite: boolean;
  onClick: () => void;
  onFavorite: () => void;
  tool: ToolItem;
}) {
  return (
    <span
      className={`inline-flex min-h-10 overflow-hidden rounded-full border text-xs font-semibold ${
        active
          ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee]"
          : "border-[#d9c9a8] bg-[#fbf7ee] text-[#173f36]"
      }`}
    >
      <button className="px-3 py-2" onClick={onClick} type="button">
        {tool.label}
      </button>
      <button
        aria-label={`${tool.label} 즐겨찾기 ${favorite ? "해제" : "추가"}`}
        className={`border-l px-2 ${active ? "border-[#fbf7ee]/25" : "border-[#d9c9a8]"}`}
        onClick={onFavorite}
        type="button"
      >
        {favorite ? "★" : "☆"}
      </button>
    </span>
  );
}

function ToolPanel({ id }: { id: ToolId }) {
  const copy = getToolCopy(id);
  if (!copy) return null;
  if (copy.kind === "stats") return <StatsTool />;
  if (copy.kind === "search") return <SearchTool id={id} />;
  if (copy.kind === "calculator") return <CalculatorTool id={id} />;
  if (copy.kind === "newsletter") return <NewsletterTool copy={copy} />;
  return <ExternalTool copy={copy} />;
}

function StatsTool() {
  const [keyword, setKeyword] = useState("");
  const filtered = statsCards.filter((card) =>
    `${card.title} ${card.stat} ${card.script}`
      .toLocaleLowerCase("ko-KR")
      .includes(keyword.toLocaleLowerCase("ko-KR")),
  );

  return (
    <PanelShell
      description="통계를 그대로 복사하는 화면이 아니라, 고객 상담에서 쓸 수 있는 보장 점검 소재로 정리했습니다."
      id="planner-stats"
      title="플래너데스크 통계실"
    >
      <label className="block">
        <span className="text-sm font-semibold text-[#303845]">상담 키워드</span>
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-[#d9c9a8] bg-white px-4 text-base outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/20"
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="예: 자동차, 자영업자, 5060"
          value={keyword}
        />
      </label>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {filtered.map((card) => (
          <article
            className="rounded-xl border border-[#e7ddc9] bg-[#fbf7ee] p-4"
            key={card.title}
          >
            <p className="text-xs font-semibold text-[#7a612d]">{card.stat}</p>
            <h3 className="mt-1 text-lg font-semibold text-[#102235]">
              {card.title}
            </h3>
            <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
              {card.script}
            </p>
          </article>
        ))}
      </div>
    </PanelShell>
  );
}

function SearchTool({ id }: { id: ToolId }) {
  const [query, setQuery] = useState("");
  const filtered = searchData.filter((item) => {
    const typeMatches = item.type === id;
    const target = `${item.group} ${item.keyword} ${item.aliases} ${item.detail}`.toLocaleLowerCase(
      "ko-KR",
    );
    return typeMatches && target.includes(query.trim().toLocaleLowerCase("ko-KR"));
  });
  const copy = getToolCopy(id);

  return (
    <PanelShell description={copy?.description ?? ""} id={id} title={copy?.label ?? ""}>
      <label className="block">
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
    </PanelShell>
  );
}

function CalculatorTool({ id }: { id: ToolId }) {
  const [values, setValues] = useState({ a: "", b: "", c: "", d: "" });
  const inputs = inputsForTool(id);
  const copy = getToolCopy(id);

  const result = useMemo(() => {
    const x = numberValue(values.a);
    const y = numberValue(values.b);
    const z = numberValue(values.c);
    const w = numberValue(values.d);

    switch (id) {
      case "bmi-calculator": {
        const heightM = x / 100;
        const bmi = heightM > 0 ? y / (heightM * heightM) : 0;
        const status =
          bmi >= 25 ? "비만 범위" : bmi >= 23 ? "과체중 범위" : bmi >= 18.5 ? "정상 범위" : "저체중 범위";
        return `BMI ${bmi ? bmi.toFixed(1) : "-"} (${bmi ? status : "-"}) / 표준체중 ${
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
        const birthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
        if (today < birthday) age -= 1;
        const nextBirthday = today < birthday ? birthday : new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
        const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86_400_000);
        const insuranceAge = daysToBirthday <= 183 ? age + 1 : age;
        return `만 나이 ${age}세 / 보험나이 ${insuranceAge}세 / 다음 생일까지 ${daysToBirthday}일`;
      }
      case "silbi-calculator":
        return `참고 금액: ${money(Math.max(0, x - y - z - w))}`;
      case "currency-value": {
        const years = z || 10;
        const future = x * Math.pow(1 + y / 100, years);
        const presentPower = x / Math.pow(1 + y / 100, years);
        return `${years}년 후 명목가치 ${money(future)} / 현재 구매력 기준 ${money(presentPower)}`;
      }
      case "loan": {
        const monthlyRate = y / 100 / 12;
        const months = z || 12;
        const payment =
          monthlyRate > 0
            ? (x * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1)
            : x / months;
        return `월 납입액 ${money(payment)} / 총 이자 ${money(payment * months - x)} / 총 상환 ${money(payment * months)}`;
      }
      case "savings": {
        const months = w || 12;
        const monthlyRate = z / 100 / 12;
        const depositFuture = x * Math.pow(1 + monthlyRate, months);
        const monthlyFuture =
          monthlyRate > 0 ? y * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) : y * months;
        const totalPrincipal = x + y * months;
        const amount = depositFuture + monthlyFuture;
        return `만기금액 ${money(amount)} / 원금 ${money(totalPrincipal)} / 이자 ${money(amount - totalPrincipal)}`;
      }
      case "net-salary": {
        const estimatedDeductionRate = x >= 80_000_000 ? 0.2 : x >= 50_000_000 ? 0.17 : 0.14;
        return `월 실수령 참고: ${money((x * (1 - estimatedDeductionRate)) / 12)} / 공제율 가정 ${(estimatedDeductionRate * 100).toFixed(0)}%`;
      }
      case "earned-tax":
      case "comp-tax":
        return `간편 산출세액: ${money(taxByBracket(x))}`;
      case "inheritance-tax":
        return `참고 상속세: ${money(taxByBracket(Math.max(0, x - y)))} / 과세표준 ${money(Math.max(0, x - y))}`;
      case "card-deduction":
        return `공제 가능 참고액: ${money(Math.max(0, y + z - x * 0.25) * 0.15)}`;
      case "vat":
        return `공급가액 ${money(x / 1.1)} / 부가세 ${money(x - x / 1.1)}`;
      default:
        return "-";
    }
  }, [id, values]);

  return (
    <PanelShell description={copy?.description ?? ""} id={id} title={copy?.label ?? ""}>
      <div className="grid gap-3 md:grid-cols-4">
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
    </PanelShell>
  );
}

function ExternalTool({ copy }: { copy: ToolItem }) {
  return (
    <PanelShell description={copy.description} id={copy.id} title={copy.label}>
      <div className="rounded-xl border border-[#e7ddc9] bg-[#fbf7ee] p-5">
        <p className="text-xs font-semibold text-[#7a612d]">공식 출처</p>
        <p className="mt-1 text-lg font-semibold text-[#102235]">{copy.source}</p>
        <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
          보험학교 링크를 재사용하지 않고, 플래너데스크에서 별도로 정리한 공식
          기관 링크입니다.
        </p>
        <a
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#173f36] bg-[#173f36] px-5 text-sm font-semibold text-[#fbf7ee] transition hover:bg-[#0f2f28]"
          href={copy.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          공식 사이트 열기
        </a>
      </div>
    </PanelShell>
  );
}

function NewsletterTool({ copy }: { copy: ToolItem }) {
  return (
    <PanelShell description={copy.description} id={copy.id} title={copy.label}>
      <div className="grid gap-3 md:grid-cols-2">
        {newsletterItems.map((item) => (
          <div
            className="rounded-xl border border-[#e7ddc9] bg-[#fbf7ee] p-4 text-sm font-semibold text-[#102235]"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
      <a
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#173f36] bg-[#173f36] px-5 text-sm font-semibold text-[#fbf7ee] transition hover:bg-[#0f2f28]"
        href="/disclosure-links"
      >
        공시·약관 링크센터에서 확인
      </a>
    </PanelShell>
  );
}

function PanelShell({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section
      className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6"
      id={id}
    >
      <h2 className="text-2xl font-semibold text-[#102235]">{title}</h2>
      <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
        {description}
      </p>
      <div className="mt-5">{children}</div>
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
