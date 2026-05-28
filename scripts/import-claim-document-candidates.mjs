import { PrismaClient, VerificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCE_LABEL = "보험학교 공개 청구서류 가이드";
const SOURCE_URL =
  "https://bohumschool-archive.onrender.com/api/v1/computer-room/claim-guides";

const SHARED_CAUTION =
  "보험금 지급 여부나 지급 금액을 판단하는 내용이 아닙니다. 필요서류는 보험사 및 약관에 따라 달라질 수 있으므로 공개 전 공식 출처 검수가 필요합니다.";

const candidates = [
  claimDocument("bohumschool-common-claim-form", "공통서류 - 보험금청구서", "other", "공통서류", null, "보험금청구서", null, 110),
  claimDocument("bohumschool-common-privacy-consent", "공통서류 - 개인(신용)정보처리동의서", "other", "공통서류", null, "개인(신용)정보처리동의서", null, 120),
  claimDocument("bohumschool-common-claimant-id-copy", "공통서류 - 청구인 신분증 사본", "other", "공통서류", null, "청구인 신분증 사본", null, 130),
  claimDocument("bohumschool-common-payment-account-copy", "공통서류 - 보험금 지급계좌 사본", "other", "공통서류", null, "보험금 지급계좌 사본", null, 140),
  claimDocument("bohumschool-common-family-relation-docs", "공통서류 - 가족관계확인서류", "other", "공통서류", null, "가족관계확인서류", "계약자와 피보험자가 다른 경우", 150),
  claimDocument("bohumschool-agent-power-of-attorney", "대리인 청구시 - 위임장", "other", "대리인 청구시", null, "위임장", null, 210),
  claimDocument("bohumschool-agent-seal-certificate", "대리인 청구시 - 보험금 청구권자 인감증명서", "other", "대리인 청구시", null, "보험금 청구권자 인감증명서", null, 220),
  claimDocument("bohumschool-agent-privacy-consent", "대리인 청구시 - 개인(신용)정보처리동의서", "other", "대리인 청구시", null, "개인(신용)정보처리동의서", null, 230),
  claimDocument("bohumschool-outpatient-receipt", "통원 실손 - 진료비 계산서 및 영수증", "outpatient", "통원(실손)", null, "진료비 계산서・영수증", null, 310),
  claimDocument("bohumschool-outpatient-detail-statement", "통원 실손 - 진료비 세부내역서", "outpatient", "통원(실손)", null, "진료비 세부내역서", null, 320),
  claimDocument("bohumschool-outpatient-pharmacy-receipt", "통원 실손 - 약국영수증", "outpatient", "통원(실손)", null, "약국영수증", null, 330),
  claimDocument("bohumschool-outpatient-first-chart", "통원 실손 - 초진차트 또는 의무기록사본", "outpatient", "통원(실손)", null, "초진차트 또는 의무기록사본", null, 340),
  claimDocument("bohumschool-hospitalization-diagnosis-or-discharge", "입원 실손 - 진단서 또는 입퇴원확인서", "hospitalization", "입원(실손)", null, "진단서 또는 입퇴원확인서", "진단명, 질병분류코드, 입퇴원기간", 410),
  claimDocument("bohumschool-hospitalization-receipt", "입원 실손 - 진료비 계산서 및 영수증", "hospitalization", "입원(실손)", null, "진료비 계산서・영수증", null, 420),
  claimDocument("bohumschool-hospitalization-detail-statement", "입원 실손 - 진료비 세부내역서", "hospitalization", "입원(실손)", null, "진료비 세부내역서", null, 430),
  claimDocument("bohumschool-hospitalization-pharmacy-receipt", "입원 실손 - 약국 영수증", "hospitalization", "입원(실손)", null, "약국 영수증", null, 440),
  claimDocument("bohumschool-hospitalization-first-chart", "입원 실손 - 초진차트 또는 의무기록사본", "hospitalization", "입원(실손)", null, "초진차트 또는 의무기록사본", null, 450),
  claimDocument("bohumschool-daily-hospital-or-outpatient-confirmation", "통원/입원 일당 - 진단서 또는 입퇴원확인서", "hospitalization", "통원/입원 일당", null, "진단서 또는 입퇴원확인서", "진단명, 질병분류코드, 입퇴원기간", 510),
  claimDocument("bohumschool-surgery-confirmation", "수술 - 수술확인서 또는 진단서", "surgery", "수술", null, "수술확인서 또는 진단서", "질병분류코드, 수술명, 수술일", 610),
  claimDocument("bohumschool-fracture-diagnosis", "골절 - 진단서", "fracture", "골절", null, "진단서", "진단명, 질병분류코드, 진단일", 710),
  claimDocument("bohumschool-cancer-diagnosis", "진단 - 암 진단서", "diagnosis", "진단", "암 진단", "진단서", "진단명, 질병분류코드", 810),
  claimDocument("bohumschool-cancer-pathology-result", "진단 - 암 조직검사결과지", "diagnosis", "진단", "암 진단", "조직검사결과지", null, 820),
  claimDocument("bohumschool-brain-disease-diagnosis", "진단 - 뇌질환 진단서", "diagnosis", "진단", "뇌질환 진단", "진단서", "진단명, 질병분류코드", 830),
  claimDocument("bohumschool-brain-disease-radiology-result", "진단 - 뇌질환 CT/MRI/MRA 판독결과지", "diagnosis", "진단", "뇌질환 진단", "CT, MRI, MRA 등 방사선 판독결과지", null, 840),
  claimDocument("bohumschool-heart-disease-diagnosis", "진단 - 심질환 진단서", "diagnosis", "진단", "심질환 진단", "진단서", "진단명, 질병분류코드", 850),
  claimDocument("bohumschool-heart-disease-test-results", "진단 - 심질환 각종 검사결과지", "diagnosis", "진단", "심질환 진단", "각종 검사결과지", "관상동맥조영술, 심전도검사, 심근효소검사 등", 860),
  claimDocument("bohumschool-newborn-hospitalization-birth-certificate", "태아 - 신생아 입원비 출생증명서 또는 가족관계증명서", "other", "태아", "신생아 입원비", "출생증명서 또는 가족관계증명서(상세)", null, 910),
  claimDocument("bohumschool-newborn-hospitalization-diagnosis", "태아 - 신생아 입원비 진단서", "other", "태아", "신생아 입원비", "진단서", null, 920),
  claimDocument("bohumschool-miscarriage-diagnosis", "태아 - 유산진단서", "other", "태아", "유산", "유산진단서", null, 930),
  claimDocument("bohumschool-stillbirth-certificate", "태아 - 사산증명서", "other", "태아", "사산", "사산증명서", null, 940),
  claimDocument("bohumschool-dementia-diagnosis", "치매 - 진단서", "diagnosis", "치매", null, "진단서", "진단명, 질병분류코드", 1010),
  claimDocument("bohumschool-dementia-cdr-test", "치매 - 인지기능검사(CDR) 검사지", "diagnosis", "치매", null, "인지기능검사(CDR) 검사지", null, 1020),
  claimDocument("bohumschool-dementia-mmse-k-test", "치매 - 한국형 간이인지기능검사(MMSE-K) 검사지", "diagnosis", "치매", null, "한국형 간이인지기능검사(MMSE-K) 검사지", null, 1030),
  claimDocument("bohumschool-dementia-medical-record", "치매 - 치매상태 확인 진료기록", "diagnosis", "치매", null, "치매상태를 확인할 수 있는 진료기록", "경과기록지 등", 1040),
  claimDocument("bohumschool-death-certificate-original", "사망 - 사망진단서 원본", "death", "사망", null, "사망진단서(시체검안서) 원본", null, 1110),
];

function claimDocument(slug, title, category, section, subsection, documentName, note, sortOrder) {
  const sectionLabel = subsection ? `${section} / ${subsection}` : section;
  const requiredDocuments = note
    ? `- ${documentName}\n  - 참고: ${note}`
    : `- ${documentName}`;

  return {
    slug,
    title,
    category,
    insurerId: null,
    summary: `${SOURCE_LABEL}에서 확인한 "${sectionLabel}" 항목입니다. 공식 보험사 또는 약관 기준 검수 전까지 관리자 검토용 초안으로만 사용하세요.`,
    requiredDocuments,
    optionalDocuments: null,
    claimFormUrl: null,
    officialSourceUrl: null,
    customerMessageTemplate: null,
    cautionNote: `${SHARED_CAUTION}\n참고 출처: ${SOURCE_LABEL} (${SOURCE_URL})`,
    verificationStatus: VerificationStatus.draft,
    lastVerifiedAt: null,
    isPublished: false,
    sortOrder,
  };
}

async function applyImport() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const existing = await prisma.claimDocument.findUnique({
      where: { slug: candidate.slug },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        verificationStatus: true,
      },
    });

    if (
      existing &&
      (existing.isPublished ||
        existing.verificationStatus === VerificationStatus.verified)
    ) {
      console.log(`skip verified/published: ${candidate.slug}`);
      skipped += 1;
      continue;
    }

    await prisma.claimDocument.upsert({
      where: { slug: candidate.slug },
      update: candidate,
      create: candidate,
    });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(
    `Import completed. created=${created}, updated=${updated}, skipped=${skipped}`,
  );
}

function printDryRun() {
  console.log("ClaimDocument import dry run");
  console.log(`source=${SOURCE_URL}`);
  console.log(`records=${candidates.length}`);
  console.log("No database writes were performed.");
  console.table(
    candidates.map((candidate) => ({
      slug: candidate.slug,
      category: candidate.category,
      status: candidate.verificationStatus,
      published: candidate.isPublished,
      sortOrder: candidate.sortOrder,
    })),
  );
}

async function main() {
  const shouldApply = process.argv.includes("--apply");
  const confirm = process.env.CONFIRM_CLAIM_DOCUMENT_IMPORT;

  if (!shouldApply) {
    printDryRun();
    return;
  }

  if (confirm !== "unpublished-draft") {
    throw new Error(
      'Refusing to write. Set CONFIRM_CLAIM_DOCUMENT_IMPORT="unpublished-draft" and rerun with --apply.',
    );
  }

  await applyImport();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
