"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, PieChart, Pie } from 'recharts';
import {
  TrendingUp,
  Calculator,
  Search as SearchIcon,
  ExternalLink,
  FolderOpen,
  Sparkles,
  Wrench,
} from "lucide-react";
import { CategoryPillBar } from "@/components/launcher/category-pill-bar";
import { SectionHeader } from "@/components/launcher/section-header";
import { ToolCard } from "@/components/launcher/tool-card";
import {
  WORK_TOOL_CATEGORIES,
  getCategoryLabelForTool,
  matchesWorkToolCategory,
} from "@/lib/tool-display";
import { EmptyState, SearchBar } from "@/components/content-page";
import {
  SILBI_CALC_DESCRIPTION,
  SILBI_CALC_TITLE,
  SILBI_GEN_TIPS,
  SILBI_REFERENCE_BALANCE_LABEL,
  SILBI_RESULT_SECTION_TITLE,
  WORK_TOOLS_CLAIM_BOUNDARY_NOTICE,
} from "@/lib/work-tools/claim-boundary-copy";

type ToolKind = "stats" | "search" | "calculator" | "external" | "newsletter" | "folder" | "internal";

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
  | "insurer-newsletter"
  | "nhis-health"
  | "nps-pension"
  | "fss-fine"
  | "efine-driver"
  | "payinfo"
  | "credit4u"
  | "claim-docs-guide"
  | "claim-channel-guide"
  | "claim-msg-guide"
  | "disclosure-guide"
  | "disclosure-msg-guide"
  | "request-msg-guide"
  | "hold-msg-guide"
  | "privacy-msg-guide";

type ToolItem = {
  id: ToolId;
  label: string;
  description: string;
  kind: ToolKind;
  href?: string;
  source?: string;
  auxText?: string;
};

type ToolGroup = {
  title: string;
  description: string;
  tools: ToolItem[];
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
        label: "실손 자기부담 참고",
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
    title: "공공/금융 조회",
    description: "고객 보장 분석 및 재무 설계 시 함께 확인하는 공공/금융기관 공식 링크입니다.",
    tools: [
      {
        id: "nhis-health",
        label: "국민건강보험(건강iN)",
        description: "고객의 건강검진 결과 및 진료 내역 확인을 위한 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://www.nhis.or.kr/",
        source: "국민건강보험공단",
      },
      {
        id: "nps-pension",
        label: "내연금알아보기",
        description: "고객의 예상 연금액 조회를 위한 국민연금공단 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://csa.nps.or.kr/",
        source: "국민연금공단",
      },
      {
        id: "fss-fine",
        label: "금융소비자포털 파인",
        description: "각종 금융상품 정보와 제도를 확인할 수 있는 금융감독원 공식 포털입니다.",
        kind: "external",
        href: "https://fine.fss.or.kr/",
        source: "금융감독원",
      },
      {
        id: "efine-driver",
        label: "경찰청 교통민원24",
        description: "운전경력증명서 발급 및 조회를 위한 경찰청 이파인 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://www.efine.go.kr/",
        source: "경찰청",
      },
      {
        id: "payinfo",
        label: "계좌정보통합관리(페이인포)",
        description: "휴면계좌 및 숨은 금융자산 조회를 위한 금융결제원 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://www.payinfo.or.kr/",
        source: "금융결제원",
      },
      {
        id: "credit4u",
        label: "한국신용정보원(크레딧포유)",
        description: "본인 신용정보 및 보험가입내역 조회를 위한 공식 페이지로 연결합니다.",
        kind: "external",
        href: "https://www.credit4u.or.kr/",
        source: "한국신용정보원",
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
        description: "손해보험 설계사 등록 자격시험 교재 PDF 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/nonlife/textbook",
      },
      {
        id: "nonlife-mock",
        label: "손해보험모의고사",
        description: "손해보험 자격시험 대비 핵심 모의고사 파일 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/nonlife/mock",
      },
      {
        id: "life-textbook",
        label: "생명보험교재",
        description: "생명보험 설계사 등록 자격시험 교재 PDF 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/life/textbook",
      },
      {
        id: "life-mock",
        label: "생명보험모의고사",
        description: "생명보험 자격시험 대비 핵심 모의고사 파일 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/life/mock",
      },
      {
        id: "variable-textbook",
        label: "변액보험교재",
        description: "변액보험 판매관리사 시험 교재 PDF 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/variable/textbook",
      },
      {
        id: "variable-mock",
        label: "변액보험모의고사",
        description: "변액보험 자격시험 대비 핵심 모의고사 파일 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/variable/mock",
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
        description: "보험사별 소식지/소책자/교육자료 모음 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/newsletters/202605",
      },
    ],
  },
  {
    title: "청구 실무",
    description: "청구서류 확인부터 안내문 발송까지의 업무 흐름을 지원합니다.",
    tools: [
      {
        id: "claim-docs-guide",
        label: "보험사별 청구서류 확인",
        description: "보험사별·청구 유형별로 필요한 서류와 공식 확인 기준을 정리합니다.",
        kind: "internal",
        href: "/claim-documents",
        source: "청구서류센터",
        auxText: "지급 여부와 지급 금액은 보험사 심사 후 결정됩니다.",
      },
      {
        id: "claim-channel-guide",
        label: "청구 접수 채널 확인",
        description: "청구 팩스, 우편 주소, 공식 청구양식 확인이 필요한 경우 보험사 정보를 함께 확인합니다.",
        kind: "internal",
        href: "/directory",
        source: "보험사 디렉토리",
        auxText: "고객 의료자료는 PlannerDesk에 입력하거나 업로드하지 않습니다.",
      },
      {
        id: "claim-msg-guide",
        label: "청구 안내문 작성",
        description: "고객에게 필요한 서류를 안내할 때 사용할 수 있는 중립 문구를 확인합니다.",
        kind: "internal",
        href: "/message-templates",
        source: "고객문구센터",
        auxText: "보험금 지급 가능 여부를 단정하지 않는 문구를 사용합니다.",
      }
    ]
  },
  {
    title: "공시·약관 확인",
    description: "고객에게 정확한 약관 기준을 안내하기 위한 업무 흐름을 지원합니다.",
    tools: [
      {
        id: "disclosure-guide",
        label: "약관·공시 공식 링크 확인",
        description: "보험사 공식 홈페이지, 상품공시, 약관 링크를 기준으로 확인합니다.",
        kind: "internal",
        href: "/disclosure-links",
        source: "공시링크센터",
        auxText: "비공식 블로그·카페 링크를 확정 자료처럼 사용하지 않습니다.",
      },
      {
        id: "disclosure-msg-guide",
        label: "고객에게 약관 확인 안내",
        description: "약관 확인이 필요한 고객에게 차분하게 안내할 수 있는 문구를 확인합니다.",
        kind: "internal",
        href: "/message-templates",
        source: "고객문구센터",
        auxText: "약관 해석을 단정하지 않고 공식 기준 확인으로 안내합니다.",
      }
    ]
  },
  {
    title: "고객 안내문",
    description: "업무 시 활용할 수 있는 차분하고 전문적인 고객 안내 문구 모음입니다.",
    tools: [
      {
        id: "request-msg-guide",
        label: "청구서류 요청 문구",
        description: "고객에게 서류를 요청할 때 부담을 줄이고, 필요한 확인사항을 명확히 전달합니다.",
        kind: "internal",
        href: "/message-templates",
        source: "고객문구센터",
        auxText: "의료 진단 해석이나 손해사정 업무를 연상케 하는 표현은 피합니다.",
      },
      {
        id: "hold-msg-guide",
        label: "보험금 판단 유보 문구",
        description: "“보험금 받을 수 있나요?”라는 질문에 지급 여부를 단정하지 않고 답하는 기준을 확인합니다.",
        kind: "internal",
        href: "/message-templates",
        source: "고객문구센터",
        auxText: "보험사별 기준 확인이 필요함을 안내합니다.",
      },
      {
        id: "privacy-msg-guide",
        label: "개인정보·의료자료 금지 안내",
        description: "주민등록번호, 진단서, 처방전 등 민감자료를 플랫폼에 입력하지 않도록 안내합니다.",
        kind: "internal",
        href: "/message-templates",
        source: "고객문구센터",
        auxText: "원본 자료는 별도의 안전한 채널로 수신해야 합니다.",
      }
    ]
  }
];



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



// ── Insurance Age ──
function parseBirthDate(input: string): Date | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  const y = +digits.slice(0, 4), m = +digits.slice(4, 6), d = +digits.slice(6, 8);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d || dt > new Date()) return null;
  return dt;
}

function calcInsuranceAge(birth: Date, base: Date) {
  let realAge = base.getFullYear() - birth.getFullYear();
  const bday = new Date(base.getFullYear(), birth.getMonth(), birth.getDate());
  if (base < bday) --realAge;
  const ref = base < bday ? bday : new Date(base.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const halfYear = new Date(ref);
  halfYear.setMonth(halfYear.getMonth() - 6);
  let insuranceAge: number, nextChange: Date;
  if (base >= halfYear) {
    insuranceAge = realAge + 1;
    nextChange = new Date(ref.getFullYear() + 1, birth.getMonth(), birth.getDate());
    nextChange.setMonth(nextChange.getMonth() - 6);
  } else {
    insuranceAge = realAge;
    nextChange = halfYear;
  }
  const daysToNext = Math.ceil((nextChange.getTime() - base.getTime()) / 86_400_000);
  return { realAge, insuranceAge, nextChange, daysToNext };
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── 실손 의료비 (Silbi) ──
type SilbiGen = '1' | '2' | '3' | '4' | '5';
type SilbiType = 'outpatient' | 'inpatient';
type SilbiFacility = 'clinic' | 'general' | 'tertiary';
const silbiDeductible: Record<SilbiFacility, number> = { clinic: 10_000, general: 15_000, tertiary: 20_000 };

function calcSilbi(gen: SilbiGen, treatType: SilbiType, facility: SilbiFacility, costs: { benefit: number; nonBenefit: number; nonBenefitHeavy: number; nonBenefitLight: number; pharmaBenefit: number; pharmaNonBenefit: number }) {
  const { benefit, nonBenefit, nonBenefitHeavy, nonBenefitLight, pharmaBenefit, pharmaNonBenefit } = costs;
  const ded = silbiDeductible[facility];
  const rows: { label: string; selfPay: number; referenceBalance: number; memo: string }[] = [];
  
  if (gen === '5') {
    const benefitSelf = treatType === 'outpatient' ? Math.min(benefit, Math.max(ded, benefit * 0.2)) : benefit * 0.2;
    const nbHeavySelf = nonBenefitHeavy * 0.3;
    const nbLightSelf = nonBenefitLight * 0.5;
    
    rows.push({ label: '급여 진료비', selfPay: benefitSelf, referenceBalance: benefit - benefitSelf, memo: '자기부담 20%' });
    if (nonBenefitHeavy > 0) rows.push({ label: '중증 비급여', selfPay: nbHeavySelf, referenceBalance: nonBenefitHeavy - nbHeavySelf, memo: '자기부담 30%' });
    if (nonBenefitLight > 0) rows.push({ label: '비중증 비급여 (도수/주사 등)', selfPay: nbLightSelf, referenceBalance: nonBenefitLight - nbLightSelf, memo: '자기부담 50%' });
    
    let selfPharma = 0;
    if (treatType === 'outpatient' && pharmaBenefit > 0) {
      selfPharma = Math.min(pharmaBenefit, Math.max(8_000, pharmaBenefit * 0.2));
      rows.push({ label: '급여 약제비', selfPay: selfPharma, referenceBalance: pharmaBenefit - selfPharma, memo: '자기부담 20%' });
    }
    
    const totalPaid = benefit + nonBenefitHeavy + nonBenefitLight + pharmaBenefit;
    const selfPayTotal = Math.round(benefitSelf + nbHeavySelf + nbLightSelf + selfPharma);
    return { totalPaid, selfPay: selfPayTotal, referenceBalance: Math.max(0, totalPaid - selfPayTotal), breakdown: rows };
  }

  let selfMedical = 0;
  let memoMedical = '';
  if (treatType === 'outpatient') {
    if (gen === '4') { const s1 = Math.max(ded, benefit * 0.2); const s2 = Math.max(30_000, nonBenefit * 0.3); selfMedical = Math.min(benefit, s1) + Math.min(nonBenefit, s2); memoMedical = '급여 20%, 비급여 30%'; }
    else if (gen === '3') { const tot = benefit + nonBenefit; selfMedical = Math.min(tot, Math.max(ded, tot * 0.2)); memoMedical = '급여 10~20%, 비급여 20%'; }
    else if (gen === '2') { const tot = benefit + nonBenefit; selfMedical = tot <= ded ? tot : ded + (tot - ded) * 0.1; memoMedical = '10% 공제'; }
    else { selfMedical = 0; memoMedical = '자기부담금 없음'; }
    rows.push({ label: '통원 진료비', selfPay: selfMedical, referenceBalance: benefit + nonBenefit - selfMedical, memo: memoMedical });
  } else {
    if (gen === '4') { selfMedical = benefit * 0.2 + nonBenefit * 0.3; memoMedical = '급여 20%, 비급여 30%'; }
    else if (gen === '3') { selfMedical = (benefit + nonBenefit) * 0.2; memoMedical = '합산 20%'; }
    else if (gen === '2') { selfMedical = (benefit + nonBenefit) * 0.1; memoMedical = '합산 10%'; }
    else { selfMedical = 0; memoMedical = '자기부담금 없음'; }
    rows.push({ label: '입원 진료비', selfPay: selfMedical, referenceBalance: benefit + nonBenefit - selfMedical, memo: memoMedical });
  }

  let selfPharma = 0;
  if (treatType === 'outpatient' && (pharmaBenefit > 0 || pharmaNonBenefit > 0)) {
    let memoPharma = '';
    if (gen === '4') { const s1 = Math.max(8_000, pharmaBenefit * 0.2); const s2 = Math.max(30_000, pharmaNonBenefit * 0.3); selfPharma = Math.min(pharmaBenefit, s1) + Math.min(pharmaNonBenefit, s2); memoPharma = '급여 20%, 비급여 30%'; }
    else if (gen === '3') { const tot = pharmaBenefit + pharmaNonBenefit; selfPharma = Math.min(tot, Math.max(8_000, tot * 0.2)); memoPharma = '합산 20%'; }
    else if (gen === '2') { const tot = pharmaBenefit + pharmaNonBenefit; selfPharma = tot <= 8_000 ? tot : 8_000 + (tot - 8_000) * 0.1; memoPharma = '10% 공제'; }
    else { selfPharma = 0; memoPharma = '자기부담금 없음'; }
    rows.push({ label: '약제비', selfPay: selfPharma, referenceBalance: pharmaBenefit + pharmaNonBenefit - selfPharma, memo: memoPharma });
  }

  const totalPaid = benefit + nonBenefit + pharmaBenefit + pharmaNonBenefit;
  const selfPayTotal = Math.round(selfMedical + selfPharma);
  return { totalPaid, selfPay: selfPayTotal, referenceBalance: Math.max(0, totalPaid - selfPayTotal), breakdown: rows };
}

// ── 상속세 (Inheritance Tax) ──
const inhBrackets: [number, number, number][] = [[3_000_000_000, 0.5, 460_000_000], [1_000_000_000, 0.4, 160_000_000], [500_000_000, 0.3, 60_000_000], [100_000_000, 0.2, 10_000_000], [0, 0.1, 0]];
function calcInhTax(taxBase: number) { if (taxBase <= 0) return 0; for (const [th, r, d] of inhBrackets) if (taxBase > th) return Math.max(0, taxBase * r - d); return 0; }
function calcSpouseDeduction(estate: number, children: number, mode: 'none' | 'legal' | 'actual', actual: number) {
  if (mode === 'none') return 0;
  const legalShare = estate * (1.5 / (1.5 + children));
  if (mode === 'legal') return Math.max(500_000_000, Math.min(legalShare, 3_000_000_000));
  return Math.max(500_000_000, Math.min(Math.min(actual, legalShare), 3_000_000_000));
}
function calcFinancialDeduction(fin: number) { return fin <= 0 ? 0 : Math.min(fin * 0.2, 200_000_000); }
function calcInheritance(p: { estate: number; debts: number; priorGift: number; financialAssets: number; homeValue: number; spouseMode: 'none' | 'legal' | 'actual'; spouseActual: number; children: number }) {
  const taxableEstate = Math.max(0, p.estate - p.debts);
  const combined = taxableEstate + p.priorGift;
  const personalPer = 50_000_000;
  const personalTotal = 200_000_000 + personalPer * p.children;
  const lumpOrPersonal = Math.max(500_000_000, personalTotal);
  const spouse = calcSpouseDeduction(taxableEstate, p.children, p.spouseMode, p.spouseActual);
  const financial = calcFinancialDeduction(p.financialAssets);
  const home = p.homeValue > 0 ? Math.min(p.homeValue, 600_000_000) : 0;
  const totalDeduction = lumpOrPersonal + spouse + financial + home;
  const taxBase = Math.max(0, combined - totalDeduction);
  const grossTax = calcInhTax(taxBase);
  const reportCredit = grossTax * 0.03;
  return { estate: p.estate, debts: p.debts, priorGift: p.priorGift, taxableEstate, combined, spouse, lumpOrPersonal, financial, home, totalDeduction, taxBase, grossTax, reportCredit, netTax: Math.max(0, grossTax - reportCredit) };
}

// ── 화폐가치 (Currency Value) ──
function calcCurrencyValue(amount: number, ratePct: number, years: number, direction: 'future' | 'present') {
  if (amount <= 0 || years <= 0 || ratePct < 0) return null;
  const factor = (1 + ratePct / 100) ** years;
  const cumulative = (factor - 1) * 100;
  const purchasingLoss = (1 - 1 / factor) * 100;
  return direction === 'future'
    ? { nominal: amount * factor, real: amount / factor, cumulative, purchasingLoss }
    : { nominal: amount, real: amount / factor, cumulative, purchasingLoss };
}

// ── 연봉 실수령액 (Net Salary) ──
const PENSION_RATE = 0.045, PENSION_CAP = 6_170_000, HEALTH_RATE = 0.03545, LONGCARE_RATE = 0.1295, EMPLOY_RATE = 0.009, PERSONAL_DEDUCTION = 1_500_000, WORK_DEDUCTION_CAP = 20_000_000;
function calcWorkDeduction(salary: number) {
  if (salary <= 0) return 0;
  let d: number;
  if (salary <= 5_000_000) d = salary * 0.7;
  else if (salary <= 15_000_000) d = 3_500_000 + (salary - 5_000_000) * 0.4;
  else if (salary <= 45_000_000) d = 7_500_000 + (salary - 15_000_000) * 0.15;
  else if (salary <= 100_000_000) d = 12_000_000 + (salary - 45_000_000) * 0.05;
  else d = 14_750_000 + (salary - 100_000_000) * 0.02;
  return Math.min(d, WORK_DEDUCTION_CAP);
}
function incomeTax8(taxBase: number) {
  if (taxBase <= 0) return 0;
  if (taxBase <= 14_000_000) return taxBase * 0.06;
  if (taxBase <= 50_000_000) return 840_000 + (taxBase - 14_000_000) * 0.15;
  if (taxBase <= 88_000_000) return 6_240_000 + (taxBase - 50_000_000) * 0.24;
  if (taxBase <= 150_000_000) return 15_360_000 + (taxBase - 88_000_000) * 0.35;
  if (taxBase <= 300_000_000) return 37_060_000 + (taxBase - 150_000_000) * 0.38;
  if (taxBase <= 500_000_000) return 94_060_000 + (taxBase - 300_000_000) * 0.40;
  if (taxBase <= 1_000_000_000) return 174_060_000 + (taxBase - 500_000_000) * 0.42;
  return 384_060_000 + (taxBase - 1_000_000_000) * 0.45;
}
function calcWorkTaxCredit(salary: number, grossTax: number) {
  let limit: number;
  if (salary <= 33_000_000) limit = 740_000;
  else if (salary <= 70_000_000) limit = Math.max(660_000, 740_000 - (salary - 33_000_000) * 0.008);
  else if (salary <= 120_000_000) limit = Math.max(500_000, 660_000 - (salary - 70_000_000) * 0.005);
  else limit = Math.max(200_000, 500_000 - (salary - 120_000_000) * 0.005);
  let credit: number;
  if (grossTax <= 1_300_000) credit = grossTax * 0.55;
  else credit = 715_000 + (grossTax - 1_300_000) * 0.3;
  return Math.min(credit, limit);
}
function calcChildCredit(n: number) { return n <= 0 ? 0 : n === 1 ? 250_000 : n === 2 ? 550_000 : 550_000 + (n - 2) * 400_000; }
function calcNetSalary(p: { grossAnnual: number; nonTaxable: number; dependents: number; children: number }) {
  if (p.grossAnnual <= 0) return null;
  const taxable = Math.max(0, p.grossAnnual - p.nonTaxable);
  const workDed = calcWorkDeduction(taxable);
  const personalDed = Math.max(1, p.dependents) * PERSONAL_DEDUCTION;
  const taxBase = Math.max(0, taxable - workDed - personalDed);
  const gross = incomeTax8(taxBase);
  const workCredit = calcWorkTaxCredit(p.grossAnnual, gross);
  const childCr = calcChildCredit(p.children);
  const finalTax = Math.max(0, gross - workCredit - childCr);
  const localTax = Math.round(finalTax * 0.1);
  const mSalary = taxable / 12;
  const pension = Math.round(Math.min(mSalary, PENSION_CAP) * PENSION_RATE);
  const health = Math.round(mSalary * HEALTH_RATE);
  const longcare = Math.round(health * LONGCARE_RATE);
  const employ = Math.round(mSalary * EMPLOY_RATE);
  const ins = { pension: pension * 12, health: health * 12, longcare: longcare * 12, employment: employ * 12 };
  const totalDed = finalTax + localTax + ins.pension + ins.health + ins.longcare + ins.employment;
  const netAnnual = p.grossAnnual - totalDed;
  return { grossAnnual: p.grossAnnual, taxable, workDed, personalDed, taxBase, gross, workCredit, childCr, finalTax, localTax, ins, totalDed, netAnnual, netMonthly: netAnnual / 12, mb: { pension, health, longcare, employment: employ, incomeTax: Math.round(finalTax / 12), localTax: Math.round(localTax / 12) } };
}

// ── 카드 소득공제 (Card Deduction) ──
function cardDeductionCap(salary: number) { return salary <= 70_000_000 ? 3_000_000 : salary <= 120_000_000 ? 2_500_000 : 2_000_000; }
function calcCardDeduction(p: { salary: number; card: number; cash: number }) {
  if (p.salary <= 0) return null;
  const minUsage = p.salary * 0.25;
  const total = p.card + p.cash;
  const excess = Math.max(0, total - minUsage);
  const cardCovered = Math.min(p.card, minUsage);
  const cardEligible = Math.max(0, p.card - cardCovered);
  const cashCovered = minUsage - cardCovered;
  const cashEligible = Math.max(0, p.cash - cashCovered);
  const cardDed = cardEligible * 0.15;
  const cashDed = cashEligible * 0.30;
  const raw = cardDed + cashDed;
  const cap = cardDeductionCap(p.salary);
  const final = Math.min(raw, cap);
  return { minUsage, total, excess, cardEligible, cashEligible, cardDed, cashDed, raw, cap, final, refund: final * 0.165 };
}

// ── 근로소득세 (Earned Tax) ──
function bracketLabel(tb: number) {
  if (tb <= 14_000_000) return '1,400만 이하 6%';
  if (tb <= 50_000_000) return '1,400만~5,000만 15%';
  if (tb <= 88_000_000) return '5,000만~8,800만 24%';
  if (tb <= 150_000_000) return '8,800만~1.5억 35%';
  if (tb <= 300_000_000) return '1.5억~3억 38%';
  if (tb <= 500_000_000) return '3억~5억 40%';
  if (tb <= 1_000_000_000) return '5억~10억 42%';
  return '10억 초과 45%';
}
function calcEarnedTax(salary: number) {
  if (salary <= 0) return null;
  const wd = calcWorkDeduction(salary);
  const tb = Math.max(0, salary - wd);
  const gt = incomeTax8(tb);
  const lt = Math.round(gt * 0.1);
  return { salary, wd, tb, gt, lt, total: gt + lt, label: bracketLabel(tb), effectiveRate: salary > 0 ? (gt + lt) / salary * 100 : 0 };
}

// ── 종합소득세 (Comprehensive Tax) ──
function calcCompTax(p: { rental: number; other: number; expense: number; dependents: number; otherDeduction: number; children: number; otherCredit: number }) {
  const gross = Math.max(0, p.rental + p.other - p.expense);
  if (gross <= 0) return null;
  const personal = Math.max(1, p.dependents) * PERSONAL_DEDUCTION;
  const totalDed = personal + p.otherDeduction;
  const tb = Math.max(0, gross - totalDed);
  const gt = incomeTax8(tb);
  const childCr = calcChildCredit(p.children);
  const totalCredit = childCr + p.otherCredit;
  const finalTax = Math.max(0, gt - totalCredit);
  const lt = Math.round(finalTax * 0.1);
  const pensionRate = gross <= 45_000_000 ? 0.165 : 0.132;
  return { gross, personal, totalDed, tb, gt, childCr, totalCredit, finalTax, lt, totalTax: finalTax + lt, pensionRate, pensionSaving: 9_000_000 * pensionRate };
}

// ── 부가세 (VAT) ──
function calcVat(amount: number, direction: 'inclusive' | 'exclusive') {
  if (amount <= 0) return null;
  if (direction === 'inclusive') { const supply = Math.round(amount / 1.1); return { supply, vat: amount - supply, total: amount }; }
  const vat = Math.round(amount * 0.1);
  return { supply: amount, vat, total: amount + vat };
}

// ── 대출 이자 (Loan) ──
type LoanMode = 'equal_payment' | 'equal_principal' | 'bullet';
function calcLoan(p: { mode: LoanMode; principal: number; months: number; ratePct: number }) {
  if (p.principal <= 0 || p.months <= 0 || p.ratePct < 0) return null;
  const mr = p.ratePct / 100 / 12;
  if (p.mode === 'equal_payment') {
    const pmt = mr === 0 ? p.principal / p.months : p.principal * mr * (1 + mr) ** p.months / ((1 + mr) ** p.months - 1);
    return { first: pmt, mid: pmt, last: pmt, totalInterest: pmt * p.months - p.principal, totalPayment: pmt * p.months };
  }
  if (p.mode === 'equal_principal') {
    const pp = p.principal / p.months;
    const first = pp + p.principal * mr;
    const mid = pp + (p.principal - pp * Math.floor(p.months / 2)) * mr;
    const last = pp + pp * mr;
    const totalI = mr * pp * p.months * (p.months + 1) / 2;
    return { first, mid, last, totalInterest: totalI, totalPayment: p.principal + totalI };
  }
  const interest = p.principal * mr;
  return { first: interest, mid: interest, last: interest + p.principal, totalInterest: interest * p.months, totalPayment: p.principal + interest * p.months };
}

// ── 한국원 포맷 ──
function krw(n: number) {
  const v = Math.round(n);
  if (v === 0) return '0원';
  const eok = Math.floor(v / 100_000_000);
  const man = Math.floor((v % 100_000_000) / 10_000);
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString('ko-KR')}만원`;
  if (eok > 0) return `${eok}억원`;
  if (man > 0) return `${man.toLocaleString('ko-KR')}만원`;
  return `${v.toLocaleString('ko-KR')}원`;
}

function allTools() {
  return toolGroups.flatMap((group) => group.tools);
}

function getToolCopy(id: ToolId) {
  return allTools().find((tool) => tool.id === id);
}

function getInitialToolFromUrl(): ToolId | null {
  if (typeof window === "undefined") return null;
  const candidate =
    new URLSearchParams(window.location.search).get("tool") ||
    window.location.hash.replace(/^#/, "");
  return allTools().some((tool) => tool.id === candidate)
    ? (candidate as ToolId)
    : null;
}

const toolToCategoryId: Record<ToolId, string> = {
  "planner-stats": "stats",
  "disease-search": "search",
  "silbi-calculator": "insure-calc",
  "insurance-age": "insure-calc",
  "bmi-calculator": "insure-calc",
  "currency-value": "finance-calc",
  "loan": "finance-calc",
  "savings": "finance-calc",
  "net-salary": "finance-calc",
  "earned-tax": "finance-calc",
  "comp-tax": "finance-calc",
  "inheritance-tax": "finance-calc",
  "card-deduction": "finance-calc",
  "vat": "finance-calc",
  "surgery-code": "claim",
  "disease-code": "claim",
  "hospital-pharmacy": "claim",
  "silson24": "claim",
  "hidden-insurance": "claim",
  "lost-health-standard": "silbi",
  "car-face-quote": "car",
  "car-einsmarket": "car",
  "car-premium-factor": "car",
  "car-kidi-register": "car",
  "car-fault-ratio": "car",
  "fire-special-building": "fire",
  "building-register": "fire",
  "elevator-info": "fire",
  "gov-resident": "docs",
  "hometax-income": "docs",
  "court-family": "docs",
  "knia-agent": "recruits",
  "klia-agent": "recruits",
  "iaa-product": "recruits",
  "insurance-institute": "recruits",
  "nonlife-textbook": "exam",
  "nonlife-mock": "exam",
  "life-textbook": "exam",
  "life-mock": "exam",
  "variable-textbook": "exam",
  "variable-mock": "exam",
  "insurer-newsletter": "news",
  "nhis-health": "docs",
  "nps-pension": "docs",
  "fss-fine": "docs",
  "efine-driver": "docs",
  "payinfo": "docs",
  "credit4u": "docs",
  "claim-docs-guide": "claim",
  "claim-channel-guide": "claim",
  "claim-msg-guide": "claim",
  "disclosure-guide": "search",
  "disclosure-msg-guide": "search",
  "request-msg-guide": "docs",
  "hold-msg-guide": "docs",
  "privacy-msg-guide": "docs",
};

const PINNED_TOOL_IDS: ToolId[] = [
  "insurance-age",
  "bmi-calculator",
  "silbi-calculator",
  "disease-code",
  "surgery-code",
  "hidden-insurance",
];

export function WorkToolsClient() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<ToolId[]>([]);

  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderTarget, setFolderTarget] = useState("");
  const [folderTitle, setFolderTitle] = useState("");

  useEffect(() => {
    const initialTool = getInitialToolFromUrl();
    if (initialTool) {
      setTimeout(() => setActiveTool(initialTool), 0);
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as ToolId[];
      setTimeout(() => setFavorites(parsed), 0);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!activeTool) return;
    const panelEl = document.getElementById("active-tool-panel");
    panelEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTool]);

  function toggleFavorite(id: ToolId) {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        try {
          window.dispatchEvent(new Event("plannerdesk.workTools.favorites:update"));
        } catch {
          // defensive
        }
      }
      return next;
    });
  }

  function handleToolSelect(tool: ToolItem) {
    if (tool.kind === "folder") {
      setFolderTarget(tool.href || "");
      setFolderTitle(tool.label);
      setIsFolderOpen(true);
    } else {
      setActiveTool(tool.id);
    }
  }

  // Get matching tools based on query & category
  const filteredTools = useMemo(() => {
    let list = allTools();

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/\s+/g, "");
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    list = list.filter((t) =>
      matchesWorkToolCategory(
        toolToCategoryId[t.id],
        selectedCategory,
        t.id,
        favorites
      )
    );

    return list;
  }, [searchQuery, selectedCategory, favorites]);

  const showFeaturedSection =
    !searchQuery.trim() &&
    (selectedCategory === "all" || selectedCategory === "favorites");

  const featuredTools = useMemo(() => {
    if (selectedCategory === "favorites") {
      return allTools().filter((t) => favorites.includes(t.id));
    }
    return allTools().filter((t) => PINNED_TOOL_IDS.includes(t.id));
  }, [favorites, selectedCategory]);

  const gridTools = useMemo(() => {
    if (!showFeaturedSection) return filteredTools;
    const pinnedSet = new Set<string>(PINNED_TOOL_IDS);
    return filteredTools.filter((t) => !pinnedSet.has(t.id));
  }, [filteredTools, showFeaturedSection]);

  const getToolIcon = (kind: ToolKind) => {
    switch (kind) {
      case "stats":
        return <TrendingUp className="h-5 w-5 text-[#B9975B]" />;
      case "search":
        return <SearchIcon className="h-5 w-5 text-[#16382C]" />;
      case "calculator":
        return <Calculator className="h-5 w-5 text-[#0F1D2E]" />;
      case "folder":
        return <FolderOpen className="h-5 w-5 text-[#7a612d]" />;
      case "external":
        return <ExternalLink className="h-5 w-5 text-[#16382C]" />;
      default:
        return <Wrench className="h-5 w-5 text-[#5B6470]" />;
    }
  };

  return (
    <div className="space-y-10 pb-6">
      <section className="space-y-5">
        <label className="block max-w-xl" htmlFor="work-tools-search">
          <span className="sr-only">업무 도구 검색</span>
          <SearchBar
            ariaLabel="업무 도구 검색"
            id="work-tools-search"
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="보험나이, 실손 자기부담, 상병코드, 정부24 검색"
            value={searchQuery}
          />
        </label>
        <CategoryPillBar
          ariaLabel="업무 도구 카테고리"
          categories={WORK_TOOL_CATEGORIES}
          onSelect={setSelectedCategory}
          selectedId={selectedCategory}
        />
      </section>

      {showFeaturedSection && featuredTools.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles
              aria-hidden
              className="h-4 w-4 text-[#B9975B] fill-[#B9975B]/20"
            />
            <h2 className="text-lg font-bold text-[#0F1D2E]">
              자주 쓰는 실무 핵심 도구
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredTools.map((tool) => (
              <ToolCard
                key={"featured-" + tool.id}
                categoryLabel={getCategoryLabelForTool(toolToCategoryId[tool.id])}
                description={tool.description}
                icon={getToolIcon(tool.kind)}
                isActive={activeTool === tool.id}
                isFavorite={favorites.includes(tool.id)}
                kind={tool.kind}
                onRun={() => handleToolSelect(tool)}
                onToggleFavorite={() => toggleFavorite(tool.id)}
                size="featured"
                source={tool.source}
                title={tool.label}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeader
          description="전체 업무 도구를 카테고리별로 탐색하고 실행할 수 있습니다."
          title="전체 업무 도구"
        />
        {gridTools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {gridTools.map((tool) => (
              <ToolCard
                key={tool.id}
                categoryLabel={getCategoryLabelForTool(toolToCategoryId[tool.id])}
                description={tool.description}
                icon={getToolIcon(tool.kind)}
                isActive={activeTool === tool.id}
                isFavorite={favorites.includes(tool.id)}
                kind={tool.kind}
                onRun={() => handleToolSelect(tool)}
                onToggleFavorite={() => toggleFavorite(tool.id)}
                source={tool.source}
                title={tool.label}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description="검색어를 줄이거나 다른 카테고리를 선택해 주세요."
            title="조건에 맞는 업무 도구가 없습니다."
          />
        )}
      </section>

      {/* 5. 실행 중인 기능 화면 (Active tool view) */}
      {activeTool && (
        <section
          id="active-tool-panel"
          className="rounded-2xl border-2 border-[#B9975B] bg-white p-6 shadow-md transition-all scroll-mt-24"
        >
          <div className="flex items-center justify-between border-b border-[#E3DED4] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-[#0F1D2E]">
                {allTools().find((t) => t.id === activeTool)?.label} 실행 화면
              </h3>
            </div>
            <button
              type="button"
              aria-label="실행 화면 닫기"
              onClick={() => setActiveTool(null)}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
            >
              닫기
            </button>
          </div>
          <div className="mt-6">
            <ToolPanel id={activeTool} />
          </div>
        </section>
      )}

      {/* 6. 접이식 안전 안내 */}
      <aside className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-5">
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-[#B9975B]">주의 사항 및 안전 안내</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#5B6470] break-keep">
          계산 및 검색 결과는 설계사 업무 참고 가이드라인입니다. 보험금 지급 여부, 지급 금액, 손해사정, 진단서 해석을 결정하지 않습니다. PlannerDesk는 조회 결과를 저장하지 않으며, 고객 개인정보와 의료자료를 처리하지 않습니다. 개인정보나 민감한 질병 자료 원본은 절대 입력하지 않도록 주의해 주세요.
        </p>
      </aside>

      <FolderDownloadModal
        open={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        target={folderTarget}
        title={folderTitle}
      />
    </div>
  );
}

function ToolPanel({ id }: { id: ToolId }) {
  const copy = getToolCopy(id);
  if (!copy) return null;
  if (copy.kind === "stats") return <StatsTool />;
  if (copy.kind === "search") return <SearchTool id={id} />;
  if (copy.kind === "calculator") return <CalculatorTool id={id} />;
  if (copy.kind === "newsletter") return <NewsletterTool copy={copy} />;
  if (copy.kind === "internal") return <InternalTool copy={copy} />;
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
        <span className="text-sm font-semibold text-slate-700">상담 키워드</span>
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="예: 자동차, 자영업자, 5060"
          value={keyword}
        />
      </label>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {filtered.map((card) => (
          <article
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            key={card.title}
          >
            <p className="text-xs font-semibold text-indigo-600">{card.stat}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {card.title}
            </h3>
            <p className="mt-2 break-keep text-sm leading-6 text-slate-500">
              {card.script}
            </p>
          </article>
        ))}
      </div>
    </PanelShell>
  );
}

function SearchTool({ id }: { id: ToolId }) {
  if (id === "disease-search") return <DiseaseSearchTool />;
  if (id === "surgery-code") return <SurgeryCodeSearchTool />;
  if (id === "disease-code") return <DiseaseCodeSearchTool />;
  return null;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? "-"
    : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
        date.getDate()
      ).padStart(2, "0")}`;
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="bg-yellow-100 text-slate-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const Ug = [
  ["A00", "A09", "장 감염병"],
  ["A15", "A19", "결핵"],
  ["A20", "A28", "동물전염 감염"],
  ["A30", "A49", "세균성 질환"],
  ["A50", "A64", "성매개 감염"],
  ["A65", "A69", "스피로헤타"],
  ["A70", "A74", "클라미디아"],
  ["A75", "A79", "리케차병"],
  ["A80", "A89", "바이러스성 중추신경계 감염"],
  ["A90", "A99", "바이러스열"],
  ["B00", "B09", "헤르페스"],
  ["B15", "B19", "바이러스성 간염"],
  ["B20", "B24", "HIV"],
  ["B25", "B34", "기타 바이러스"],
  ["B35", "B49", "진균 감염"],
  ["B50", "B64", "원충 질환"],
  ["B65", "B83", "기생충"],
  ["B85", "B89", "이·진드기"],
  ["B90", "B94", "감염병 후유증"],
  ["B95", "B99", "기타 감염"],
  ["C00", "C97", "악성 신생물"],
  ["D00", "D48", "양성 신생물"],
  ["D50", "D89", "혈액 질환"],
  ["E00", "E90", "내분비·대사"],
  ["F00", "F99", "정신·행동"],
  ["G00", "G99", "신경계"],
  ["H00", "H59", "눈"],
  ["H60", "H95", "귀"],
  ["I00", "I99", "순환계"],
  ["J00", "J99", "호흡계"],
  ["K00", "K93", "소화계"],
  ["L00", "L99", "피부"],
  ["M00", "M99", "근골격계"],
  ["N00", "N99", "비뇨생식"],
  ["O00", "O99", "임신·출산"],
  ["P00", "P96", "출생전후기"],
  ["Q00", "Q99", "선천기형"],
  ["R00", "R99", "증상·징후"],
  ["S00", "T98", "손상·중독"],
  ["V01", "Y98", "외인"],
  ["Z00", "Z99", "보건서비스"],
  ["U00", "U99", "특수목적"],
];

function getKcdCategory(code?: string) {
  if (!code) return null;
  const val = code.toUpperCase().slice(0, 3);
  if (val.length < 3) return null;
  for (const [start, end, category] of Ug) {
    if (val >= start && val <= end) return category;
  }
  return null;
}

interface DiseaseItem {
  id: number;
  insurer: string;
  disease_name: string;
  min_elapsed: string | null;
  treatment_period: string | null;
  surgery_status: string | null;
  product_category: string | null;
  remarks: string | null;
}

interface DiseaseMeta {
  insurers: string[];
  categories: string[];
  total_records: number;
  last_synced_at: string;
}

interface DiseaseResponse {
  items: DiseaseItem[];
  total: number;
  page: number;
  page_size: number;
}

function DiseaseSearchTool() {
  const [insurer, setInsurer] = useState("");
  const [category, setCategory] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DiseaseResponse | null>(null);
  const [meta, setMeta] = useState<DiseaseMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/work-tools/diseases/meta")
      .then((res) => res.json())
      .then((resData) => setMeta(resData))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setIsLoading(true);
    });

    const params = new URLSearchParams({
      page: String(page),
      page_size: "30",
    });
    if (insurer) params.set("insurer", insurer);
    if (category) params.set("category", category);
    if (query) params.set("q", query);

    fetch(`/api/work-tools/diseases?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (active) {
          setData(resData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [insurer, category, query, page]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));

  const handleSearch = () => {
    setQuery(queryInput.trim());
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <PanelShell
      description="유병자 상품 심사 시 질환별 인수 예외 기준 및 조건(경과 기간, 수술 여부 등)을 검색합니다."
      id="disease-search"
      title="유병자 인수예외질환 검색"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            className="w-full px-3 py-2.5 text-sm border border-slate-200 bg-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            value={insurer}
            onChange={(e) => {
              setInsurer(e.target.value);
              setPage(1);
            }}
          >
            <option value="">보험사 전체</option>
            {meta?.insurers?.map((ins: string) => (
              <option key={ins} value={ins}>
                {ins}
              </option>
            ))}
          </select>
          <select
            className="w-full px-3 py-2.5 text-sm border border-slate-200 bg-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">상품구분 전체</option>
            {meta?.categories?.map((cat: string) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2 flex gap-2">
            <input
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              placeholder="질환명 검색 (예: 고혈압, 당뇨)"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="px-5 py-2 bg-indigo-600 !text-slate-50 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shrink-0"
              onClick={handleSearch}
              type="button"
            >
              검색
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-[11px] text-slate-500">
          {meta?.last_synced_at && (
            <span>마지막 동기화: {formatDate(meta.last_synced_at)}</span>
          )}
          <span>※ 실제 인수 여부는 각 보험사의 개별 심사 기준에 따라 상이할 수 있습니다. 단순 참고용으로 활용해 주세요.</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-500 border border-slate-200 bg-slate-50 rounded-xl">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
                    <th className="px-4 py-3 font-semibold">보험사</th>
                    <th className="px-4 py-3 font-semibold">예외질환</th>
                    <th className="px-4 py-3 font-semibold">최소경과</th>
                    <th className="px-4 py-3 font-semibold">치료기간</th>
                    <th className="px-4 py-3 font-semibold">수술여부</th>
                    <th className="px-4 py-3 font-semibold">상품구분</th>
                    <th className="px-4 py-3 font-semibold">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item: DiseaseItem) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{item.insurer}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{highlightText(item.disease_name, query)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.min_elapsed || "-"}</td>
                      <td className="px-4 py-3">{item.treatment_period || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.surgery_status || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.product_category || "-"}</td>
                      <td className="px-4 py-3 text-xs leading-relaxed max-w-xs break-all">{item.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {items.map((item: DiseaseItem) => (
                <div key={item.id} className="p-4 border border-slate-200 bg-white rounded-xl space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{item.insurer}</span>
                    {item.product_category && (
                      <span className="text-[10px] px-2 py-0.5 border border-slate-200 bg-slate-50 text-indigo-600 rounded font-semibold">
                        {item.product_category}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{highlightText(item.disease_name, query)}</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                      <dt className="text-slate-400">최소경과</dt>
                      <dd className="font-medium text-slate-800">{item.min_elapsed || "-"}</dd>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                      <dt className="text-slate-400">수술여부</dt>
                      <dd className="font-medium text-slate-800">{item.surgery_status || "-"}</dd>
                    </div>
                    <div className="col-span-2 flex justify-between border-b border-dashed border-slate-200 pb-1">
                      <dt className="text-slate-400">치료기간</dt>
                      <dd className="font-medium text-slate-800">{item.treatment_period || "-"}</dd>
                    </div>
                    {item.remarks && (
                      <div className="col-span-2 pt-1">
                        <dt className="text-slate-400 mb-0.5">비고</dt>
                        <dd className="text-slate-700 leading-normal">{item.remarks}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

interface SurgeryCodeItem {
  id: string;
  classification_set: string;
  surgery_name: string;
  aliases: string | null;
  kcd_code: string | null;
  classification_1_3: string | null;
  classification_1_5: string | null;
  classification_1_7: string | null;
  classification_1_8: string | null;
  body_part: string | null;
  remarks: string | null;
}

interface SurgeryCodeMeta {
  body_parts: string[];
  total_records: number;
  total_by_set: {
    [key: string]: number;
  };
  last_updated_at: string;
}

interface SurgeryCodeResponse {
  items: SurgeryCodeItem[];
  total: number;
  page: number;
  page_size: number;
}

function SurgeryCodeSearchTool() {
  const [classificationSet, setClassificationSet] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SurgeryCodeResponse | null>(null);
  const [meta, setMeta] = useState<SurgeryCodeMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/work-tools/surgery-codes/meta")
      .then((res) => res.json())
      .then((resData) => setMeta(resData))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setIsLoading(true);
    });

    const params = new URLSearchParams({
      page: String(page),
      page_size: "30",
    });
    if (classificationSet) params.set("classification_set", classificationSet);
    if (query) params.set("q", query);

    fetch(`/api/work-tools/surgery-codes?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (active) {
          setData(resData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [classificationSet, query, page]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));

  const items1_3 = items.filter((item: SurgeryCodeItem) => item.classification_set === "1-3/1-5");
  const items1_7 = items.filter((item: SurgeryCodeItem) => item.classification_set === "1-7/1-8");

  const handleSearch = () => {
    setQuery(queryInput.trim());
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getGradeStyle = (grade?: string | null) => {
    if (!grade) return { bg: "bg-slate-100", text: "text-slate-400" };
    const num = parseInt(grade.replace(/[^0-9]/g, ""), 10);
    if (!num || num < 1) return { bg: "bg-slate-100/80", text: "text-slate-500" };
    if (num <= 2) return { bg: "bg-green-50/50 text-green-700 border-green-200" };
    if (num <= 4) return { bg: "bg-amber-50/50 text-amber-700 border-amber-200" };
    if (num <= 6) return { bg: "bg-orange-50/50 text-orange-700 border-orange-200" };
    return { bg: "bg-red-50/50 text-red-700 border-red-200" };
  };

  return (
    <PanelShell
      description="수술명으로 약관상 수술 등급 분류(1-3종, 1-5종, 1-7종, 1-8종)를 검색합니다."
      id="surgery-code"
      title="수술분류표 수술코드 검색"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
                classificationSet === ""
                  ? "bg-indigo-600 !text-slate-50 border-transparent"
                  : "bg-slate-50 text-indigo-600 border-slate-200 hover:bg-slate-100"
              }`}
              onClick={() => {
                setClassificationSet("");
                setPage(1);
              }}
              type="button"
            >
              전체
            </button>
            <button
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
                classificationSet === "1-3/1-5"
                  ? "bg-indigo-600 !text-slate-50 border-transparent"
                  : "bg-slate-50 text-indigo-600 border-slate-200 hover:bg-slate-100"
              }`}
              onClick={() => {
                setClassificationSet("1-3/1-5");
                setPage(1);
              }}
              type="button"
            >
              1-3종 · 1-5종
            </button>
            <button
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
                classificationSet === "1-7/1-8"
                  ? "bg-indigo-600 !text-slate-50 border-transparent"
                  : "bg-slate-50 text-indigo-600 border-slate-200 hover:bg-slate-100"
              }`}
              onClick={() => {
                setClassificationSet("1-7/1-8");
                setPage(1);
              }}
              type="button"
            >
              1-7종 · 1-8종
            </button>
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 sm:w-64 px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              placeholder="수술명 검색 (예: 백내장, 대장용종)"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="px-5 py-2 bg-indigo-600 !text-slate-50 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shrink-0"
              onClick={handleSearch}
              type="button"
            >
              검색
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-[11px] text-slate-500">
          {meta?.last_updated_at && (
            <span>마지막 업데이트: {formatDate(meta.last_updated_at)}</span>
          )}
          <span>※ KIDI(보험개발원) 공식 분류표 기반. 실제 수술 분류는 계약 가입 시기 및 약관에 따릅니다.</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-500 border border-slate-200 bg-slate-50 rounded-xl">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {items1_3.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 px-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                  1-3종 · 1-5종 분류표
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold text-xs sm:text-sm">
                        <th className="px-4 py-2.5 font-semibold">수술명</th>
                        <th className="px-4 py-2.5 font-semibold text-center w-24">1-3종</th>
                        <th className="px-4 py-2.5 font-semibold text-center w-24">1-5종</th>
                        <th className="px-4 py-2.5 font-semibold">비고</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items1_3.map((item: SurgeryCodeItem) => {
                        const style1_3 = getGradeStyle(item.classification_1_3);
                        const style1_5 = getGradeStyle(item.classification_1_5);
                        return (
                           <tr key={item.id} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                             <td className="px-4 py-3 font-semibold text-slate-900">{highlightText(item.surgery_name, query)}</td>
                             <td className="px-4 py-3 text-center">
                               <span className={`inline-block px-2.5 py-0.5 text-xs font-bold border rounded-md min-w-[3.5rem] text-center ${style1_3.bg} ${style1_3.text}`}>
                                 {item.classification_1_3 || "-"}
                               </span>
                             </td>
                             <td className="px-4 py-3 text-center">
                               <span className={`inline-block px-2.5 py-0.5 text-xs font-bold border rounded-md min-w-[3.5rem] text-center ${style1_5.bg} ${style1_5.text}`}>
                                 {item.classification_1_5 || "-"}
                               </span>
                             </td>
                             <td className="px-4 py-3 text-xs leading-relaxed max-w-xs">{item.remarks || "-"}</td>
                           </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {items1_7.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 px-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                  1-7종 · 1-8종 분류표
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold text-xs sm:text-sm">
                        <th className="px-4 py-2.5 font-semibold">수술명</th>
                        <th className="px-4 py-2.5 font-semibold text-center w-24">1-7종</th>
                        <th className="px-4 py-2.5 font-semibold text-center w-24">1-8종</th>
                        <th className="px-4 py-2.5 font-semibold">비고</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items1_7.map((item: SurgeryCodeItem) => {
                        const style1_7 = getGradeStyle(item.classification_1_7);
                        const style1_8 = getGradeStyle(item.classification_1_8);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">{highlightText(item.surgery_name, query)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 text-xs font-bold border rounded-md min-w-[3.5rem] text-center ${style1_7.bg} ${style1_7.text}`}>
                                {item.classification_1_7 || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 text-xs font-bold border rounded-md min-w-[3.5rem] text-center ${style1_8.bg} ${style1_8.text}`}>
                                {item.classification_1_8 || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs leading-relaxed max-w-xs">{item.remarks || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

interface DiseaseCodeItem {
  id: string;
  code: string;
  name_ko: string;
  name_en: string | null;
  infectious_class: string | null;
  is_complete: boolean | null;
  main_disease_allowed: boolean | null;
  gender_restriction: string | null;
  age_min: number | null;
  age_max: number | null;
  medicine_type: string | null;
}

interface DiseaseCodeMeta {
  infectious_classes: string[];
  total_records: number;
  last_updated_at: string;
}

interface DiseaseCodeResponse {
  items: DiseaseCodeItem[];
  total: number;
  page: number;
  page_size: number;
}

interface CoverageItem {
  slug: string;
  name_ko: string;
  category: string;
  description: string | null;
  note: string | null;
  matched_pattern: string;
  match_kind: string;
}

interface DiseaseCodeDetails {
  department: string | null;
  description: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  prescription: string | null;
  diet: string | null;
  warnings: string | null;
  related_codes: string[];
  source: string | null;
}

interface CoverageResponse {
  code: string;
  name_ko: string | null;
  name_en: string | null;
  infectious_class: string | null;
  coverages: CoverageItem[];
  details: DiseaseCodeDetails | null;
  note: string | null;
}

function DiseaseCodeSearchTool() {
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DiseaseCodeResponse | null>(null);
  const [meta, setMeta] = useState<DiseaseCodeMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [coverageData, setCoverageData] = useState<CoverageResponse | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);

  useEffect(() => {
    fetch("/api/work-tools/disease-codes/meta")
      .then((res) => res.json())
      .then((resData) => setMeta(resData))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setIsLoading(true);
    });

    const params = new URLSearchParams({
      page: String(page),
      page_size: "30",
    });
    if (query) params.set("q", query);

    fetch(`/api/work-tools/disease-codes?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (active) {
          setData(resData);
          setIsLoading(false);
          setExpandedId(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, page]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));

  const handleSearch = () => {
    setQuery(queryInput.trim());
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggle = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setCoverageData(null);
    } else {
      setExpandedId(id);
      setCoverageLoading(true);
      setCoverageData(null);
      fetch(`/api/work-tools/disease-codes/${id}/coverages`)
        .then((res) => res.json())
        .then((resData) => {
          setCoverageData(resData);
          setCoverageLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setCoverageLoading(false);
        });
    }
  };

  const handlePickRelatedCode = (relatedCode: string) => {
    setQueryInput(relatedCode);
    setQuery(relatedCode);
    setPage(1);
  };

  return (
    <PanelShell
      description="상병기호(KCD-10)와 질환명을 검색하여 표준 담보 연동성 및 질환 설명을 확인합니다."
      id="disease-code"
      title="상병코드(KCD) 검색"
    >
      <div className="space-y-4">
        <div className="flex gap-2 max-w-xl bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
          <input
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            placeholder="상병코드·한글명·영문명 (예: I10, 칸디다, Candida)"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-5 py-2 bg-indigo-600 !text-slate-50 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shrink-0"
            onClick={handleSearch}
            type="button"
          >
            검색
          </button>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-[11px] text-slate-500">
          {meta?.last_updated_at && (
            <span>마지막 업데이트: {formatDate(meta.last_updated_at)}</span>
          )}
          <span>※ HIRA(건강보험심사평가원) 공식 상병마스터 기반. 보험사/상품별 세부 지급 기준과 다를 수 있습니다.</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-500 border border-slate-200 bg-slate-50 rounded-xl">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {items.map((item: DiseaseCodeItem) => {
                const category = getKcdCategory(item.code);
                const isExpanded = expandedId === item.id;
                return (
                  <div key={item.id} className="transition-colors hover:bg-slate-50/30">
                    <button
                      className="w-full px-5 py-3.5 text-left flex items-start justify-between gap-4 outline-none"
                      onClick={() => handleToggle(item.id)}
                      type="button"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {category && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 border border-slate-200 bg-slate-50 text-indigo-600 rounded">
                              {category}
                            </span>
                          )}
                          <span className="text-sm font-bold font-mono text-indigo-600">
                            {highlightText(item.code, query)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {highlightText(item.name_ko, query)}
                        </h4>
                        {item.name_en && (
                          <p className="text-xs text-slate-500 font-medium leading-tight">
                            {highlightText(item.name_en, query)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 self-center">
                        {item.infectious_class && (
                          <span className="text-[10px] px-2 py-0.5 border border-red-200 bg-red-50 text-red-700 font-bold rounded">
                            {item.infectious_class}
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? "transform rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 bg-slate-50/40 border-t border-slate-200/70 space-y-4">
                        {coverageLoading ? (
                          <div className="py-6 text-center text-xs text-slate-500">불러오는 중...</div>
                        ) : !coverageData ? (
                          <p className="text-xs text-red-500 py-4">상세 정보를 로드할 수 없습니다.</p>
                        ) : (
                          <>
                            <div className="space-y-2.5">
                              <h5 className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                청구 가능 표준 담보 ({coverageData.coverages?.length || 0})
                              </h5>
                              {(!coverageData.coverages || coverageData.coverages.length === 0) ? (
                                <div className="p-3.5 text-xs border border-slate-200 bg-white rounded-lg text-slate-500 flex items-start gap-2">
                                  <svg
                                    className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                  <span>{coverageData.note || "매핑된 표준 담보가 없습니다. 약관 확인 필요."}</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {["실손", "입원일당", "통원비"].map((cat) => {
                                    const grouped = (coverageData.coverages || []).filter(
                                      (cov: CoverageItem) => cov.category === cat
                                    );
                                    if (grouped.length === 0) return null;
                                    return (
                                      <div key={cat} className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400">{cat}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {grouped.map((cov: CoverageItem) => (
                                            <div
                                              key={cov.slug}
                                              className="p-3 border border-green-200 bg-green-50/30 rounded-lg space-y-1 text-xs"
                                            >
                                              <div className="flex items-center gap-1 font-bold text-slate-850">
                                                <svg
                                                  className="w-3.5 h-3.5 text-green-600 shrink-0"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                  strokeWidth={3}
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                  />
                                                </svg>
                                                {cov.name_ko}
                                              </div>
                                              {cov.description && (
                                                <p className="text-[11px] leading-normal text-slate-500">
                                                  {cov.description}
                                                </p>
                                              )}
                                              {cov.note && (
                                                <p className="text-[10px] font-medium text-amber-700 bg-amber-50/70 border border-amber-100 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                                                  <span className="font-bold shrink-0">유의:</span>
                                                  {cov.note}
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {coverageData.details && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-bold text-slate-500">의학 정보</h5>
                                <div className="p-4 border border-slate-200 bg-white rounded-xl space-y-3.5 text-xs text-slate-700">
                                  {[
                                    ["진료과", coverageData.details.department],
                                    ["설명", coverageData.details.description],
                                    ["주요 증상", coverageData.details.symptoms],
                                    ["진단 방법", coverageData.details.diagnosis],
                                    ["처방", coverageData.details.prescription],
                                    ["식이요법", coverageData.details.diet],
                                    ["유의사항", coverageData.details.warnings],
                                  ]
                                    .filter(([, val]) => val && val.trim())
                                    .map(([label, val]) => (
                                      <div key={label} className="space-y-1">
                                        <p className="font-bold text-[10px] text-slate-400">
                                          {label}
                                        </p>
                                        <p className="leading-relaxed whitespace-pre-line text-slate-700">
                                          {val}
                                        </p>
                                      </div>
                                    ))}

                                  {coverageData.details.related_codes?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <p className="font-bold text-slate-400 text-[10px]">
                                        관련 코드
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {coverageData.details.related_codes.map((relCode: string) => (
                                          <button
                                            key={relCode}
                                            type="button"
                                            className="px-2 py-0.5 font-mono text-[10px] border border-blue-200 bg-blue-50/60 text-blue-700 font-bold rounded hover:bg-blue-100 transition"
                                            onClick={() => handlePickRelatedCode(relCode)}
                                          >
                                            {relCode}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {coverageData.details.source && (
                                    <p className="text-[10px] text-slate-400 text-right">
                                      출처: {coverageData.details.source}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (pages.length < 5 && start > 1) {
      const adjStart = Math.max(1, totalPages - 4);
      pages.length = 0;
      for (let i = adjStart; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1 pt-4 border-t border-slate-200">
      <button
        className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        type="button"
      >
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {visiblePages[0] > 1 && (
        <>
          <button
            className="w-9 h-9 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-white transition"
            onClick={() => onChange(1)}
            type="button"
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className="text-slate-500 text-xs px-1">...</span>}
        </>
      )}
      {visiblePages.map((p) => (
        <button
          key={p}
          className={`w-9 h-9 text-xs font-semibold rounded-lg border transition ${
            p === page
              ? "bg-indigo-600 !text-slate-50 border-transparent"
              : "border-slate-200 text-indigo-600 hover:bg-white"
          }`}
          onClick={() => onChange(p)}
          type="button"
        >
          {p}
        </button>
      ))}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="text-slate-500 text-xs px-1">...</span>
          )}
          <button
            className="w-9 h-9 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-white transition"
            onClick={() => onChange(totalPages)}
            type="button"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        type="button"
      >
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

interface StorageFileItem {
  name: string;
  size: number | null;
  updated_at: string | null;
  public_url: string;
}

function FolderDownloadModal({
  open,
  onClose,
  target,
  title,
}: {
  open: boolean;
  onClose: () => void;
  target: string;
  title: string;
}) {
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const hf = (url: string) => {
    const t = url.replace(/^\/+/, "").replace(/\/+$/, "");
    const n = t.indexOf("/");
    return n < 0 ? { bucket: t, prefix: "" } : { bucket: t.slice(0, n), prefix: t.slice(n + 1) };
  };

  useEffect(() => {
    if (!open || !target) return;

    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setIsLoading(true);
        setError(false);
        setFiles([]);
      }
    });

    const { bucket, prefix } = hf(target);
    const params = new URLSearchParams({ bucket, prefix });

    fetch(`/api/work-tools/storage?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch storage files");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setFiles(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, target]);

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col z-10 animate-in fade-in-0 duration-200">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{target}</p>
          </div>
          <button
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
            onClick={onClose}
            aria-label="닫기"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[150px]">
          {isLoading ? (
            <div className="flex flex-col gap-2 py-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-11 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>파일 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-slate-200 bg-slate-50/40 rounded-xl">
              등록된 파일이 없습니다.
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.name}>
                  <a
                    className="flex items-center justify-between gap-3 px-4 py-3 border border-slate-200 bg-white hover:border-indigo-500 hover:bg-slate-50/30 rounded-xl group transition-all"
                    href={file.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-500 transition-colors">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {file.size && (
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {formatSize(file.size)}
                        </span>
                      )}
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            className="px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { key: "underweight", label: "저체중", tone: "info", color: "#60a5fa" };
  if (bmi < 23) return { key: "normal", label: "정상", tone: "success", color: "#10b981" };
  if (bmi < 25) return { key: "overweight", label: "과체중", tone: "warning", color: "#f59e0b" };
  if (bmi < 30) return { key: "obese1", label: "비만 (1단계)", tone: "warning", color: "#f97316" };
  return { key: "obese2", label: "고도비만", tone: "danger", color: "#ef4444" };
}

function getBmiUnderwriting(bmi: number) {
  if (bmi < 17) {
    return {
      label: "인수 거절 가능",
      desc: "BMI 17 미만은 다수 보험사가 가입 거절·조건부 인수. 영양상태·기저질환 확인 필요.",
      tone: "danger"
    };
  }
  if (bmi < 18.5) {
    return {
      label: "조건부 가입",
      desc: "저체중은 표준체 가입 어렵고 일부 보험사 할증·부담보 부과 가능.",
      tone: "warning"
    };
  }
  if (bmi < 25) {
    return {
      label: "표준체 가입 가능",
      desc: "대부분 보험사에서 정상 인수 — 다른 고지사항이 없다면 표준 보험료.",
      tone: "success"
    };
  }
  if (bmi < 30) {
    return {
      label: "할증 가능성",
      desc: "BMI 25–29 구간은 보험사별로 표준체 또는 소폭 할증(10–25%) 적용.",
      tone: "warning"
    };
  }
  if (bmi < 35) {
    return {
      label: "할증 또는 부담보",
      desc: "BMI 30–34 는 대부분 할증(25–50%) 또는 특정 부담보. 사전 인수 문의 권장.",
      tone: "warning"
    };
  }
  return {
    label: "인수 거절 가능",
    desc: "BMI 35 이상은 다수 보험사가 신규 가입 거절. 인수 가능 보험사 선별 필요.",
    tone: "danger"
  };
}

const savingsTaxRates = {
  general: 0.154,
  tax_free: 0,
  preferential: 0.095
};

function calculateSavings(
  mode: "simple" | "compound",
  taxType: "general" | "preferential" | "tax_free",
  principal: number,
  monthly: number,
  months: number,
  annualRatePct: number
) {
  if (months <= 0 || annualRatePct < 0 || (principal <= 0 && monthly <= 0)) return null;
  const s = annualRatePct / 100;
  let preTaxInterest = 0;
  const totalPrincipal = principal + monthly * months;

  if (mode === "simple") {
    if (principal > 0) {
      preTaxInterest += principal * s * (months / 12);
    }
    if (monthly > 0) {
      preTaxInterest += (monthly * s / 12) * ((months * (months + 1)) / 2);
    }
  } else {
    const e = s / 12;
    if (principal > 0) {
      preTaxInterest += principal * (Math.pow(1 + e, months) - 1);
    }
    if (monthly > 0) {
      const term = e === 0 ? monthly * months : monthly * (Math.pow(1 + e, months) - 1) / e;
      preTaxInterest += term - monthly * months;
    }
  }

  const taxRate = savingsTaxRates[taxType];
  const tax = preTaxInterest * taxRate;
  const postTaxInterest = preTaxInterest - tax;
  const maturityPreTax = totalPrincipal + preTaxInterest;
  const maturityPostTax = totalPrincipal + postTaxInterest;
  const effectiveRate = totalPrincipal > 0 ? (postTaxInterest / totalPrincipal) * (12 / months) * 100 : 0;

  return {
    totalPrincipal,
    preTaxInterest,
    tax,
    postTaxInterest,
    maturityPreTax,
    maturityPostTax,
    effectiveRate
  };
}

/* ── Shared row + tip components for calculator results ── */
function ResultRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${bold ? 'border-b border-slate-200' : 'border-b border-dashed border-slate-200/80'} ${highlight ? 'text-indigo-500 font-bold text-base sm:text-lg' : ''}`}>
      <span className={bold ? 'font-semibold text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className={bold ? 'font-bold text-slate-900' : 'font-medium text-slate-900'}>{value}</span>
    </div>
  );
}

function TipBox({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold text-indigo-600 mb-2">💡 {title}</p>
      <div className="text-xs leading-relaxed text-slate-500 break-keep">{children}</div>
    </div>
  );
}

const inputCls = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const selectCls = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30";
const radioCls = (active: boolean) => `py-2 px-3 text-xs font-semibold rounded-lg border transition cursor-pointer text-center ${active ? 'bg-indigo-600 !text-slate-50 border-transparent' : 'bg-slate-50 text-indigo-600 border-slate-200 hover:bg-slate-100'}`;

function CalculatorTool({ id }: { id: ToolId }) {
  switch (id) {
    case "insurance-age": return <InsuranceAgeCalc />;
    case "silbi-calculator": return <SilbiCalc />;
    case "currency-value": return <CurrencyValueCalc />;
    case "loan": return <LoanCalc />;
    case "net-salary": return <NetSalaryCalc />;
    case "earned-tax": return <EarnedTaxCalc />;
    case "comp-tax": return <CompTaxCalc />;
    case "inheritance-tax": return <InheritanceTaxCalc />;
    case "card-deduction": return <CardDeductionCalc />;
    case "vat": return <VatCalc />;
    case "bmi-calculator": return <BmiCalc />;
    case "savings": return <SavingsCalc />;
    default: return null;
  }
}

/* ── Insurance Age ── */
function InsuranceAgeCalc() {
  const [birthInput, setBirthInput] = useState('');
  const birth = useMemo(() => parseBirthDate(birthInput), [birthInput]);
  const result = useMemo(() => birth ? calcInsuranceAge(birth, new Date()) : null, [birth]);
  return (
    <PanelShell description="생년월일 기준 만 나이와 보험나이를 계산하고, 보험나이 변경일까지 남은 일수를 알려줍니다." id="insurance-age" title="보험나이 계산기">
      <label className="block max-w-xs">
        <span className="text-sm font-semibold text-slate-700">생년월일 8자리</span>
        <input className={inputCls} placeholder="예: 19900115" value={birthInput} onChange={e => setBirthInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))} inputMode="numeric" />
      </label>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-indigo-600">계산 결과</p>
        {result ? (
          <div className="mt-3 space-y-0.5 text-sm">
            <ResultRow label="만 나이" value={`${result.realAge}세`} bold />
            <ResultRow label="보험나이" value={`${result.insuranceAge}세`} highlight />
            <ResultRow label="다음 보험나이 변경일" value={fmtDate(result.nextChange)} />
            <ResultRow label="변경일까지 남은 일수" value={`${result.daysToNext}일`} />
            <ResultRow label="기준일" value={fmtDate(new Date())} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-900 font-semibold">생년월일 8자리를 입력하세요.</p>
        )}
      </div>
      {result && result.daysToNext <= 30 && (
        <TipBox title="보험나이 변경 임박">
          보험나이가 {result.daysToNext}일 이내에 변경될 수 있습니다. 상품·약관별 적용 시점은 보험사 공식 자료로 확인하세요.
        </TipBox>
      )}
    </PanelShell>
  );
}

/* ── Silbi (실손의료비) ── */
function SilbiCalc() {
  const [gen, setGen] = useState<SilbiGen>('5');
  const [treatType, setTreatType] = useState<SilbiType>('outpatient');
  const [facility, setFacility] = useState<SilbiFacility>('clinic');
  const [benefit, setBenefit] = useState('');
  const [nonBenefit, setNonBenefit] = useState('');
  const [nonBenefitHeavy, setNonBenefitHeavy] = useState('');
  const [nonBenefitLight, setNonBenefitLight] = useState('');
  const [pharmaBenefit, setPharmaBenefit] = useState('');
  const [pharmaNonBenefit, setPharmaNonBenefit] = useState('');

  const result = useMemo(() => {
    const b = Number(benefit) || 0;
    const nb = Number(nonBenefit) || 0;
    const nbh = Number(nonBenefitHeavy) || 0;
    const nbl = Number(nonBenefitLight) || 0;
    const pb = Number(pharmaBenefit) || 0;
    const pnb = Number(pharmaNonBenefit) || 0;
    
    if (b + nb + nbh + nbl <= 0) return null;
    return calcSilbi(gen, treatType, facility, { 
      benefit: b, 
      nonBenefit: nb, 
      nonBenefitHeavy: nbh, 
      nonBenefitLight: nbl, 
      pharmaBenefit: pb, 
      pharmaNonBenefit: pnb 
    });
  }, [gen, treatType, facility, benefit, nonBenefit, nonBenefitHeavy, nonBenefitLight, pharmaBenefit, pharmaNonBenefit]);

  const genDates: Record<SilbiGen, string> = {
    '1': '~ 2009년 9월 이전 (구실손)',
    '2': '2009년 10월 ~ 2017년 3월 (표준화)',
    '3': '2017년 4월 ~ 2021년 6월 (착한실손)',
    '4': '2021년 7월 ~ 2026년 5월 5일',
    '5': '2026년 5월 6일 이후 ~ 현재'
  };

  return (
    <PanelShell description={SILBI_CALC_DESCRIPTION} id="silbi-calculator" title={SILBI_CALC_TITLE}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="col-span-full lg:col-span-1">
          <span className="text-sm font-bold text-[#1e293b]">실손 가입 세대</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(['1','2','3','4','5'] as SilbiGen[]).map(g => (
              <button key={g} type="button" className={radioCls(gen===g)} onClick={() => setGen(g)}>{g}세대</button>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1.5 rounded inline-block">
            📅 가입기간: {genDates[gen]}
          </p>
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-700">진료 구분</span>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button type="button" className={radioCls(treatType==='outpatient')} onClick={() => setTreatType('outpatient')}>통원 진료</button>
            <button type="button" className={radioCls(treatType==='inpatient')} onClick={() => setTreatType('inpatient')}>입원 진료</button>
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-700">방문 의료기관</span>
          <select className={`${selectCls} mt-2 py-2.5`} value={facility} onChange={e => setFacility(e.target.value as SilbiFacility)}>
            <option value="clinic">의원급 (공제 1만원)</option>
            <option value="general">병원/종합병원 (공제 1.5만원)</option>
            <option value="tertiary">상급종합병원 (공제 2만원)</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <span className="text-sm font-bold text-slate-700 mb-3 block">진료비 및 약제비 영수증 입력</span>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <label className="block"><span className="text-xs font-semibold text-slate-600">급여 진료비 총액</span><input className={`${inputCls} bg-white`} placeholder="예: 80000" value={benefit} onChange={e => setBenefit(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
          
          {gen === '5' ? (
            <>
              <label className="block"><span className="text-xs font-bold text-amber-600">중증 비급여 (특약1)</span><input className={`${inputCls} bg-amber-50 border-amber-200`} placeholder="예: 40000" value={nonBenefitHeavy} onChange={e => setNonBenefitHeavy(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
              <label className="block"><span className="text-xs font-bold text-rose-600">비중증 비급여 (도수/주사 등)</span><input className={`${inputCls} bg-rose-50 border-rose-200`} placeholder="예: 100000" value={nonBenefitLight} onChange={e => setNonBenefitLight(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            </>
          ) : (
            <label className="block"><span className="text-xs font-semibold text-slate-600">비급여 진료비 총액</span><input className={`${inputCls} bg-white`} placeholder="예: 40000" value={nonBenefit} onChange={e => setNonBenefit(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
          )}

          {treatType === 'outpatient' && (
            <>
              <label className="block"><span className="text-xs font-semibold text-slate-600">급여 약제비</span><input className={`${inputCls} bg-white`} placeholder="예: 5000" value={pharmaBenefit} onChange={e => setPharmaBenefit(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
              {gen !== '5' && (
                <label className="block"><span className="text-xs font-semibold text-slate-600">비급여 약제비</span><input className={`${inputCls} bg-white`} placeholder="예: 10000" value={pharmaNonBenefit} onChange={e => setPharmaNonBenefit(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
        <p className="text-xs font-bold text-blue-800 mb-4">{SILBI_RESULT_SECTION_TITLE}</p>
        {result ? (
          <div className="space-y-1.5 text-sm">
            <ResultRow label="총 진료비+약제비 결제액" value={money(result.totalPaid)} />
            <div className="my-2 border-t border-dashed border-blue-200"></div>
            {result.breakdown.map(r => (
              <div key={r.label} className="flex justify-between items-center py-1">
                 <span className="text-slate-600 flex items-center gap-2">
                   {r.label} 공제액
                   <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-medium">{r.memo}</span>
                 </span>
                 <span className="font-medium text-slate-700">-{money(r.selfPay)}</span>
              </div>
            ))}
            <div className="my-2 border-t border-blue-200"></div>
            <ResultRow label="고객 최종 자기부담금" value={money(result.selfPay)} bold />
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 flex justify-between items-center">
               <span className="font-bold text-blue-900">{SILBI_REFERENCE_BALANCE_LABEL}</span>
               <span className="text-xl font-black text-blue-600">{money(result.referenceBalance)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 break-keep">{WORK_TOOLS_CLAIM_BOUNDARY_NOTICE}</p>
          </div>
        ) : <p className="mt-2 text-sm text-slate-400 font-semibold text-center py-4">영수증에 적힌 급여/비급여 금액을 입력하세요.</p>}
      </div>
      
      <TipBox title="세대별 실손 참고 안내">
        {SILBI_GEN_TIPS[gen]}
      </TipBox>
    </PanelShell>
  );
}

/* ── Currency Value ── */
function CurrencyValueCalc() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const [dir, setDir] = useState<'future' | 'present'>('future');
  const result = useMemo(() => calcCurrencyValue(Number(amount) || 0, Number(rate) || 0, Number(years) || 0, dir), [amount, rate, years, dir]);
  return (
    <PanelShell description="현재 금액의 미래 명목가치와 구매력 변화를 계산합니다." id="currency-value" title="화폐가치 계산기">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block"><span className="text-sm font-semibold text-slate-700">금액</span><input className={inputCls} placeholder="예: 10000000" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">연 상승률(%)</span><input className={inputCls} placeholder="예: 3" value={rate} onChange={e => setRate(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">기간(년)</span><input className={inputCls} placeholder="예: 10" value={years} onChange={e => setYears(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <div>
          <span className="text-sm font-semibold text-slate-700">계산 방향</span>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <button type="button" className={radioCls(dir==='future')} onClick={() => setDir('future')}>미래가치</button>
            <button type="button" className={radioCls(dir==='present')} onClick={() => setDir('present')}>현재가치</button>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-indigo-600">계산 결과</p>
        {result ? (
          <div className="mt-3 space-y-0.5 text-sm">
            <ResultRow label="입력 금액" value={money(Number(amount))} />
            <ResultRow label={`${years}년 후 명목가치`} value={money(result.nominal)} highlight />
            <ResultRow label="실질 구매력" value={money(result.real)} bold />
            <ResultRow label="누적 상승률" value={`${result.cumulative.toFixed(1)}%`} />
            <ResultRow label="구매력 감소율" value={`${result.purchasingLoss.toFixed(1)}%`} />
          </div>
        ) : <p className="mt-2 text-sm text-slate-900 font-semibold">금액과 기간을 입력하세요.</p>}
      </div>
      <TipBox title="상담 활용 팁">
        고객에게 보장 금액의 실질 가치 하락을 설명할 때 활용하세요. 예: &quot;지금 1억 보장이 {years}년 후에는 구매력 기준 {result ? money(result.real) : '-'}에 불과합니다.&quot;
      </TipBox>
    </PanelShell>
  );
}

/* ── Loan ── */
function LoanCalc() {
  const [mode, setMode] = useState<LoanMode>('equal_payment');
  const [principal, setPrincipal] = useState('');
  const [ratePct, setRatePct] = useState('4.5');
  const [months, setMonths] = useState('360');
  const result = useMemo(() => calcLoan({ mode, principal: Number(principal) || 0, months: Number(months) || 0, ratePct: Number(ratePct) || 0 }), [mode, principal, ratePct, months]);
  return (
    <PanelShell description="원리금균등, 원금균등, 만기일시 상환 방식별 월 납입액과 총 이자를 계산합니다." id="loan" title="대출 이자 계산기">
      <div className="mb-3">
        <span className="text-sm font-semibold text-slate-700">상환 방식</span>
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          <button type="button" className={radioCls(mode==='equal_payment')} onClick={() => setMode('equal_payment')}>원리금균등</button>
          <button type="button" className={radioCls(mode==='equal_principal')} onClick={() => setMode('equal_principal')}>원금균등</button>
          <button type="button" className={radioCls(mode==='bullet')} onClick={() => setMode('bullet')}>만기일시</button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><span className="text-sm font-semibold text-slate-700">대출 원금</span><input className={inputCls} placeholder="예: 100000000" value={principal} onChange={e => setPrincipal(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">연 금리(%)</span><input className={inputCls} placeholder="예: 4.5" value={ratePct} onChange={e => setRatePct(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">기간(개월)</span><input className={inputCls} placeholder="예: 360" value={months} onChange={e => setMonths(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-indigo-600">계산 결과</p>
        {result ? (
          <div className="mt-3 space-y-0.5 text-sm">
            <ResultRow label="첫 달 납입액" value={money(result.first)} bold />
            {mode === 'equal_principal' && <ResultRow label="중간 달 납입액" value={money(result.mid)} />}
            {mode !== 'equal_payment' && <ResultRow label="마지막 달 납입액" value={money(result.last)} />}
            <ResultRow label="총 이자" value={money(result.totalInterest)} />
            <ResultRow label="총 상환액" value={money(result.totalPayment)} highlight />
          </div>
        ) : <p className="mt-2 text-sm text-slate-900 font-semibold">대출 정보를 입력하세요.</p>}
      </div>
      <TipBox title="상환 방식 비교">
        원리금균등은 매월 같은 금액, 원금균등은 초기 부담이 크지만 총 이자가 적고, 만기일시는 매월 이자만 납부하다 만기에 원금을 상환합니다.
      </TipBox>
    </PanelShell>
  );
}

/* ── Net Salary ── */
function NetSalaryCalc() {
  const [grossAnnual, setGrossAnnual] = useState('');
  const [nonTaxable, setNonTaxable] = useState('1200000');
  const [dependents, setDependents] = useState('1');
  const [children, setChildren] = useState('0');
  const result = useMemo(() => calcNetSalary({ grossAnnual: Number(grossAnnual) || 0, nonTaxable: Number(nonTaxable) || 0, dependents: Number(dependents) || 1, children: Number(children) || 0 }), [grossAnnual, nonTaxable, dependents, children]);
  return (
    <PanelShell description="연봉 기준 4대 보험, 소득세, 지방소득세를 계산하여 월 실수령액을 알려줍니다." id="net-salary" title="연봉 실수령액 계산기">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block"><span className="text-sm font-semibold text-slate-700">연봉(세전)</span><input className={inputCls} placeholder="예: 50000000" value={grossAnnual} onChange={e => setGrossAnnual(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">비과세액(연)</span><input className={inputCls} placeholder="예: 1200000" value={nonTaxable} onChange={e => setNonTaxable(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">부양가족 수</span><input className={inputCls} placeholder="예: 1" value={dependents} onChange={e => setDependents(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">20세 이하 자녀</span><input className={inputCls} placeholder="예: 0" value={children} onChange={e => setChildren(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-indigo-600">계산 결과</p>
        {result ? (
          <div className="mt-3 space-y-0.5 text-sm">
            <ResultRow label="연봉(세전)" value={money(result.grossAnnual)} />
            <ResultRow label="과세 대상" value={money(result.taxable)} />
            <ResultRow label="근로소득공제" value={money(result.workDed)} />
            <ResultRow label="과세표준" value={money(result.taxBase)} />
            <ResultRow label="산출세액" value={money(result.gross)} />
            <ResultRow label="근로소득세액공제" value={`-${money(result.workCredit)}`} />
            <ResultRow label="소득세(결정)" value={money(result.finalTax)} bold />
            <ResultRow label="지방소득세" value={money(result.localTax)} />
            <p className="text-[10px] font-bold text-slate-500 pt-2">월 공제 내역</p>
            <ResultRow label="국민연금" value={money(result.mb.pension)} />
            <ResultRow label="건강보험" value={money(result.mb.health)} />
            <ResultRow label="장기요양" value={money(result.mb.longcare)} />
            <ResultRow label="고용보험" value={money(result.mb.employment)} />
            <ResultRow label="소득세" value={money(result.mb.incomeTax)} />
            <ResultRow label="지방소득세" value={money(result.mb.localTax)} />
            <ResultRow label="연간 총 공제" value={money(result.totalDed)} bold />
            <ResultRow label="연 실수령액" value={money(result.netAnnual)} />
            <ResultRow label="월 실수령액" value={money(result.netMonthly)} highlight />
          </div>
        ) : <p className="mt-2 text-sm text-slate-900 font-semibold">연봉을 입력하세요.</p>}
      </div>
      <TipBox title="상담 활용 팁">
        연봉 대비 실수령액 차이를 보여주면 보장성 보험 보험료 부담 설명이 수월해집니다. 비과세 항목(식대 등)이 있다면 비과세액을 수정하세요.
      </TipBox>
    </PanelShell>
  );
}

/* ── Earned Tax ── */
function EarnedTaxCalc() {
  const [salary, setSalary] = useState('');
  const result = useMemo(() => calcEarnedTax(Number(salary) || 0), [salary]);
  return (
    <PanelShell description="총 급여에서 근로소득공제를 적용한 간편 소득세를 계산합니다." id="earned-tax" title="간편 근로소득세 계산기">
      <label className="block max-w-xs">
        <span className="text-sm font-semibold text-slate-700">총 급여(연간)</span>
        <input className={inputCls} placeholder="예: 50000000" value={salary} onChange={e => setSalary(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" />
      </label>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-indigo-600">계산 결과</p>
        {result ? (
          <div className="mt-3 space-y-0.5 text-sm">
            <ResultRow label="총 급여" value={money(result.salary)} />
            <ResultRow label="근로소득공제" value={money(result.wd)} />
            <ResultRow label="과세표준" value={money(result.tb)} />
            <ResultRow label="적용 구간" value={result.label} />
            <ResultRow label="산출세액" value={money(result.gt)} bold />
            <ResultRow label="지방소득세" value={money(result.lt)} />
            <ResultRow label="합계" value={money(result.total)} highlight />
            <ResultRow label="실효세율" value={`${result.effectiveRate.toFixed(2)}%`} />
          </div>
        ) : <p className="mt-2 text-sm text-slate-900 font-semibold">총 급여를 입력하세요.</p>}
      </div>
    </PanelShell>
  );
}

/* ── Comprehensive Tax (Premium) ── */
function CompTaxCalc() {
  const [rental, setRental] = useState('');
  const [other, setOther] = useState('');
  const [expense, setExpense] = useState('');
  const [dependents, setDependents] = useState('1');
  const [otherDeduction, setOtherDeduction] = useState('0');
  const [children, setChildren] = useState('0');
  const [otherCredit, setOtherCredit] = useState('0');

  const result = useMemo(() => calcCompTax({ 
    rental: Number(rental) || 0, 
    other: Number(other) || 0, 
    expense: Number(expense) || 0, 
    dependents: Number(dependents) || 1, 
    otherDeduction: Number(otherDeduction) || 0, 
    children: Number(children) || 0, 
    otherCredit: Number(otherCredit) || 0 
  }), [rental, other, expense, dependents, otherDeduction, children, otherCredit]);

  const chartData = result ? [
    { name: '공제 전 세액', value: result.gt },
    { name: '공제 후 결정세액', value: result.finalTax },
    { name: '연금저축/IRP 반영(가정)', value: Math.max(0, result.finalTax - result.pensionSaving) }
  ] : [];

  return (
    <PanelShell description="종합소득 과세표준 기준 간편 산출세액과 프리랜서/사업자 절세의 핵심인 IRP/연금저축 세액공제 효과를 시뮬레이션합니다." id="comp-tax" title="프리미엄 종소세 & 절세 시뮬레이터">
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-slate-700">사업/임대소득</span><input className={inputCls} placeholder="예: 45000000" value={rental} onChange={e => setRental(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">기타소득</span><input className={inputCls} placeholder="예: 5000000" value={other} onChange={e => setOther(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">필요경비</span><input className={inputCls} placeholder="예: 10000000" value={expense} onChange={e => setExpense(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">부양가족 (본인포함)</span><input className={inputCls} placeholder="예: 2" value={dependents} onChange={e => setDependents(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">자녀 수</span><input className={inputCls} placeholder="예: 1" value={children} onChange={e => setChildren(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">기타 소득공제 합계</span><input className={inputCls} placeholder="예: 0" value={otherDeduction} onChange={e => setOtherDeduction(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block sm:col-span-2"><span className="text-sm font-semibold text-slate-700">기타 세액공제 합계</span><input className={inputCls} placeholder="예: 0" value={otherCredit} onChange={e => setOtherCredit(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
          </div>
        </div>

        <div>
          {result ? (
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-indigo-600 mb-4">연금저축 절세 시뮬레이션</p>
              <div className="h-40 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'slate-500' }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(val: number) => `${(val/10000).toFixed(0)}만`} tick={{ fontSize: 10, fill: 'slate-500' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: unknown) => [`${Number(value).toLocaleString()} 원`, '세액']} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : index === 1 ? '#6366f1' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-sm mt-4 border-t border-slate-100 pt-4">
                <ResultRow label="종합소득 과세표준" value={krw(result.tb)} />
                <ResultRow label="산출세액" value={krw(result.gt)} bold />
                <ResultRow label="세액공제 합계 (자녀+기타)" value={`-${krw(result.totalCredit)}`} />
                <div className="my-1 border-t border-dashed border-slate-200/80"></div>
                <ResultRow label="결정세액 (지방세포함)" value={krw(result.totalTax)} highlight />
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                <span className="text-[11px] font-bold text-emerald-700 block mb-1">💡 IRP/연금저축(납입한도 900만원) 가입 시 추가 절세액</span>
                <span className="text-lg font-black text-emerald-600">최대 {krw(result.pensionSaving)} 절세</span>
                <span className="text-[10px] text-emerald-600/70 block mt-0.5">적용 공제율: {(result.pensionRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          ) : (
             <div className="h-full min-h-[300px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center p-8 text-center">
               <p className="text-sm font-semibold text-slate-400">종합소득 항목을 입력하여<br/>절세액을 확인하세요.</p>
             </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

/* ── Inheritance Tax (Premium) ── */
function InheritanceTaxCalc() {
  const [estate, setEstate] = useState('');
  const [debts, setDebts] = useState('0');
  const [priorGift, setPriorGift] = useState('0');
  const [financialAssets, setFinancialAssets] = useState('0');
  const [homeValue, setHomeValue] = useState('0');
  const [spouseMode, setSpouseMode] = useState<'none' | 'legal' | 'actual'>('legal');
  const [spouseActual, setSpouseActual] = useState('0');
  const [children, setChildren] = useState('2');
  const [skipGeneration, setSkipGeneration] = useState(false);
  const [recentDeathYears, setRecentDeathYears] = useState<'none'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'>('none');

  const result = useMemo(() => {
    const e = Number(estate) || 0;
    if (e <= 0) return null;
    const calc = calcInheritance({ 
      estate: e, debts: Number(debts) || 0, priorGift: Number(priorGift) || 0, 
      financialAssets: Number(financialAssets) || 0, homeValue: Number(homeValue) || 0, 
      spouseMode, spouseActual: Number(spouseActual) || 0, children: Number(children) || 0 
    });
    
    // 할증 및 공제 로직
    let generationSurcharge = 0;
    if (skipGeneration) generationSurcharge = calc.grossTax * 0.3;
    
    let shortTermDeduction = 0;
    if (recentDeathYears !== 'none') {
      const deductionRate = 100 - (Number(recentDeathYears) * 10);
      shortTermDeduction = (calc.grossTax + generationSurcharge) * (deductionRate / 100);
    }
    
    const finalGrossTax = calc.grossTax + generationSurcharge - shortTermDeduction;
    const finalReportCredit = finalGrossTax * 0.03;
    const finalNetTax = Math.max(0, finalGrossTax - finalReportCredit);
    
    return { ...calc, generationSurcharge, shortTermDeduction, finalGrossTax, finalReportCredit, finalNetTax };
  }, [estate, debts, priorGift, financialAssets, homeValue, spouseMode, spouseActual, children, skipGeneration, recentDeathYears]);

  const pieData = result ? [
    { name: '세후 상속재산', value: result.estate - result.finalNetTax, fill: '#10b981' },
    { name: '납부할 상속세', value: result.finalNetTax, fill: '#ef4444' }
  ] : [];

  return (
    <PanelShell description="상속재산, 공제항목 및 단기재상속/세대생략 조건을 반영하여 정밀한 상속세를 계산합니다." id="inheritance-tax" title="프리미엄 상속세/증여세 진단기">
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-4">
           <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="text-sm font-bold text-[#1e293b]">총 상속재산</span><input className={`${inputCls} border-blue-300 bg-blue-50/30 text-lg py-3`} placeholder="예: 2000000000" value={estate} onChange={e => setEstate(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">채무·장례비</span><input className={inputCls} placeholder="예: 100000000" value={debts} onChange={e => setDebts(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">사전증여(10년)</span><input className={inputCls} placeholder="예: 0" value={priorGift} onChange={e => setPriorGift(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">순수 금융재산</span><input className={inputCls} placeholder="예: 300000000" value={financialAssets} onChange={e => setFinancialAssets(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">동거주택 가액</span><input className={inputCls} placeholder="예: 0" value={homeValue} onChange={e => setHomeValue(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">자녀 수</span><input className={inputCls} placeholder="예: 2" value={children} onChange={e => setChildren(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            
            <div className="sm:col-span-2 border-t border-slate-200 mt-2 pt-4">
              <span className="text-sm font-bold text-slate-700 mb-2 block">배우자 상속 조건</span>
              <div className="grid grid-cols-2 gap-3">
                <select className={selectCls} value={spouseMode} onChange={e => setSpouseMode(e.target.value as 'none' | 'legal' | 'actual')}>
                  <option value="none">배우자 없음 (공제 0원)</option>
                  <option value="legal">법정상속분 (최소 5억~최대 30억)</option>
                  <option value="actual">실제상속분 (직접 입력)</option>
                </select>
                {spouseMode === 'actual' && (
                  <input className={inputCls} placeholder="실제 상속액 입력" value={spouseActual} onChange={e => setSpouseActual(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2 border-t border-slate-200 mt-2 pt-4">
              <span className="text-sm font-bold text-slate-700 mb-2 block">특례 및 할증 조건</span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" checked={skipGeneration} onChange={(e) => setSkipGeneration(e.target.checked)} />
                  세대생략 상속 (30% 할증)
                </label>
                <div>
                  <select className={selectCls} value={recentDeathYears} onChange={e => setRecentDeathYears(e.target.value as "none" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10")}>
                    <option value="none">단기재상속 해당없음</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(y => <option key={y} value={y}>{y}년 이내 이전 상속 발생</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {result ? (
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-indigo-600 mb-4">상속세 자금 출처 분석</p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={40} outerRadius={60} dataKey="value" stroke="none" paddingAngle={3}>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value: unknown) => [`${Number(value).toLocaleString()} 원`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-1.5 text-sm">
                  <ResultRow label="총 공제액 합계" value={krw(result.totalDeduction)} />
                  <ResultRow label="상속 과세표준" value={krw(result.taxBase)} />
                  <div className="my-1 border-t border-slate-200"></div>
                  <ResultRow label="기본 산출세액" value={krw(result.grossTax)} bold />
                  {skipGeneration && <ResultRow label="세대생략 할증(+)" value={krw(result.generationSurcharge)} />}
                  {recentDeathYears !== 'none' && <ResultRow label="단기재상속 공제(-)" value={krw(result.shortTermDeduction)} />}
                  <ResultRow label="신고세액 공제(-)" value={krw(result.finalReportCredit)} />
                  <div className="my-1 border-t border-dashed border-slate-200/80"></div>
                  <ResultRow label="최종 납부 상속세" value={krw(result.finalNetTax)} highlight />
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full min-h-[300px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center p-8 text-center">
               <p className="text-sm font-semibold text-slate-400">상속재산과 부채를 입력하여<br/>내부 참고용 상속세 산출을 확인하세요.</p>
             </div>
          )}
        </div>
      </div>
      <TipBox title="상속세 참고 안내">
        {result && result.finalNetTax > 0
          ? `내부 참고용 산출 상속세는 ${krw(result.finalNetTax)}입니다. 실제 세액·공제·신고는 세무 전문가·관할 기관 기준으로 확인하세요. 특정 상품 가입·해지를 권유하지 마세요.`
          : "이 계산기는 내부 참고용이며, 실제 상속세·재원 마련 방안은 세무·법무 전문가와 공식 자료로 확인하세요."}
      </TipBox>
    </PanelShell>
  );
}

/* ── Card Deduction (Premium) ── */
function CardDeductionCalc() {
  const [salary, setSalary] = useState('');
  const [card, setCard] = useState('');
  const [cash, setCash] = useState('');
  
  const result = useMemo(() => {
    const s = Number(salary) || 0;
    const cd = Number(card) || 0;
    const cs = Number(cash) || 0;
    if (s <= 0) return null;
    
    const base = calcCardDeduction({ salary: s, card: cd, cash: cs });
    if (!base) return null;

    const minUsage = base.minUsage;
    const totalUsed = cd + cs;
    const isMinMet = totalUsed >= minUsage;
    const progressPct = Math.min((totalUsed / (s * 0.5)) * 100, 100); 
    const thresholdPct = 50; 
    
    let guideMessage = '';
    if (!isMinMet) {
      const remaining = minUsage - totalUsed;
      guideMessage = `공제 문턱(연봉의 25%)까지 아직 ${krw(remaining)} 부족합니다. 남은 금액은 각종 할인/포인트 혜택이 좋은 신용카드를 우선 사용하여 문턱을 채우세요.`;
    } else {
      const remainCap = base.cap - base.final;
      if (remainCap > 0) {
        guideMessage = `공제 문턱을 돌파했습니다! 지금부터는 공제율이 2배 높은(30%) 현금/체크카드만 사용하세요. 공제 한도를 꽉 채우려면 현금/체크카드로 약 ${krw(remainCap / 0.3)} 추가 소비가 필요합니다.`;
      } else {
        guideMessage = `소득공제 한도(${krw(base.cap)})를 모두 채웠습니다! 더 이상의 카드 소비는 소득공제 효과가 없으니 혜택(마일리지/할인) 위주의 신용카드를 편하게 사용하세요.`;
      }
    }
    
    return { ...base, s, cd, cs, isMinMet, progressPct, thresholdPct, guideMessage };
  }, [salary, card, cash]);

  return (
    <PanelShell description="연봉 및 결제 수단별 사용액을 분석하여 연말정산 공제 극대화를 위한 '소비 황금비율'을 가이드합니다." id="card-deduction" title="프리미엄 카드공제 최적화 분석기">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <label className="block"><span className="text-sm font-semibold text-slate-700">총 급여(연봉)</span><input className={inputCls} placeholder="예: 60000000" value={salary} onChange={e => setSalary(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">현재까지 신용카드 누적액</span><input className={inputCls} placeholder="예: 12000000" value={card} onChange={e => setCard(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">현금영수증/체크카드 누적액</span><input className={inputCls} placeholder="예: 3000000" value={cash} onChange={e => setCash(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
      </div>

      {result ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-700 mb-5">공제 문턱(25%) 달성 현황</p>
            <div className="relative w-full h-8 bg-slate-100 rounded-full overflow-hidden">
               <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-400 z-10" style={{ left: `${result.thresholdPct}%` }}></div>
               <div className="absolute top-8 text-[10px] text-slate-500 font-bold -translate-x-1/2 mt-1" style={{ left: `${result.thresholdPct}%` }}>25% 문턱</div>
               <div className={`h-full transition-all duration-1000 ${result.isMinMet ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${result.progressPct}%` }}></div>
            </div>
            <div className="mt-7 flex justify-between text-sm font-semibold">
              <span className="text-slate-500">현재 누적 사용액: {krw(result.cd + result.cs)}</span>
              <span className="text-indigo-500">문턱 도달 기준액: {krw(result.minUsage)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
             <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
               <p className="text-xs font-bold text-slate-500 mb-3">소득공제 산출 내역</p>
               <div className="space-y-1.5 text-sm text-slate-700">
                 <ResultRow label="카드 공제대상 (15%)" value={krw(result.cardEligible)} />
                 <ResultRow label="현금 공제대상 (30%)" value={krw(result.cashEligible)} />
                 <div className="my-1 border-t border-dashed border-slate-300"></div>
                 <ResultRow label="산출 공제액" value={krw(result.raw)} bold />
                 <ResultRow label="연봉대비 공제 한도" value={krw(result.cap)} />
                 <div className="my-1 border-t border-slate-200"></div>
                 <ResultRow label="최종 인정 공제액" value={krw(result.final)} highlight />
               </div>
             </div>
             
             <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex flex-col justify-center">
                <span className="text-sm font-bold text-blue-800 mb-2">황금비율 최적화 가이드</span>
                <p className="text-sm leading-relaxed text-blue-900 font-medium break-keep">
                  {result.guideMessage}
                </p>
                <div className="mt-4 p-3 bg-white rounded-lg text-center shadow-sm">
                   <span className="text-xs font-semibold text-slate-500 block mb-1">연말정산 세금 참고 차액</span>
                   <span className="text-2xl font-black text-blue-600">{krw(result.refund)}</span>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="h-40 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center p-8 text-center">
          <p className="text-sm font-semibold text-slate-400">급여와 카드 사용액을 입력하여<br/>소비 황금비율을 확인하세요.</p>
        </div>
      )}
    </PanelShell>
  );
}

/* ── VAT ── */
function VatCalc() {
  const [amount, setAmount] = useState('');
  const [dir, setDir] = useState<'inclusive' | 'exclusive'>('inclusive');
  const result = useMemo(() => calcVat(Number(amount) || 0, dir), [amount, dir]);
  return (
    <PanelShell description="합계금액에서 공급가액과 부가세를 분리하거나, 공급가액에 부가세를 더합니다." id="vat" title="부가세/공급가액 계산기">
      <div className="grid gap-3 sm:grid-cols-2 max-w-lg">
        <label className="block"><span className="text-sm font-semibold text-slate-700">금액</span><input className={inputCls} placeholder="예: 110000" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
        <div>
          <span className="text-sm font-semibold text-slate-700">계산 방향</span>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <button type="button" className={radioCls(dir==='inclusive')} onClick={() => setDir('inclusive')}>VAT 포함→분리</button>
            <button type="button" className={radioCls(dir==='exclusive')} onClick={() => setDir('exclusive')}>VAT 별도→합산</button>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-indigo-600">계산 결과</p>
        {result ? (
          <div className="mt-3 space-y-0.5 text-sm">
            <ResultRow label="공급가액" value={money(result.supply)} bold />
            <ResultRow label="부가세(10%)" value={money(result.vat)} />
            <ResultRow label="합계금액" value={money(result.total)} highlight />
          </div>
        ) : <p className="mt-2 text-sm text-slate-900 font-semibold">금액을 입력하세요.</p>}
      </div>
    </PanelShell>
  );
}

/* ── BMI (Premium) ── */
function BmiCalc() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);

  const result = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (h < 80 || h > 250 || w < 20 || w > 400) return null;
    
    const heightM = h / 100;
    const bmiVal = w / (heightM * heightM);
    const bmi = Math.round(bmiVal * 10) / 10;
    
    const category = getBmiCategory(bmi);
    const standardWeight = Math.round(heightM * heightM * 22 * 10) / 10;
    
    let underwriting = getBmiUnderwriting(bmi);
    if ((hasDiabetes || hasHypertension) && underwriting.tone === "success") {
      underwriting = { label: "유병자 플랜 우회 필요", desc: "체중은 정상이나 기저질환(당뇨/고혈압)으로 인해 표준체 가입이 거절될 수 있습니다. 유병자 335, 355 플랜으로 전환을 검토하세요.", tone: "danger" };
    }

    return { bmi, category, standardWeight, underwriting };
  }, [height, weight, hasDiabetes, hasHypertension]);

  return (
    <PanelShell description="고객의 체질량지수(BMI)를 계산하고, 기저질환 여부에 따라 인수 확인 포인트를 참고용으로 정리합니다." id="bmi-calculator" title="BMI 인수 확인 도구">
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-slate-700">키 (cm)</span><input className={inputCls} placeholder="예: 170" value={height} onChange={e => setHeight(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">체중 (kg)</span><input className={inputCls} placeholder="예: 65" value={weight} onChange={e => setWeight(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-700 mb-2 block">기저질환 체크 (선택)</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600" checked={hasDiabetes} onChange={(e) => setHasDiabetes(e.target.checked)} />
                당뇨병
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600" checked={hasHypertension} onChange={(e) => setHasHypertension(e.target.checked)} />
                고혈압
              </label>
            </div>
          </div>
        </div>

        <div>
          {result ? (
            <div className={`h-full rounded-xl border p-5 shadow-sm transition-colors duration-500 ${result.underwriting.tone === 'success' ? 'bg-emerald-50 border-emerald-200' : result.underwriting.tone === 'danger' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
               <p className="text-xs font-bold text-slate-500 mb-4">분석 결과</p>
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <span className="text-3xl font-black block" style={{ color: result.category.color }}>{result.bmi}</span>
                   <span className="text-sm font-bold text-slate-600">BMI 지수 ({result.category.label})</span>
                 </div>
                 <div className="text-right">
                   <span className="text-lg font-bold text-slate-700 block">{result.standardWeight} kg</span>
                   <span className="text-xs font-medium text-slate-500">권장 표준 체중</span>
                 </div>
               </div>
               
               <div className="mt-4 p-4 rounded-lg bg-white/60 border border-white backdrop-blur-sm">
                 <div className="font-bold text-sm flex items-center gap-2 mb-1 text-slate-800">
                   {result.underwriting.tone === 'success' ? '✅' : result.underwriting.tone === 'danger' ? '⛔' : '⚠️'}
                   인수 확인 참고: {result.underwriting.label}
                 </div>
                 <p className="text-xs leading-relaxed text-slate-600 break-keep">{result.underwriting.desc}</p>
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[200px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center p-8 text-center">
               <p className="text-sm font-semibold text-slate-400">고객의 신체 정보와 질환을 입력하여<br/>인수 확인 포인트를 참고하세요.</p>
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

/* ── Savings (Premium) ── */
function SavingsCalc() {
  const [deposit, setDeposit] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [months, setMonths] = useState('');
  const [savingsMode, setSavingsMode] = useState<"simple" | "compound">("compound");
  const [savingsTaxType, setSavingsTaxType] = useState<"general" | "preferential" | "tax_free">("general");

  const result = useMemo(() => {
    const d = Number(deposit) || 0;
    const m = Number(monthly) || 0;
    const r = Number(rate) || 0;
    const mo = Number(months) || 0;
    if ((d <= 0 && m <= 0) || r <= 0 || mo <= 0) return null;
    return calculateSavings(savingsMode, savingsTaxType, d, m, mo, r);
  }, [deposit, monthly, rate, months, savingsMode, savingsTaxType]);

  const pieData = result ? [
    { name: '원금 합계', value: result.totalPrincipal, fill: '#94a3b8' },
    { name: '세후 수령 이자', value: result.postTaxInterest, fill: 'indigo-500' }
  ] : [];

  return (
    <PanelShell description="예적금의 단리/복리 효과와 세금(일반/비과세)을 적용하여 세후 실제 수령액을 계산합니다." id="savings" title="프리미엄 예적금 & 복리 계산기">
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-slate-700">초기 거치금액 (예금)</span><input className={inputCls} placeholder="예: 50000000" value={deposit} onChange={e => setDeposit(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">월 적립액 (적금)</span><input className={inputCls} placeholder="예: 1000000" value={monthly} onChange={e => setMonthly(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">연 금리 (%)</span><input className={inputCls} placeholder="예: 3.5" value={rate} onChange={e => setRate(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-700">가입 기간 (개월)</span><input className={inputCls} placeholder="예: 36" value={months} onChange={e => setMonths(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" /></label>
          </div>
          
          <div className="pt-4 border-t border-slate-200 grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500">이자 계산 방식</span>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className={radioCls(savingsMode === 'simple')} onClick={() => setSavingsMode("simple")}>단리</button>
                <button type="button" className={radioCls(savingsMode === 'compound')} onClick={() => setSavingsMode("compound")}>월 복리</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500">세금 우대 혜택</span>
              <select className={selectCls} value={savingsTaxType} onChange={e => setSavingsTaxType(e.target.value as "general" | "preferential" | "tax_free")}>
                <option value="general">일반과세 (15.4%)</option>
                <option value="preferential">세금우대 (9.5%)</option>
                <option value="tax_free">비과세 (0%)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          {result ? (
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-indigo-600 mb-4">만기 수령액 시각화</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={35} outerRadius={60} dataKey="value" stroke="none" paddingAngle={2}>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value: unknown) => [`${Number(value).toLocaleString()} 원`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-1.5 text-sm">
                  <ResultRow label="총 납입 원금" value={krw(result.totalPrincipal)} />
                  <ResultRow label="세전 이자" value={`+ ${krw(result.preTaxInterest)}`} />
                  <ResultRow label={`이자 소득세 (${savingsTaxType === 'general' ? '15.4%' : savingsTaxType === 'preferential' ? '9.5%' : '0%'})`} value={`- ${krw(result.tax)}`} />
                  <div className="my-1 border-t border-dashed border-slate-200"></div>
                  <ResultRow label="세후 수령 이자" value={krw(result.postTaxInterest)} highlight />
                </div>
              </div>
              
              <div className="mt-5 p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
                <span className="text-xs font-semibold text-indigo-600 block mb-1">최종 만기 수령액 (세후)</span>
                <span className="text-2xl font-black text-indigo-500">{krw(result.maturityPostTax)}</span>
                <span className="text-xs font-medium text-slate-500 block mt-1">실효 수익률: 연 {result.effectiveRate.toFixed(2)}% (세후)</span>
              </div>
            </div>
          ) : (
             <div className="h-full min-h-[250px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center p-8 text-center">
               <p className="text-sm font-semibold text-slate-400">거치금액, 적립액, 금리 등<br/>저축 조건을 입력해주세요.</p>
             </div>
          )}
        </div>
      </div>
      
      <TipBox title="비과세 복리 저축 영업 팁">
        {savingsMode === 'simple' && savingsTaxType === 'general' ? 
          "단리+일반과세(15.4%) 조건의 일반 은행 적금은 인플레이션을 방어하기 어렵습니다. 저축성 보험의 비과세 혜택과 연복리 구조를 비교 제시하여, 고객의 장기 목적자금 마련 플랜을 저축성 보험으로 유도하세요." :
          "월복리 및 비과세 혜택이 적용될 때 수익률이 어떻게 극대화되는지 고객의 눈앞에서 즉시 보여주며, 복리 효과가 폭발적으로 일어나는 '시간의 마법'을 설명하기에 최적입니다."
        }
      </TipBox>
    </PanelShell>
  );
}

function ExternalTool({ copy }: { copy: ToolItem }) {
  return (
    <PanelShell description={copy.description} id={copy.id} title={copy.label}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold text-indigo-600">공식 출처</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{copy.source}</p>
        <p className="mt-2 break-keep text-sm leading-6 text-slate-500">
          보험학교 링크를 재사용하지 않고, 플래너데스크에서 별도로 정리한 공식
          기관 링크입니다.
        </p>
        <a
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-indigo-600 bg-indigo-600 px-5 text-sm font-semibold !text-slate-50 transition hover:bg-indigo-700"
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
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
      <a
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-indigo-600 bg-indigo-600 px-5 text-sm font-semibold !text-slate-50 transition hover:bg-indigo-700"
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
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6"
      id={id}
    >
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 break-keep text-sm leading-6 text-slate-500">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InternalTool({ copy }: { copy: ToolItem }) {
  return (
    <PanelShell description={copy.description} id={copy.id} title={copy.label}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold text-indigo-600">내부 업무 이동</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{copy.source}</p>
        {copy.auxText && (
          <p className="mt-2 break-keep text-sm leading-6 text-slate-500 font-medium">
            {copy.auxText}
          </p>
        )}
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-indigo-600 bg-indigo-600 px-5 text-sm font-semibold !text-slate-50 transition hover:bg-indigo-700"
          href={copy.href || ""}
        >
          해당 업무로 이동
        </Link>
      </div>
    </PanelShell>
  );
}
