// Legacy re-exports for directory pages. DB-backed submit lives in app/correction-requests/actions.ts (PR-80).

export {
  CORRECTION_SUBMIT_COPY as CORRECTION_REQUEST_COPY,
  DIRECTORY_REQUEST_TYPE_OPTIONS as CORRECTION_REQUEST_TYPES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  REQUEST_TYPE_LABELS,
} from "@/lib/correction-request/constants";

export { hasClientSensitiveSignal as hasSensitiveSignal } from "@/lib/correction-request/validation";
