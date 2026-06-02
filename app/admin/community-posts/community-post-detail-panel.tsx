"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  CommunityPostCategory,
  CommunityPostStatus,
  CommunityPostVisibility,
  CommunityReportReason,
  CommunityReportStatus,
} from "@prisma/client";
import { updateCommunityPostModeration } from "./actions";
import {
  ADMIN_COMMUNITY_COPY,
  CATEGORY_LABEL,
  REPORT_REASON_LABEL,
  STATUS_LABEL,
  WRITABLE_POST_STATUSES,
  statusTone,
} from "./visibility";

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  const base = "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";
  if (tone === "green") return `${base} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${base} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${base} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${base} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${base} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

export type CommunityAdminDetail = {
  id: string;
  title: string;
  content: string;
  category: CommunityPostCategory;
  status: CommunityPostStatus;
  visibility: CommunityPostVisibility;
  isBlind: boolean;
  blindReason: CommunityReportReason | null;
  blindReasonText: string | null;
  reportCount: number;
  adminMemo: string | null;
  authorLabel: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  reports: {
    id: string;
    reason: CommunityReportReason;
    status: CommunityReportStatus;
    message: string | null;
    createdAt: string;
    reporterLabel: string;
  }[];
};

function date(iso: string | null): string {
  if (!iso) return "?";
  return iso.replace("T", " ").slice(0, 16);
}

export default function CommunityPostDetailPanel({ row }: { row: CommunityAdminDetail }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const run = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateCommunityPostModeration(row.id, formData);
      if (result.ok) {
        setFeedback("운영 상태가 저장되었습니다.");
        router.refresh();
      } else {
        setFeedback(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm text-[#102235]">{ADMIN_COMMUNITY_COPY.policySummary}</div>
      {feedback ? <p className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-sm text-[#4f5661]">{feedback}</p> : null}

      <section className="rounded-lg border border-[#d9c9a8] bg-white p-5">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className={badgeClass("gray")}>{CATEGORY_LABEL[row.category]}</span>
          <span className={badgeClass(statusTone(row.status))}>{STATUS_LABEL[row.status]}</span>
          {row.isBlind ? <span className={badgeClass("red")}>블라인드</span> : null}
        </div>
        <h2 className="text-xl font-semibold text-[#102235]">{row.title}</h2>
        <p className="mt-2 text-xs text-[#5f6670]">작성자 {row.authorLabel} · 작성 {date(row.createdAt)} · 수정 {date(row.updatedAt)} · 삭제 {date(row.deletedAt)}</p>
        <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#303845]">{row.content}</div>
      </section>

      <section className="rounded-lg border border-[#d9c9a8] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#102235]">Moderation</h3>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const status = String(formData.get("status") ?? "");
            if (status === "deleted" && !window.confirm("게시글을 삭제 처리할까요?")) return;
            run(formData);
          }}
        >
          <label className="block text-sm">
            상태
            <select name="status" defaultValue={row.status} className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] px-3 text-sm" disabled={isPending}>
              {WRITABLE_POST_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABEL[value]}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            블라인드 사유
            <select name="blindReason" defaultValue={row.blindReason ?? "other"} className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] px-3 text-sm" disabled={isPending}>
              {Object.entries(REPORT_REASON_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            블라인드 보충 사유
            <textarea name="blindReasonText" defaultValue={row.blindReasonText ?? ""} className="mt-1 min-h-20 w-full rounded-md border border-[#d9c9a8] px-3 py-2 text-sm" disabled={isPending} />
          </label>
          <label className="block text-sm">
            관리자 메모
            <textarea name="adminMemo" defaultValue={row.adminMemo ?? ""} className="mt-1 min-h-24 w-full rounded-md border border-[#d9c9a8] px-3 py-2 text-sm" disabled={isPending} />
          </label>
          <button type="submit" className="rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8]" disabled={isPending}>저장</button>
        </form>
      </section>

      <section className="rounded-lg border border-[#d9c9a8] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#102235]">신고 내역 ({row.reportCount})</h3>
        <div className="mt-3 space-y-2 text-sm">
          {row.reports.length === 0 ? <p className="text-[#5f6670]">신고 내역이 없습니다.</p> : row.reports.map((report) => (
            <article key={report.id} className="rounded-md border border-[#e7ddc9] bg-[#fbf7ee] p-3">
              <p className="text-xs text-[#5f6670]">{date(report.createdAt)} · {report.reporterLabel}</p>
              <p className="mt-1 font-semibold text-[#102235]">{REPORT_REASON_LABEL[report.reason]} / {report.status}</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[#4f5661]">{report.message ?? "(설명 없음)"}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

