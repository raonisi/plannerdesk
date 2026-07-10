import {
  resolveVerificationDate,
  type VerificationDateResolution,
} from "@/lib/public/data-freshness";
import {
  getFreshnessStatus,
  type FreshnessPresentation,
  type FreshnessStatus,
} from "@/lib/public/freshness";

export type SearchVerificationStatus =
  | "verified"
  | "needs_check"
  | "stale"
  | "missing"
  | "invalid";

export type SearchVerificationState = {
  status: SearchVerificationStatus;
  verificationDate: string | null;
  label: string;
};

const MISSING_LABEL = "확인일 미등록";

function unresolvedState(
  resolution: Extract<VerificationDateResolution, { status: "missing" | "invalid" }>,
): SearchVerificationState {
  return {
    status: resolution.status,
    verificationDate: null,
    label: MISSING_LABEL,
  };
}

export function resolveSearchVerificationState(
  value: string | Date | null | undefined,
  options?: { now?: Date },
): SearchVerificationState {
  const resolution = resolveVerificationDate(value);
  if (resolution.status !== "valid") return unresolvedState(resolution);

  const freshness = getFreshnessStatus(
    { lastVerifiedAt: resolution.isoDate },
    { now: options?.now },
  );
  const baseLabel = `${resolution.formattedDate} 확인`;

  if (freshness === "stale") {
    return {
      status: "stale",
      verificationDate: resolution.isoDate,
      label: `${baseLabel} · 확인 필요`,
    };
  }
  if (freshness === "needs_check") {
    return {
      status: "needs_check",
      verificationDate: resolution.isoDate,
      label: `${baseLabel} · 재확인 권장`,
    };
  }

  return {
    status: "verified",
    verificationDate: resolution.isoDate,
    label: baseLabel,
  };
}

const PRESENTATION_STATUS: Record<SearchVerificationStatus, FreshnessStatus> = {
  verified: "recent",
  needs_check: "needs_check",
  stale: "stale",
  missing: "missing_date",
  invalid: "missing_date",
};

export function getSearchVerificationPresentation(
  state: SearchVerificationState,
): FreshnessPresentation {
  const freshnessStatus = PRESENTATION_STATUS[state.status];
  return {
    status: freshnessStatus,
    label: state.label,
    tone:
      state.status === "verified"
        ? "positive"
        : state.status === "needs_check"
          ? "caution"
          : state.status === "stale"
            ? "muted"
            : "neutral",
    formattedDate: state.verificationDate?.replaceAll("-", ".") ?? null,
    showDate: state.verificationDate !== null,
  };
}

export function withSearchVerification<T extends object>(
  result: T,
  value: string | Date | null | undefined,
  options?: { now?: Date },
): T & { verification: SearchVerificationState } {
  return {
    ...result,
    verification: resolveSearchVerificationState(value, options),
  };
}
