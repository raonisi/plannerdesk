/**
 * Public data freshness labels (PR-BS-02 / PR-BS-10).
 * Uses existing metadata only — never fabricates dates or source URLs.
 * Official source links render only when `officialSourceUrl` is set.
 */

export const DATA_FRESHNESS_FORBIDDEN_PHRASES = [
  "최신 정보 100% 보장",
  "항상 최신",
  "공식적으로 확정",
  "이 정보만 보면 됩니다",
  "이 서류만 내면 됩니다",
  "보험금 지급 가능",
  "보험금 지급 확정",
  "청구 가능 확정",
  "AI가 최종 판단",
] as const;

export const DATA_FRESHNESS_COPY = {
  /** Internal/admin label — do not render on public surfaces. */
  missingDate: "확인일 정보 부족",
  /** Public UI: omit date row when value is missing (PR-COPY-A). */
  publicMissingDateLabel: "",
  missingSource: "공식 출처 확인 필요",
  freshnessUncertain: "최신성 확인 필요",
  officialSourceConfirm: "공식 출처 확인",
  claimPolicyNotice:
    "청구서류는 보험사 정책에 따라 변경될 수 있습니다.",
  customerCheckNotice: "고객 안내 전 공식 출처를 확인하세요.",
} as const;

function toIsoDateString(value: string | Date): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

/** YYYY.MM.DD or null when value is missing/invalid. */
export function formatVerifiedDateShort(
  value: string | Date | null | undefined,
): string | null {
  if (value == null) return null;
  const iso = toIsoDateString(value);
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : null;
}

/** Date-only label for legacy surfaces (e.g. disclosure cards). */
export function formatVerifiedDate(
  value: string | Date | null | undefined,
): string {
  return formatVerifiedDateShort(value) ?? DATA_FRESHNESS_COPY.publicMissingDateLabel;
}

export function resolveOfficialSourceUrl(
  officialSourceUrl?: string | null,
): string | null {
  const primary = officialSourceUrl?.trim();
  return primary || null;
}

export type FreshnessDateLabel = {
  label: string;
  hasDate: boolean;
};

export function getFreshnessDateLabel(
  lastVerifiedAt?: string | Date | null,
  reviewedAt?: string | Date | null,
): FreshnessDateLabel {
  const raw = lastVerifiedAt ?? reviewedAt ?? null;
  const formatted = formatVerifiedDateShort(raw);
  if (!formatted) {
    return {
      label: DATA_FRESHNESS_COPY.publicMissingDateLabel,
      hasDate: false,
    };
  }
  return {
    label: `최근 확인: ${formatted}`,
    hasDate: true,
  };
}

export type OfficialSourceLabel =
  | { kind: "link"; href: string; label: string }
  | { kind: "missing"; label: string };

export function getOfficialSourceLabel(
  officialSourceUrl?: string | null,
): OfficialSourceLabel {
  const href = resolveOfficialSourceUrl(officialSourceUrl);
  if (href) {
    return {
      kind: "link",
      href,
      label: DATA_FRESHNESS_COPY.officialSourceConfirm,
    };
  }
  return {
    kind: "missing",
    label: DATA_FRESHNESS_COPY.missingSource,
  };
}

/** @deprecated Prefer getFreshnessDateLabel — kept for directory card compatibility. */
export function lastVerifiedLabel(value: string | null): string {
  const formatted = formatVerifiedDateShort(value);
  return formatted ?? DATA_FRESHNESS_COPY.publicMissingDateLabel;
}
