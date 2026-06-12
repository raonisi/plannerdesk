import {
  ClaimDocumentCategory,
  VerificationStatus,
} from "@prisma/client";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";

const SOURCE_LABEL = "보험학교 공개 청구서류 가이드";
const SOURCE_URL =
  "https://bohumschool-archive.onrender.com/api/v1/computer-room/claim-guides";

const CAUTION_NOTE =
  "보험금 지급 여부나 지급 금액을 판단하는 내용이 아닙니다. 필요서류는 보험사 및 약관에 따라 달라질 수 있으므로 청구 전 보험사 또는 약관 확인이 필요합니다.";

type CandidateRow = readonly [
  slug: string,
  title: string,
  category: ClaimDocumentCategory,
  section: string,
  subsection: string | undefined,
  documentName: string,
  note: string | undefined,
  sortOrder: number,
];

const candidateRows = [
  ["bohumschool-common-claim-form", "공통서류 - 보험금청구서", ClaimDocumentCategory.other, "공통서류", undefined, "보험금청구서", undefined, 110],
  ["bohumschool-common-privacy-consent", "공통서류 - 개인(신용)정보처리동의서", ClaimDocumentCategory.other, "공통서류", undefined, "개인(신용)정보처리동의서", undefined, 120],
  ["bohumschool-common-claimant-id-copy", "공통서류 - 청구인 신분증 사본", ClaimDocumentCategory.other, "공통서류", undefined, "청구인 신분증 사본", undefined, 130],
  ["bohumschool-common-payment-account-copy", "공통서류 - 보험금 지급계좌 사본", ClaimDocumentCategory.other, "공통서류", undefined, "보험금 지급계좌 사본", undefined, 140],
  ["bohumschool-common-family-relation-docs", "공통서류 - 가족관계확인서류", ClaimDocumentCategory.other, "공통서류", undefined, "가족관계확인서류", "계약자와 피보험자가 다른 경우", 150],
  ["bohumschool-agent-power-of-attorney", "대리인 청구시 - 위임장", ClaimDocumentCategory.other, "대리인 청구시", undefined, "위임장", undefined, 210],
  ["bohumschool-agent-seal-certificate", "대리인 청구시 - 보험금 청구권자 인감증명서", ClaimDocumentCategory.other, "대리인 청구시", undefined, "보험금 청구권자 인감증명서", undefined, 220],
  ["bohumschool-agent-privacy-consent", "대리인 청구시 - 개인(신용)정보처리동의서", ClaimDocumentCategory.other, "대리인 청구시", undefined, "개인(신용)정보처리동의서", undefined, 230],
  ["bohumschool-outpatient-receipt", "통원 실손 - 진료비 계산서 및 영수증", ClaimDocumentCategory.outpatient, "통원(실손)", undefined, "진료비 계산서・영수증", undefined, 310],
  ["bohumschool-outpatient-detail-statement", "통원 실손 - 진료비 세부내역서", ClaimDocumentCategory.outpatient, "통원(실손)", undefined, "진료비 세부내역서", undefined, 320],
  ["bohumschool-outpatient-pharmacy-receipt", "통원 실손 - 약국영수증", ClaimDocumentCategory.outpatient, "통원(실손)", undefined, "약국영수증", undefined, 330],
  ["bohumschool-outpatient-first-chart", "통원 실손 - 초진차트 또는 의무기록사본", ClaimDocumentCategory.outpatient, "통원(실손)", undefined, "초진차트 또는 의무기록사본", undefined, 340],
  ["bohumschool-hospitalization-diagnosis-or-discharge", "입원 실손 - 진단서 또는 입퇴원확인서", ClaimDocumentCategory.hospitalization, "입원(실손)", undefined, "진단서 또는 입퇴원확인서", "진단명, 질병분류코드, 입퇴원기간", 410],
  ["bohumschool-hospitalization-receipt", "입원 실손 - 진료비 계산서 및 영수증", ClaimDocumentCategory.hospitalization, "입원(실손)", undefined, "진료비 계산서・영수증", undefined, 420],
  ["bohumschool-hospitalization-detail-statement", "입원 실손 - 진료비 세부내역서", ClaimDocumentCategory.hospitalization, "입원(실손)", undefined, "진료비 세부내역서", undefined, 430],
  ["bohumschool-hospitalization-pharmacy-receipt", "입원 실손 - 약국 영수증", ClaimDocumentCategory.hospitalization, "입원(실손)", undefined, "약국 영수증", undefined, 440],
  ["bohumschool-hospitalization-first-chart", "입원 실손 - 초진차트 또는 의무기록사본", ClaimDocumentCategory.hospitalization, "입원(실손)", undefined, "초진차트 또는 의무기록사본", undefined, 450],
  ["bohumschool-daily-hospital-or-outpatient-confirmation", "통원/입원 일당 - 진단서 또는 입퇴원확인서", ClaimDocumentCategory.hospitalization, "통원/입원 일당", undefined, "진단서 또는 입퇴원확인서", "진단명, 질병분류코드, 입퇴원기간", 510],
  ["bohumschool-surgery-confirmation", "수술 - 수술확인서 또는 진단서", ClaimDocumentCategory.surgery, "수술", undefined, "수술확인서 또는 진단서", "질병분류코드, 수술명, 수술일", 610],
  ["bohumschool-fracture-diagnosis", "골절 - 진단서", ClaimDocumentCategory.fracture, "골절", undefined, "진단서", "진단명, 질병분류코드, 진단일", 710],
  ["bohumschool-cancer-diagnosis", "진단 - 암 진단서", ClaimDocumentCategory.diagnosis, "진단", "암 진단", "진단서", "진단명, 질병분류코드", 810],
  ["bohumschool-cancer-pathology-result", "진단 - 암 조직검사결과지", ClaimDocumentCategory.diagnosis, "진단", "암 진단", "조직검사결과지", undefined, 820],
  ["bohumschool-brain-disease-diagnosis", "진단 - 뇌질환 진단서", ClaimDocumentCategory.diagnosis, "진단", "뇌질환 진단", "진단서", "진단명, 질병분류코드", 830],
  ["bohumschool-brain-disease-radiology-result", "진단 - 뇌질환 CT/MRI/MRA 판독결과지", ClaimDocumentCategory.diagnosis, "진단", "뇌질환 진단", "CT, MRI, MRA 등 방사선 판독결과지", undefined, 840],
  ["bohumschool-heart-disease-diagnosis", "진단 - 심질환 진단서", ClaimDocumentCategory.diagnosis, "진단", "심질환 진단", "진단서", "진단명, 질병분류코드", 850],
  ["bohumschool-heart-disease-test-results", "진단 - 심질환 각종 검사결과지", ClaimDocumentCategory.diagnosis, "진단", "심질환 진단", "각종 검사결과지", "관상동맥조영술, 심전도검사, 심근효소검사 등", 860],
  ["bohumschool-newborn-hospitalization-birth-certificate", "태아 - 신생아 입원비 출생증명서 또는 가족관계증명서", ClaimDocumentCategory.other, "태아", "신생아 입원비", "출생증명서 또는 가족관계증명서(상세)", undefined, 910],
  ["bohumschool-newborn-hospitalization-diagnosis", "태아 - 신생아 입원비 진단서", ClaimDocumentCategory.other, "태아", "신생아 입원비", "진단서", undefined, 920],
  ["bohumschool-miscarriage-diagnosis", "태아 - 유산진단서", ClaimDocumentCategory.other, "태아", "유산", "유산진단서", undefined, 930],
  ["bohumschool-stillbirth-certificate", "태아 - 사산증명서", ClaimDocumentCategory.other, "태아", "사산", "사산증명서", undefined, 940],
  ["bohumschool-dementia-diagnosis", "치매 - 진단서", ClaimDocumentCategory.diagnosis, "치매", undefined, "진단서", "진단명, 질병분류코드", 1010],
  ["bohumschool-dementia-cdr-test", "치매 - 인지기능검사(CDR) 검사지", ClaimDocumentCategory.diagnosis, "치매", undefined, "인지기능검사(CDR) 검사지", undefined, 1020],
  ["bohumschool-dementia-mmse-k-test", "치매 - 한국형 간이인지기능검사(MMSE-K) 검사지", ClaimDocumentCategory.diagnosis, "치매", undefined, "한국형 간이인지기능검사(MMSE-K) 검사지", undefined, 1030],
  ["bohumschool-dementia-medical-record", "치매 - 치매상태 확인 진료기록", ClaimDocumentCategory.diagnosis, "치매", undefined, "치매상태를 확인할 수 있는 진료기록", "경과기록지 등", 1040],
  ["bohumschool-death-certificate-original", "사망 - 사망진단서 원본", ClaimDocumentCategory.death, "사망", undefined, "사망진단서(시체검안서) 원본", undefined, 1110],
] satisfies CandidateRow[];

const rawCandidates: Array<{
  slug: string;
  title: string;
  category: ClaimDocumentCategory;
  section: string;
  subsection?: string;
  documentName: string;
  note?: string;
  sortOrder: number;
}> = candidateRows.map(
  ([
    slug,
    title,
    category,
    section,
    subsection,
    documentName,
    note,
    sortOrder,
  ]) => ({
    slug,
    title,
    category,
    section,
    subsection,
    documentName,
    note,
    sortOrder,
  }),
);

export const claimDocumentCandidateFallback: PublicClaimDocument[] =
  rawCandidates.map((candidate) => {
    const sectionLabel = candidate.subsection
      ? `${candidate.section} / ${candidate.subsection}`
      : candidate.section;

    return {
      id: `candidate-${candidate.slug}`,
      title: candidate.title,
      slug: candidate.slug,
      category: candidate.category,
      insurerId: null,
      insurerName: null,
      summary: `${SOURCE_LABEL}에서 확인한 "${sectionLabel}" 참고 항목입니다. 공식 보험사 또는 약관 기준 검수 전까지는 실무 참고용으로만 확인해 주세요.`,
      requiredDocuments: candidate.note
        ? `- ${candidate.documentName}\n  - 참고: ${candidate.note}`
        : `- ${candidate.documentName}`,
      optionalDocuments: null,
      claimFormUrl: null,
      officialSourceUrl: SOURCE_URL,
      customerMessageTemplate: null,
      cautionNote: CAUTION_NOTE,
      verificationStatus: VerificationStatus.needs_review,
      lastVerifiedAt: null,
    };
  });
