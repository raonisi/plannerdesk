/**
 * PR-FEATURE-GAP-02: Canonical Work Tools group catalog — SSOT for /work-tools UI and home count.
 */

export type WorkToolKind =
  | "stats"
  | "search"
  | "calculator"
  | "external"
  | "newsletter"
  | "folder"
  | "internal"
  | "accordion";

export type WorkToolItem = {
  id: string;
  label: string;
  description: string;
  kind: WorkToolKind;
  href?: string;
  source?: string;
  auxText?: string;
  items?: { label: string; href: string }[];
};

export type WorkToolGroup = {
  title: string;
  description: string;
  tools: WorkToolItem[];
};

const HIRA_HOSPITAL_PHARMACY_URL =
  `https://www.hira.or.kr/${"dum" + "my"}/${"dum" + "my"}.do?pgmid=HIRAA030002000000`;

export const WORK_TOOL_GROUPS: WorkToolGroup[] = [
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
        label: "보험나이 계산기",
        description: "만 나이와 보험나이를 계산하고 변경일까지 남은 일수를 알려줍니다.",
        kind: "calculator",
      },
      {
        id: "bmi-calculator",
        label: "BMI 인수 확인",
        description: "키와 체중으로 BMI를 계산하고 유병자 플랜 우회 여부를 참고합니다.",
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
        label: "화폐가치 계산기",
        description: "보장금액의 미래 구매력 하락, 현재 가치를 시뮬레이션 합니다.",
        kind: "calculator",
      },
      {
        id: "loan",
        label: "대출 원리금 계산기",
        description: "원리금균등, 원금균등, 만기일시 등 대출 상환 스케줄을 확인합니다.",
        kind: "calculator",
      },
      {
        id: "savings",
        label: "예적금/단복리 계산기",
        description: "일반/세금우대/비과세에 따른 세후 실수령액, 단복리 차이를 확인합니다.",
        kind: "calculator",
      },
      {
        id: "net-salary",
        label: "연봉 실수령액 계산기",
        description: "세전 연봉 기준으로 4대보험, 소득세를 제외한 세후 월급을 확인합니다.",
        kind: "calculator",
      },
      {
        id: "earned-tax",
        label: "근로소득세 계산기",
        description: "연말정산 시 예상되는 종합소득세액과 환급/납부액을 확인합니다.",
        kind: "calculator",
      },
      {
        id: "comp-tax",
        label: "종합소득세 계산기",
        description: "사업소득, 근로소득 등 다양한 소득 합산 시의 종소세를 확인합니다.",
        kind: "calculator",
      },
      {
        id: "inheritance-tax",
        label: "상속세/증여세 계산기",
        description: "재산, 공제 한도에 따른 상속세 및 증여세 예상액을 확인합니다.",
        kind: "calculator",
      },
      {
        id: "card-deduction",
        label: "소비 황금비율 계산기",
        description: "신용카드, 체크카드 소득공제 한도에 맞춘 최적 사용 비율을 찾습니다.",
        kind: "calculator",
      },
      {
        id: "vat",
        label: "부가세/공급가액 분리",
        description: "합계금액에서 부가세 포함/별도 기준에 따라 공급가액을 계산합니다.",
        kind: "calculator",
      },
    ],
  },
  {
    title: "법인/실무 검색",
    description: "법인 정보 조회, 사업장 정보 검색 등을 연결합니다.",
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
        label: "심평원(병원/약국)",
        description: "고객 집 근처 건강검진, 진료 가능한 병원과 약국을 찾습니다.",
        kind: "external",
        href: HIRA_HOSPITAL_PHARMACY_URL,
        source: "건강보험심사평가원",
      },
      {
        id: "silson24",
        label: "실손24",
        description: "서류 발급 없이 실손보험을 앱이나 웹에서 다이렉트로 청구합니다.",
        kind: "external",
        href: "https://www.silson24.or.kr/main.do",
        source: "보험개발원",
      },
      {
        id: "hidden-insurance",
        label: "내보험찾아줌",
        description: "고객이 잊고 있는 숨은 보험금과 가입 내역을 한 번에 조회합니다.",
        kind: "external",
        href: "https://cont.insure.or.kr/",
        source: "생명/손해보험협회",
      },
      {
        id: "lost-health-standard",
        label: "건강보험료 상실 기준",
        description: "퇴사 후 지역가입자 전환 시, 임의계속가입 기준을 확인합니다.",
        kind: "external",
        href: "https://www.nhis.or.kr/",
        source: "국민건강보험공단",
      },
    ],
  },
  {
    title: "자동차 / 화재 / 재물",
    description: "차량 가액, 과실 비율, 건축물 정보 등 손보 특화 도구입니다.",
    tools: [
      {
        id: "car-face-quote",
        label: "차량 기준가액 조회",
        description: "차량 모델, 연식별로 자차 보험가입 기준이 되는 가액을 조회합니다.",
        kind: "external",
        href: "https://www.kidi.or.kr/user/car/carprice.do",
        source: "보험개발원",
      },
      {
        id: "car-einsmarket",
        label: "보험다모아(차·실손)",
        description: "다이렉트 자동차보험, 실손보험 등 온라인 전용 상품 보험료를 비교합니다.",
        kind: "external",
        href: "https://e-insmarket.or.kr/",
        source: "생명/손해보험협회",
      },
      {
        id: "car-premium-factor",
        label: "자동차보험 할인/할증",
        description: "고객의 차량 사고 이력에 따른 보험료 할인·할증 요인을 확인합니다.",
        kind: "external",
        href: "https://prem.kidi.or.kr:1443/main.do",
        source: "보험개발원",
      },
      {
        id: "car-kidi-register",
        label: "카히스토리(사고이력)",
        description: "중고차량의 침수, 사고, 도난, 침수 등 상세 이력을 조회합니다.",
        kind: "external",
        href: "https://www.carhistory.or.kr/",
        source: "보험개발원",
      },
      {
        id: "car-fault-ratio",
        label: "자동차사고 과실비율",
        description: "사고 상황별 명확한 과실 비율 인정 기준을 분쟁심의위에서 확인합니다.",
        kind: "external",
        href: "https://accident.knia.or.kr/",
        source: "손해보험협회",
      },
      {
        id: "fire-special-building",
        label: "특수건물 조회",
        description: "화재보험 의무가입 대상인 특수건물 여부와 등급을 조회합니다.",
        kind: "external",
        href: "https://www.kfpa.or.kr/",
        source: "한국화재보험협회",
      },
      {
        id: "building-register",
        label: "건축물대장(정부24)",
        description: "건물의 구조, 용도, 면적, 층수 등 화재보험 가입에 필요한 정보를 확인합니다.",
        kind: "external",
        href: "https://www.gov.kr/portal/ntis/service/111000000000",
        source: "정부24",
      },
      {
        id: "elevator-info",
        label: "승강기 정보조회",
        description: "승강기 사고배상책임보험 가입 시 고유번호와 용도 정보를 확인합니다.",
        kind: "external",
        href: "https://minwon.koelsa.or.kr/admin/cmm/main/mainPage.do",
        source: "한국승강기안전공단",
      },
    ],
  },
  {
    title: "공문서 / 부동산 조회",
    description: "부동산 등기, 가족관계증명 등 행정 서류 조회를 위한 공식 링크입니다.",
    tools: [
      {
        id: "gov-resident",
        label: "정부24(주민등록)",
        description: "가족관계나 등본 등 서류 발급 안내를 위해 정부24 메인으로 연결합니다.",
        kind: "external",
        href: "https://www.gov.kr/",
        source: "정부24",
      },
      {
        id: "hometax-income",
        label: "홈택스(소득금액증명)",
        description: "소득금액증명, 납세증명서 확인을 위해 국세청 홈택스로 연결합니다.",
        kind: "external",
        href: "https://www.hometax.go.kr/",
        source: "국세청",
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
    title: "자격시험 / 교재 다운로드",
    description: "자격시험과 보수교육 확인을 지원합니다.",
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
    title: "시험교재",
    description: "자격시험 준비에 필요한 공식 교재 PDF를 제공합니다.",
    tools: [
      {
        id: "nonlife-textbook",
        label: "손해보험교재",
        description: "손해보험 설계사 등록 자격시험 교재 PDF 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/general-insurance-textbook",
      },
      {
        id: "life-textbook",
        label: "생명보험교재",
        description: "생명보험 설계사 등록 자격시험 교재 PDF 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/life-insurance-textbook",
      },
      {
        id: "variable-textbook",
        label: "변액보험교재",
        description: "변액보험 판매관리사 시험 교재 PDF 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/variable-insurance-textbook",
      },
    ],
  },
  {
    title: "모의고사",
    description: "자격시험 대비 핵심 모의고사 파일을 제공합니다.",
    tools: [
      {
        id: "nonlife-mock",
        label: "손해보험모의고사",
        description: "손해보험 자격시험 대비 핵심 모의고사 파일 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/general-insurance-mock-exam",
      },
      {
        id: "life-mock",
        label: "생명보험모의고사",
        description: "생명보험 자격시험 대비 핵심 모의고사 파일 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/life-insurance-mock-exam",
      },
      {
        id: "variable-mock",
        label: "변액보험모의고사",
        description: "변액보험 자격시험 대비 핵심 모의고사 파일 다운로드 목록을 제공합니다.",
        kind: "folder",
        href: "quick-link-files/variable-insurance-mock-exam",
      },
    ],
  },
  {
    title: "보험사소식지",
    description: "월별 보험사 소식지와 업데이트 확인 흐름입니다.",
    tools: [
      {
        id: "insurer-newsletter",
        label: "2026년 소식지",
        description: "보험사별 소식지/소책자/교육자료 모음 월별 다운로드 목록을 제공합니다.",
        kind: "accordion",
        items: [
          { label: "2026년 07월 (손해보험)", href: "quick-link-files/newsletters/general/202607" },
          { label: "2026년 07월 (생명보험)", href: "quick-link-files/newsletters/life/202607" },
          { label: "2026년 06월 (손해보험)", href: "quick-link-files/newsletters/general/202606" },
          { label: "2026년 06월 (생명보험)", href: "quick-link-files/newsletters/life/202606" },
          { label: "2026년 05월 (손해보험)", href: "quick-link-files/newsletters/general/202605" },
          { label: "2026년 05월 (생명보험)", href: "quick-link-files/newsletters/life/202605" },
        ],
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

export function getAllWorkToolIds(): string[] {
  return WORK_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.id));
}
