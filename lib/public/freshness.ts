import { VerificationStatus } from "@prisma/client";

import { formatVerifiedDateShort } from "@/lib/public/data-freshness";

export const FRESHNESS_RECENT_DAYS = 30;
export const FRESHNESS_STALE_DAYS = 90;

export type FreshnessStatus =
  | "recent"
  | "needs_check"
  | "stale"
  | "missing_date"
  | "needs_review";

export type FreshnessAudience = "public" | "admin";

export type FreshnessInput = {
  lastVerifiedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  verificationStatus?: VerificationStatus | string | null;
  hasOfficialSource?: boolean;
};

export type FreshnessTone = "neutral" | "positive" | "caution" | "muted";

export type FreshnessPresentation = {
  status: FreshnessStatus;
  label: string;
  tone: FreshnessTone;
  formattedDate: string | null;
  showDate: boolean;
};

const STATUS_PRIORITY: Record<FreshnessStatus, number> = {
  needs_review: 5,
  missing_date: 4,
  stale: 3,
  needs_check: 2,
  recent: 1,
};

function parseVerifiedDate(
  input: FreshnessInput,
): { iso: string | null; formatted: string | null } {
  const raw = input.lastVerifiedAt ?? input.reviewedAt ?? null;
  const formatted = formatVerifiedDateShort(raw);
  if (!formatted) {
    return { iso: null, formatted: null };
  }
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(formatted);
  if (!match) {
    return { iso: null, formatted: null };
  }
  return {
    iso: `${match[1]}-${match[2]}-${match[3]}`,
    formatted,
  };
}

function diffDaysFromNow(isoDate: string, now: Date): number {
  const verified = new Date(`${isoDate}T00:00:00.000Z`);
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const diffMs = today.getTime() - verified.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isNeedsReviewStatus(
  verificationStatus?: VerificationStatus | string | null,
): boolean {
  return verificationStatus === VerificationStatus.needs_review;
}

export function getFreshnessStatus(
  input: FreshnessInput,
  options?: { now?: Date },
): FreshnessStatus {
  if (isNeedsReviewStatus(input.verificationStatus)) {
    return "needs_review";
  }

  const { iso } = parseVerifiedDate(input);
  if (!iso) {
    return "missing_date";
  }

  const ageDays = diffDaysFromNow(iso, options?.now ?? new Date());
  if (ageDays <= FRESHNESS_RECENT_DAYS) return "recent";
  if (ageDays <= FRESHNESS_STALE_DAYS) return "needs_check";
  return "stale";
}

export function isVerificationStale(
  input: FreshnessInput,
  options?: { now?: Date },
): boolean {
  const status = getFreshnessStatus(input, options);
  return (
    status === "stale" ||
    status === "missing_date" ||
    status === "needs_review" ||
    status === "needs_check"
  );
}

export function getFreshnessTone(
  status: FreshnessStatus,
  audience: FreshnessAudience = "public",
): FreshnessTone {
  if (status === "recent") return "positive";
  if (status === "needs_review") {
    return audience === "admin" ? "caution" : "caution";
  }
  if (status === "needs_check") return "caution";
  if (status === "stale") return "muted";
  return "neutral";
}

const PUBLIC_LABELS: Record<FreshnessStatus, string> = {
  recent: "최근 확인",
  needs_check: "공식 안내 재확인 권장",
  stale: "확인 필요",
  missing_date: "확인일 미등록",
  needs_review: "검수 필요",
};

const ADMIN_LABELS: Record<FreshnessStatus, string> = {
  recent: "30일 이내 확인",
  needs_check: "확인 필요",
  stale: "90일 이상 미확인",
  missing_date: "확인일 없음",
  needs_review: "검수 필요",
};

export function getFreshnessLabel(
  status: FreshnessStatus,
  audience: FreshnessAudience = "public",
): string {
  return audience === "admin" ? ADMIN_LABELS[status] : PUBLIC_LABELS[status];
}

/** @deprecated Prefer formatVerifiedDateShort from data-freshness. */
export function formatVerifiedDate(
  value: string | Date | null | undefined,
): string | null {
  return formatVerifiedDateShort(value);
}

export function getFreshnessPresentation(
  input: FreshnessInput,
  options?: { audience?: FreshnessAudience; now?: Date },
): FreshnessPresentation {
  const audience = options?.audience ?? "public";
  const status = getFreshnessStatus(input, { now: options?.now });
  const { formatted } = parseVerifiedDate(input);
  const tone = getFreshnessTone(status, audience);
  const baseLabel = getFreshnessLabel(status, audience);

  if (status === "recent" && formatted) {
    return {
      status,
      label:
        audience === "public"
          ? `최근 확인일 ${formatted}`
          : `${baseLabel} · ${formatted}`,
      tone,
      formattedDate: formatted,
      showDate: true,
    };
  }

  if (status === "needs_check" || status === "stale") {
    const dateSuffix = formatted ? ` · ${formatted}` : "";
    return {
      status,
      label: `${baseLabel}${dateSuffix}`,
      tone,
      formattedDate: formatted,
      showDate: Boolean(formatted),
    };
  }

  if (
    !input.hasOfficialSource &&
    audience === "public" &&
    status === "missing_date"
  ) {
    return {
      status,
      label:
        status === "missing_date"
          ? "확인일 미등록"
          : "공식 경로 재확인 권장",
      tone,
      formattedDate: formatted,
      showDate: false,
    };
  }

  return {
    status,
    label: baseLabel,
    tone,
    formattedDate: formatted,
    showDate: Boolean(formatted),
  };
}

export function pickWorstFreshnessStatus(
  statuses: FreshnessStatus[],
): FreshnessStatus {
  if (statuses.length === 0) return "missing_date";
  return statuses.reduce((worst, current) =>
    STATUS_PRIORITY[current] > STATUS_PRIORITY[worst] ? current : worst,
  );
}

export function pickLatestVerifiedIso(
  values: Array<string | Date | null | undefined>,
): string | null {
  let latest: string | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    const formatted = formatVerifiedDateShort(value);
    if (!formatted) continue;
    const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(formatted);
    if (!match) continue;
    const iso = `${match[1]}-${match[2]}-${match[3]}`;
    const time = Date.parse(`${iso}T00:00:00.000Z`);
    if (time > latestTime) {
      latestTime = time;
      latest = iso;
    }
  }

  return latest;
}

export const PUBLIC_HOME_FRESHNESS_NOTICE =
  "공개 정보는 확인일·검수 상태를 함께 안내합니다. 고객 안내 전 보험사 공식 출처를 다시 확인해 주세요.";
