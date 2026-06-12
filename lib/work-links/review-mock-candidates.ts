import { DEFAULT_WORK_LINK_VISIBILITY_SCOPE } from "./review-rules";
import type { WorkLinkReviewCandidate } from "./review-types";

/**
 * PR-BS-14 mock candidates only — fictional placeholders, no real insurer data.
 * Not persisted; not exposed to public/planner routes.
 */
export const WORK_LINK_REVIEW_MOCK_CANDIDATES: readonly WorkLinkReviewCandidate[] =
  [
    {
      id: "mock-wl-draft-001",
      title: "전산 포털 후보 (mock 초안)",
      insurerName: "예시 보험사 A",
      infoType: "insurerSystem",
      targetUrl: null,
      officialSourceUrl: null,
      sourceLabel: null,
      riskLevel: "high",
      reviewStatus: "draft",
      visibilityScope: DEFAULT_WORK_LINK_VISIBILITY_SCOPE,
      lastVerifiedAt: null,
      staleAfterDays: 90,
      reviewNotePrivate: "공식 포털 URL 확인 전 — mock 초안",
      adminMemo: "Admin-only: 출처 대조 전",
    },
    {
      id: "mock-wl-review-002",
      title: "고객센터 안내 후보 (mock 검수 필요)",
      insurerName: "예시 보험사 B",
      infoType: "customerCenter",
      targetUrl: null,
      officialSourceUrl: "https://example.invalid/official/customer-center",
      sourceLabel: "보험사 공식 고객센터 안내 (placeholder)",
      riskLevel: "high",
      reviewStatus: "needs_review",
      visibilityScope: DEFAULT_WORK_LINK_VISIBILITY_SCOPE,
      lastVerifiedAt: null,
      staleAfterDays: 60,
      reviewNotePrivate: "번호·운영시간은 공식 페이지에서 재확인 필요",
      internalReviewNote: "Admin-only: 2차 검수 대기",
    },
    {
      id: "mock-wl-verified-003",
      title: "청구 안내 링크 후보 (mock 검수 완료)",
      insurerName: "예시 보험사 C",
      infoType: "claimGuide",
      targetUrl: null,
      officialSourceUrl: "https://example.invalid/official/claim-guide",
      sourceLabel: "보험사 공식 청구 안내 (placeholder)",
      riskLevel: "high",
      reviewStatus: "verified",
      visibilityScope: DEFAULT_WORK_LINK_VISIBILITY_SCOPE,
      lastVerifiedAt: "2026-05-01",
      staleAfterDays: 90,
      reviewNotePrivate: "공식 출처 확인됨 — 공개 범위는 admin 유지",
    },
    {
      id: "mock-wl-stale-004",
      title: "납입 안내 후보 (mock 재확인)",
      insurerName: "예시 보험사 D",
      infoType: "paymentInfo",
      targetUrl: null,
      officialSourceUrl: "https://example.invalid/official/payment",
      sourceLabel: "보험사 공식 납입 안내 (placeholder)",
      riskLevel: "high",
      reviewStatus: "stale",
      visibilityScope: DEFAULT_WORK_LINK_VISIBILITY_SCOPE,
      lastVerifiedAt: "2025-01-15",
      staleAfterDays: 60,
      reviewNotePrivate: "카드납 조건은 상품·채널별 상이 — 확정 표현 금지",
    },
  ];
