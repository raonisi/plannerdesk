"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  PlannerBusinessChannel,
  PlannerCareerRange,
  PlannerLicenseScope,
  PlannerType,
  PlannerVerificationStatus,
} from "@prisma/client";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  updatePlannerVerificationAdminMemo,
  updatePlannerVerificationRejectionFields,
  updatePlannerVerificationSensitiveFlag,
  updatePlannerVerificationStatus,
} from "./actions";
import {
  ADMIN_PLANNER_VERIFICATION_COPY,
  STATUS_LABEL,
  WRITABLE_STATUSES,
  businessChannelLabel,
  careerRangeLabel,
  formatApplicantLabel,
  licenseScopeLabel,
  plannerTypeLabel,
  statusTone,
} from "./visibility";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

export type PlannerVerificationDetailData = {
  id: string;
  displayName: string;
  applicant: { id: string; name: string | null };
  status: PlannerVerificationStatus;
  plannerType: PlannerType;
  affiliationName: string | null;
  activityRegion: string;
  careerRange: PlannerCareerRange;
  licenseScope: PlannerLicenseScope;
  businessChannel: PlannerBusinessChannel;
  verificationNote: string | null;
  containsSensitiveData: boolean;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedByLabel: string | null;
  adminMemo: string | null;
  rejectionReason: string | null;
  userFacingRejectionSummary: string | null;
  suspendedAt: string | null;
  deletedAt: string | null;
  retentionUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

export default function PlannerVerificationDetailPanel({
  row,
}: {
  row: PlannerVerificationDetailData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [noteExpanded, setNoteExpanded] = useState(!row.containsSensitiveData);

  const runAction = (
    action: () => Promise<{ ok: boolean; message?: string }>,
    successMessage: string,
  ) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setFeedback(successMessage);
        router.refresh();
        return;
      }
      setFeedback(result.message ?? "처리에 실패했습니다.");
    });
  };

  const handleStatusSubmit = (formData: FormData) => {
    const status = String(formData.get("status") ?? "");
    if (
      status === "deleted" &&
      !window.confirm(
        "이 검증 신청을 삭제 처리합니다. 목록 기본 조회에서 제외되며 public 데이터는 변경되지 않습니다. 계속할까요?",
      )
    ) {
      return;
    }
    if (
      status === "suspended" &&
      !window.confirm(
        "검증을 정지 처리합니다. 향후 커뮤니티 글쓰기 제한 기준으로 사용됩니다. 계속할까요?",
      )
    ) {
      return;
    }
    runAction(
      () => updatePlannerVerificationStatus(row.id, formData),
      "상태가 저장되었습니다.",
    );
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]"
        role="note"
      >
        <p>{ADMIN_PLANNER_VERIFICATION_COPY.policySummary}</p>
        <p className="mt-2">{ADMIN_PLANNER_VERIFICATION_COPY.collectionNotice}</p>
        <p className="mt-2 text-xs text-[#4f5661]">
          {ADMIN_PLANNER_VERIFICATION_COPY.statusChangeNote}
        </p>
      </div>

      {row.deletedAt ? (
        <div
          className="rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8b2e2e]"
          role="alert"
        >
          삭제 처리됨 ({formatDateTime(row.deletedAt)}).
        </div>
      ) : null}

      {row.containsSensitiveData ? (
        <div
          className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
          role="alert"
        >
          {ADMIN_PLANNER_VERIFICATION_COPY.sensitiveBanner}
        </div>
      ) : null}

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#102235]">{row.displayName}</h2>
            <p className="mt-2 text-sm text-[#4f5661]">
              신청자: {formatApplicantLabel(row.applicant)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={badgeClass(statusTone(row.status))}>
              {STATUS_LABEL[row.status]}
            </span>
            <span className={badgeClass("gray")}>
              {plannerTypeLabel(row.plannerType)}
            </span>
            {row.containsSensitiveData ? (
              <span className={badgeClass("red")}>민감정보 의심</span>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">소속</dt>
            <dd className="mt-1 text-[#102235]">{row.affiliationName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              활동 지역
            </dt>
            <dd className="mt-1 text-[#102235]">{row.activityRegion}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              경력 구간
            </dt>
            <dd className="mt-1 text-[#102235]">
              {careerRangeLabel(row.careerRange)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              자격 범위
            </dt>
            <dd className="mt-1 text-[#102235]">
              {licenseScopeLabel(row.licenseScope)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              업무 채널
            </dt>
            <dd className="mt-1 text-[#102235]">
              {businessChannelLabel(row.businessChannel)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              신청자 ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-[#4f5661]">
              {row.applicant.id}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              신청일
            </dt>
            <dd className="mt-1 text-[#102235]">{formatDateTime(row.requestedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              검토일 / 처리자
            </dt>
            <dd className="mt-1 text-[#102235]">
              {formatDateTime(row.reviewedAt)}
              {row.reviewedByLabel ? ` · ${row.reviewedByLabel}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              정지일 / 보관 만료
            </dt>
            <dd className="mt-1 text-[#102235]">
              {formatDateTime(row.suspendedAt)} /{" "}
              {formatDateTime(row.retentionUntil)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              생성 / 수정
            </dt>
            <dd className="mt-1 text-[#102235]">
              {formatDateTime(row.createdAt)} / {formatDateTime(row.updatedAt)}
            </dd>
          </div>
        </dl>

        {row.verificationNote ? (
          <div className="mt-5 rounded-md border border-[#d9c9a8] bg-[#fbf7ee] p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#102235]">신청 메모</h3>
              {row.containsSensitiveData ? (
                <button
                  className="text-xs font-semibold text-[#7a612d] underline"
                  onClick={() => setNoteExpanded((v) => !v)}
                  type="button"
                >
                  {noteExpanded ? "접기" : "내용 보기"}
                </button>
              ) : null}
            </div>
            {noteExpanded ? (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#303845]">
                {row.verificationNote}
              </p>
            ) : (
              <p className="mt-3 text-sm text-[#5f6670]">
                민감정보 의심 신청입니다. 필요할 때만 내용을 펼쳐 확인하세요.
              </p>
            )}
          </div>
        ) : null}
      </section>

      {feedback ? (
        <p
          aria-live="polite"
          className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-sm text-[#4f5661]"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
        >
          <h3 className="text-sm font-semibold text-[#102235]">상태 변경</h3>
          <p className="mt-1 text-xs text-[#5f6670]">
            자동 승인·외부 조회 없이 수동으로만 변경합니다.
          </p>
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleStatusSubmit(new FormData(event.currentTarget));
            }}
          >
            <select
              className="min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
              defaultValue={row.status}
              disabled={isPending}
              name="status"
            >
              {WRITABLE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABEL[value]}
                </option>
              ))}
            </select>
            <button
              className="min-h-10 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              상태 저장
            </button>
          </form>
        </section>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
        >
          <h3 className="text-sm font-semibold text-[#102235]">민감정보 플래그</h3>
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              runAction(
                () =>
                  updatePlannerVerificationSensitiveFlag(
                    row.id,
                    new FormData(event.currentTarget),
                  ),
                "민감정보 플래그가 저장되었습니다.",
              );
            }}
          >
            <select
              className="min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
              defaultValue={row.containsSensitiveData ? "true" : "false"}
              disabled={isPending}
              name="containsSensitiveData"
            >
              <option value="true">민감정보 의심</option>
              <option value="false">민감정보 없음</option>
            </select>
            <button
              className="min-h-10 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              플래그 저장
            </button>
          </form>
        </section>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4 lg:col-span-2`}
        >
          <h3 className="text-sm font-semibold text-[#102235]">관리자 메모</h3>
          <p className="mt-1 text-xs text-[#5f6670]">
            {ADMIN_PLANNER_VERIFICATION_COPY.memoHint}
          </p>
          <form
            action={(formData) =>
              runAction(
                () => updatePlannerVerificationAdminMemo(row.id, formData),
                "관리자 메모가 저장되었습니다.",
              )
            }
            className="mt-3 space-y-3"
          >
            <textarea
              className="min-h-28 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm"
              defaultValue={row.adminMemo ?? ""}
              disabled={isPending}
              maxLength={2000}
              name="adminMemo"
            />
            <button
              className="min-h-10 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              메모 저장
            </button>
          </form>
        </section>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4 lg:col-span-2`}
        >
          <h3 className="text-sm font-semibold text-[#102235]">거절 사유</h3>
          <p className="mt-1 text-xs text-[#5f6670]">
            {ADMIN_PLANNER_VERIFICATION_COPY.rejectionHint}
          </p>
          <form
            action={(formData) =>
              runAction(
                () => updatePlannerVerificationRejectionFields(row.id, formData),
                "거절 사유가 저장되었습니다.",
              )
            }
            className="mt-3 space-y-3"
          >
            <label className="block text-sm">
              <span className="font-medium text-[#303845]">
                사용자 노출 가능 요약 (중립 문구)
              </span>
              <input
                className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                defaultValue={row.userFacingRejectionSummary ?? ""}
                disabled={isPending}
                maxLength={500}
                name="userFacingRejectionSummary"
                placeholder="예: 제출된 정보만으로는 검증 기준을 충족하기 어렵습니다."
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-[#303845]">
                내부 거절 사유 (관리자 전용)
              </span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm"
                defaultValue={row.rejectionReason ?? ""}
                disabled={isPending}
                maxLength={2000}
                name="rejectionReason"
              />
            </label>
            <button
              className="min-h-10 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              거절 사유 저장
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
