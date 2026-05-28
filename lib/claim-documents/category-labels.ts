import { ClaimDocumentCategory } from "@prisma/client";

export const categoryLabels: Record<ClaimDocumentCategory, string> = {
  actual_expense: "실손",
  diagnosis: "진단",
  surgery: "수술",
  hospitalization: "입원",
  outpatient: "통원",
  fracture: "골절",
  driver: "운전자",
  death: "사망",
  disability: "후유장해",
  other: "기타",
};

export const categoryOrder: ClaimDocumentCategory[] = [
  "actual_expense",
  "hospitalization",
  "surgery",
  "diagnosis",
  "outpatient",
  "fracture",
  "driver",
  "death",
  "disability",
  "other",
];

export const categoryOptions: Array<{ label: string; value: string }> = [
  { label: "전체", value: "all" },
  ...categoryOrder.map((cat) => ({
    label: categoryLabels[cat],
    value: cat,
  })),
];
