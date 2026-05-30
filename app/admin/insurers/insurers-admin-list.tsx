"use client";

import Link from "next/link";
import {
  CardPaymentStatus,
  ClaimFaxHandlingType,
  InsurerCategory,
  VerificationStatus,
} from "@prisma/client";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import { executeInsurerBulkAction, setInsurerPublished } from "./actions";
import {
  ADMIN_VISIBILITY_COPY,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
  VISIBILITY_LABEL,
  isInsurerPubliclyVisible,
  wouldPublishDraft,
} from "./visibility";

const MISSING_TEXT = "공식 확인 후 업데이트 예정";
const UNAVAILABLE_TEXT = "해당사항 없음";
const CALL_CENTER_INDIVIDUAL_TEXT = "콜센터 개별접수";
const CONDITIONAL_TEXT = "조건 확인 필요";
const NEEDS_UPDATE_TEXT = "운영 정보 보강 필요";

const CORE_OPERATIONAL_FIELDS = [
  "systemUrl",
  "helpdeskPhone",
  "claimFaxNumber",
  "termsUrl",
  "claimFormUrl",
] as const;

const MISSING_FIELD_THRESHOLD = 3;

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export type InsurerListRow = {
  id: string;
  name: string;
  category: InsurerCategory;
  verificationStatus: VerificationStatus;
  isPublished: boolean;
  isFeatured: boolean;
  lastVerifiedAt: string | null;
  updatedAt: string;
  officialWebsiteUrl: string | null;
  plannerPortalUrl: string | null;
  systemUrl: string | null;
  helpdeskPhone: string | null;
  customerCenterPhone: string | null;
  claimPageUrl: string | null;
  claimFaxNumber: string | null;
  claimFaxHandlingType: ClaimFaxHandlingType;
  claimFormUrl: string | null;
  termsUrl: string | null;
  cardPaymentStatus: CardPaymentStatus;
  mailingAddress: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "검수 이력 없음";
  return value.slice(0, 10);
}

function categoryLabel(category: string) {
  if (category === InsurerCategory.life) return "생명보험";
  if (category === InsurerCategory.non_life) return "손해보험";
  return category;
}

function statusLabel(status: VerificationStatus) {
  return VERIFICATION_STATUS_LABEL[status];
}

function optionalValue(value: string | null) {
  return value && value.trim().length > 0 ? value : MISSING_TEXT;
}

function cardPaymentStatusLabel(status: CardPaymentStatus): string {
  if (status === CardPaymentStatus.available) return "사용 가능";
  if (status === CardPaymentStatus.conditional) return CONDITIONAL_TEXT;
  if (status === CardPaymentStatus.unavailable) return UNAVAILABLE_TEXT;
  return MISSING_TEXT;
}

function claimFaxHandlingLabel(value: ClaimFaxHandlingType): string {
  if (value === ClaimFaxHandlingType.fax) return "팩스 사용";
  if (value === ClaimFaxHandlingType.call_center_individual) {
    return CALL_CENTER_INDIVIDUAL_TEXT;
  }
  if (value === ClaimFaxHandlingType.unavailable) return UNAVAILABLE_TEXT;
  return MISSING_TEXT;
}

function countMissingOperational(insurer: InsurerListRow): number {
  return CORE_OPERATIONAL_FIELDS.reduce((acc, key) => {
    const raw = insurer[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return acc + (value.length === 0 ? 1 : 0);
  }, 0);
}

function badgeClass(tone: "green" | "gold" | "gray" | "navy") {
  if (tone === "green") {
    return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  }
  if (tone === "gold") {
    return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  }
  if (tone === "navy") {
    return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  }
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(status: VerificationStatus): "green" | "gold" | "gray" {
  if (status === VerificationStatus.verified) return "green";
  if (status === VerificationStatus.needs_review) return "gold";
  return "gray";
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="break-words text-[#4f5661]">{optionalValue(value)}</dd>
    </div>
  );
}

function toBulkItems(insurers: InsurerListRow[]): AdminBulkSelectableItem[] {
  return insurers.map((insurer) => ({
    id: insurer.id,
    title: insurer.name,
    status: insurer.verificationStatus,
    isPublished: insurer.isPublished,
  }));
}

export default function InsurersAdminList({
  insurers,
  role,
}: {
  insurers: InsurerListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(insurers);

  const bulkNotice =
    "선택한 항목의 상태를 일괄 변경합니다. 이 작업은 공개 화면(/directory) 노출 여부에 영향을 줄 수 있습니다. 공식 출처와 최신 기준을 확인한 뒤 진행하세요.";

  return (
    <AdminBulkActionPanel
      domain="insurers"
      items={bulkItems}
      role={role}
      className="mb-5"
      extraConfirmNotice={bulkNotice}
      executeAction={(actionId: AdminBulkActionId, ids: string[]) =>
        executeInsurerBulkAction(actionId, ids)
      }
    >
      {(selection) => (
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} mt-5 overflow-hidden rounded-lg`}
        >
          {insurers.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                필터 조건에 맞는 보험사가 없습니다.
              </h2>
              <p className={`${textStyles.body} mt-2`}>
                초안 보험사를 등록하거나 필터 조건을 다시 확인해 주세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <BulkHeaderCheckbox selection={selection} />
                    </th>
                    <th className="px-4 py-3">보험사 운영 정보</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">최종 검수일</th>
                    <th className="px-4 py-3">수정일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {insurers.map((insurer) => {
                    const missingOperational = countMissingOperational(insurer);
                    const needsOperationalUpdate =
                      missingOperational >= MISSING_FIELD_THRESHOLD;
                    const publiclyVisible = isInsurerPubliclyVisible({
                      isPublished: insurer.isPublished,
                      verificationStatus: insurer.verificationStatus,
                    });
                    const togglePublishTarget = !insurer.isPublished;
                    const publishWouldBeBlocked = wouldPublishDraft({
                      isPublished: togglePublishTarget,
                      verificationStatus: insurer.verificationStatus,
                    });
                    return (
                      <tr key={insurer.id} className="align-top">
                        <td className="px-3 py-4">
                          <BulkRowCheckbox
                            id={insurer.id}
                            label={insurer.name}
                            selection={selection}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {insurer.name}
                          </div>
                          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                            <DetailItem
                              label="공식 웹사이트"
                              value={insurer.officialWebsiteUrl}
                            />
                            <DetailItem
                              label="설계사 포털"
                              value={insurer.plannerPortalUrl}
                            />
                            <DetailItem label="전산 접속" value={insurer.systemUrl} />
                            <DetailItem
                              label="전산 헬프데스크"
                              value={insurer.helpdeskPhone}
                            />
                            <DetailItem
                              label="고객센터"
                              value={insurer.customerCenterPhone}
                            />
                            <DetailItem
                              label="청구 안내 페이지"
                              value={insurer.claimPageUrl}
                            />
                            <DetailItem
                              label="청구 팩스"
                              value={insurer.claimFaxNumber}
                            />
                            <DetailItem
                              label="청구 팩스 처리"
                              value={claimFaxHandlingLabel(
                                insurer.claimFaxHandlingType,
                              )}
                            />
                            <DetailItem
                              label="청구 양식"
                              value={insurer.claimFormUrl}
                            />
                            <DetailItem label="약관" value={insurer.termsUrl} />
                            <DetailItem
                              label="카드납 종합 상태"
                              value={cardPaymentStatusLabel(
                                insurer.cardPaymentStatus,
                              )}
                            />
                            <DetailItem
                              label="우편 주소"
                              value={insurer.mailingAddress}
                            />
                          </dl>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={badgeClass("navy")}>
                              {categoryLabel(insurer.category)}
                            </span>
                            <span
                              className={badgeClass(
                                statusTone(insurer.verificationStatus),
                              )}
                            >
                              {statusLabel(insurer.verificationStatus)}
                            </span>
                            <span
                              className={badgeClass(
                                insurer.isPublished ? "green" : "gray",
                              )}
                            >
                              {insurer.isPublished
                                ? PUBLICATION_LABEL.published
                                : PUBLICATION_LABEL.unpublished}
                            </span>
                            <span
                              className={badgeClass(publiclyVisible ? "green" : "gray")}
                              title={
                                publiclyVisible
                                  ? ADMIN_VISIBILITY_COPY.policySummary
                                  : `${ADMIN_VISIBILITY_COPY.policySummary} ${ADMIN_VISIBILITY_COPY.draftRule}`
                              }
                            >
                              {publiclyVisible
                                ? VISIBILITY_LABEL.visible
                                : VISIBILITY_LABEL.hidden}
                            </span>
                            {insurer.isFeatured ? (
                              <span className={badgeClass("green")}>특별 표기</span>
                            ) : null}
                            {needsOperationalUpdate ? (
                              <span
                                className={badgeClass("gold")}
                                title={`${missingOperational}/${CORE_OPERATIONAL_FIELDS.length} 운영 필드 미입력`}
                              >
                                {NEEDS_UPDATE_TEXT}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(insurer.lastVerifiedAt)}
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(insurer.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Link
                              href={`/admin/insurers/${insurer.id}/edit`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] transition hover:bg-[#f7f1e5]"
                            >
                              수정
                            </Link>
                            <form
                              action={setInsurerPublished.bind(
                                null,
                                insurer.id,
                                togglePublishTarget,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={publishWouldBeBlocked}
                                title={
                                  publishWouldBeBlocked
                                    ? ADMIN_VISIBILITY_COPY.draftPublishBlocked
                                    : undefined
                                }
                                className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] transition hover:bg-[#f7f1e5] disabled:cursor-not-allowed disabled:border-[#d6d8dc] disabled:bg-[#f4f5f6] disabled:text-[#8a909a] disabled:hover:bg-[#f4f5f6]"
                              >
                                {insurer.isPublished
                                  ? "비게시로 전환"
                                  : "공개로 전환"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AdminBulkActionPanel>
  );
}
