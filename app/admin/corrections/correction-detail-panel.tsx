"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  CorrectionRequestPriority,
  CorrectionRequestStatus,
  CorrectionRequestType,
  CorrectionTargetType,
} from "@prisma/client";
import { borders, shadows, surfaces } from "@/lib/design-system";
import { getCorrectionAdminTargetHref } from "@/lib/correction-request/admin-target-links";
import {
  markCorrectionRequestRedacted,
  updateCorrectionRequestAdminMemo,
  updateCorrectionRequestFlags,
  updateCorrectionRequestPriority,
  updateCorrectionRequestStatus,
} from "./actions";
import {
  ADMIN_CORRECTION_COPY,
  PRIORITY_LABEL,
  REQUEST_TYPE_LABELS,
  STATUS_LABEL,
  TARGET_TYPE_LABELS,
  WRITABLE_PRIORITIES,
  WRITABLE_STATUSES,
  priorityTone,
  requestTypeLabel,
  statusTone,
  targetTypeLabel,
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

export type CorrectionDetailData = {
  id: string;
  title: string;
  message: string;
  requestType: CorrectionRequestType;
  targetType: CorrectionTargetType;
  targetId: string | null;
  status: CorrectionRequestStatus;
  priority: CorrectionRequestPriority;
  containsSensitiveData: boolean;
  redactionRequired: boolean;
  redactedAt: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByLabel: string | null;
  retentionUntil: string | null;
  deletedAt: string | null;
  adminMemo: string | null;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

function needsPayoutWarning(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("보험금") ||
    normalized.includes("지급") ||
    normalized.includes("손해사정") ||
    normalized.includes("청구 가능")
  );
}

export default function CorrectionDetailPanel({
  row,
}: {
  row: CorrectionDetailData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [messageExpanded, setMessageExpanded] = useState(
    !row.redactionRequired && !row.containsSensitiveData,
  );

  const targetLink = getCorrectionAdminTargetHref(row.targetType, row.targetId);
  const showSensitiveBanner =
    row.containsSensitiveData || row.redactionRequired;
  const showPayoutBanner = needsPayoutWarning(row.message);

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
        "이 제보를 삭제 처리합니다. 목록 기본 조회에서 제외되며 public 데이터는 변경되지 않습니다. 계속할까요?",
      )
    ) {
      return;
    }
    if (
      status === "archived" &&
      !window.confirm("이 제보를 보관 처리합니다. 계속할까요?")
    ) {
      return;
    }
    runAction(
      () => updateCorrectionRequestStatus(row.id, formData),
      "상태가 저장되었습니다.",
    );
  };

  const handleFlagsSubmit = (formData: FormData) => {
    const redaction = formData.get("redactionRequired") === "true";
    const wasRedaction = row.redactionRequired;
    if (wasRedaction && !redaction) {
      if (
        !window.confirm(
          "마스킹 필요 플래그를 해제합니다. 원문 노출 위험을 다시 확인했는지 검토하세요. 계속할까요?",
        )
      ) {
        return;
      }
    }
    runAction(
      () => updateCorrectionRequestFlags(row.id, formData),
      "민감정보 플래그가 저장되었습니다.",
    );
  };

  return (
    <div className="space-y-6">
      {row.deletedAt ? (
        <div
          className="rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8b2e2e]"
          role="alert"
        >
          이 제보는 삭제 처리되었습니다 ({formatDateTime(row.deletedAt)}).
        </div>
      ) : null}

      {showSensitiveBanner ? (
        <div
          className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
          role="alert"
        >
          {ADMIN_CORRECTION_COPY.sensitiveBanner}
        </div>
      ) : null}

      {showPayoutBanner ? (
        <div
          className="rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm text-[#102235]"
          role="note"
        >
          {ADMIN_CORRECTION_COPY.payoutBanner}
        </div>
      ) : null}

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#102235]">{row.title}</h2>
            <p className="mt-2 text-sm text-[#4f5661]">
              {requestTypeLabel(row.requestType)} ·{" "}
              {targetTypeLabel(row.targetType)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={badgeClass(statusTone(row.status))}>
              {STATUS_LABEL[row.status]}
            </span>
            <span className={badgeClass(priorityTone(row.priority))}>
              {PRIORITY_LABEL[row.priority]}
            </span>
            {row.containsSensitiveData ? (
              <span className={badgeClass("red")}>민감정보 의심</span>
            ) : null}
            {row.redactionRequired ? (
              <span className={badgeClass("gold")}>마스킹 필요</span>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              접수일
            </dt>
            <dd className="mt-1 text-[#102235]">{formatDateTime(row.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              처리일 / 처리자
            </dt>
            <dd className="mt-1 text-[#102235]">
              {formatDateTime(row.resolvedAt)}
              {row.resolvedByLabel ? ` · ${row.resolvedByLabel}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              대상 ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-[#4f5661]">
              {row.targetId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#7a612d]">
              보관 만료 / 마스킹 완료
            </dt>
            <dd className="mt-1 text-[#102235]">
              {formatDateTime(row.retentionUntil)} /{" "}
              {formatDateTime(row.redactedAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-md border border-[#d9c9a8] bg-[#fbf7ee] p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#102235]">제보 내용</h3>
            {row.redactionRequired || row.containsSensitiveData ? (
              <button
                className="text-xs font-semibold text-[#7a612d] underline"
                onClick={() => setMessageExpanded((v) => !v)}
                type="button"
              >
                {messageExpanded ? "접기" : "내용 보기"}
              </button>
            ) : null}
          </div>
          {messageExpanded ? (
            <div
              className="mt-3 select-none whitespace-pre-wrap break-words text-sm leading-6 text-[#303845]"
              // Intentionally no copy/share controls per PR-81 policy.
            >
              {row.message}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#5f6670]">
              민감정보 의심 제보입니다. 필요할 때만 내용을 펼쳐 확인하세요.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-md border border-[#e7ddc9] bg-white px-4 py-3 text-xs text-[#4f5661]">
          <p>{ADMIN_CORRECTION_COPY.targetLinkNote}</p>
          {targetLink.href ? (
            <Link
              className="mt-2 inline-flex font-semibold text-[#102235] underline"
              href={targetLink.href}
            >
              {targetLink.label} →
            </Link>
          ) : (
            <p className="mt-2 font-medium text-[#5f6670]">{targetLink.label}</p>
          )}
        </div>
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
          <h3 className="text-sm font-semibold text-[#102235]">우선순위</h3>
          <form
            action={(formData) =>
              runAction(
                () => updateCorrectionRequestPriority(row.id, formData),
                "우선순위가 저장되었습니다.",
              )
            }
            className="mt-3 space-y-3"
          >
            <select
              className="min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
              defaultValue={row.priority}
              disabled={isPending}
              name="priority"
            >
              {WRITABLE_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABEL[value]}
                </option>
              ))}
            </select>
            <button
              className="min-h-10 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              우선순위 저장
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
              handleFlagsSubmit(new FormData(event.currentTarget));
            }}
          >
            <label className="block text-sm">
              <span className="font-medium text-[#303845]">민감정보 의심</span>
              <select
                className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                defaultValue={row.containsSensitiveData ? "true" : "false"}
                disabled={isPending}
                name="containsSensitiveData"
              >
                <option value="true">예</option>
                <option value="false">아니오</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-[#303845]">마스킹 필요</span>
              <select
                className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                defaultValue={row.redactionRequired ? "true" : "false"}
                disabled={isPending}
                name="redactionRequired"
              >
                <option value="true">예</option>
                <option value="false">아니오</option>
              </select>
            </label>
            <button
              className="min-h-10 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              플래그 저장
            </button>
          </form>
          <button
            className="mt-3 min-h-10 rounded-md border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#102235] disabled:opacity-60"
            disabled={isPending || !row.redactionRequired}
            onClick={() =>
              runAction(
                () => markCorrectionRequestRedacted(row.id),
                "마스킹 완료 시각이 기록되었습니다.",
              )
            }
            type="button"
          >
            마스킹 완료 시각 기록 (redactedAt)
          </button>
        </section>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4 lg:col-span-2`}
        >
          <h3 className="text-sm font-semibold text-[#102235]">관리자 메모</h3>
          <p className="mt-1 text-xs text-[#5f6670]">
            {ADMIN_CORRECTION_COPY.memoHint}
          </p>
          <form
            action={(formData) =>
              runAction(
                () => updateCorrectionRequestAdminMemo(row.id, formData),
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
      </div>

      <p className="text-xs text-[#5f6670]">
        유형 라벨 참고: {TARGET_TYPE_LABELS[row.targetType]} /{" "}
        {REQUEST_TYPE_LABELS[row.requestType]}
      </p>
    </div>
  );
}
