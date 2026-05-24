import type { ContentSafetyRule } from "./types";

export const contentSafetyRules = [
  {
    id: "no-claim-payout-judgment",
    title: "No claim payout judgment",
    description:
      "Content must not state whether a claim will be approved, denied, or paid."
  },
  {
    id: "no-claim-amount-estimation",
    title: "No claim amount estimation",
    description:
      "Content must not estimate claim amounts, expected benefits, or settlement values."
  },
  {
    id: "no-loss-adjusting-workflow",
    title: "No loss-adjusting workflow",
    description:
      "Content must not guide users through loss-adjusting or regulated claim evaluation workflows."
  },
  {
    id: "no-medical-document-upload",
    title: "No customer medical document upload",
    description:
      "The MVP must not request, store, upload, or process customer medical documents."
  },
  {
    id: "no-guarantee-language",
    title: "No guarantee language",
    description:
      "Messages must avoid guarantees about coverage, approval, payment timing, or outcomes."
  }
] satisfies ContentSafetyRule[];
