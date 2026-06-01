"use client";

import Link from "next/link";
import type {
  CorrectionRequestPriority,
  CorrectionRequestStatus,
  CorrectionRequestType,
  CorrectionTargetType,
} from "@prisma/client";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  PRIORITY_LABEL,
  priorityTone,
  requestTypeLabel,
  STATUS_LABEL,
  statusTone,
  targetTypeLabel,
  truncateListTitle,
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

export type CorrectionListRow = {
  id: string;
  title: string;
  requestType: CorrectionRequestType;
  targetType: CorrectionTargetType;
  targetId: string | null;
  status: CorrectionRequestStatus;
  priority: CorrectionRequestPriority;
  containsSensitiveData: boolean;
  redactionRequired: boolean;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByLabel: string | null;
  deletedAt: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

export default function CorrectionsAdminList({
  rows,
}: {
  rows: CorrectionListRow[];
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
          <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
            <tr>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">대상</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">우선순위</th>
              <th className="px-4 py-3">플래그</th>
              <th className="px-4 py-3">접수일</th>
              <th className="px-4 py-3">처리</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7ddc9]">
            {rows.map((row) => {
              const sensitive =
                row.containsSensitiveData || row.redactionRequired;
              return (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[#102235]">
                      {truncateListTitle(row.title, sensitive)}
                    </p>
                    {sensitive ? (
                      <p className="mt-1 text-xs text-[#7b5b19]">
                        내용 미리보기 제한
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-[#4f5661]">
                    {requestTypeLabel(row.requestType)}
                  </td>
                  <td className="px-4 py-4 text-[#4f5661]">
                    <p>{targetTypeLabel(row.targetType)}</p>
                    {row.targetId ? (
                      <p className="mt-0.5 font-mono text-xs text-[#5f6670]">
                        {row.targetId.slice(0, 12)}…
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-[#5f6670]">—</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={badgeClass(statusTone(row.status))}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={badgeClass(priorityTone(row.priority))}>
                      {PRIORITY_LABEL[row.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {row.containsSensitiveData ? (
                        <span className={badgeClass("red")}>민감정보</span>
                      ) : null}
                      {row.redactionRequired ? (
                        <span className={badgeClass("gold")}>마스킹</span>
                      ) : null}
                      {row.deletedAt ? (
                        <span className={badgeClass("red")}>삭제됨</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#4f5661]">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#4f5661]">
                    <p>{formatDate(row.resolvedAt)}</p>
                    {row.resolvedByLabel ? (
                      <p className="mt-0.5">{row.resolvedByLabel}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/corrections/${row.id}`}
                      className="inline-flex min-h-9 items-center rounded-md border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                    >
                      상세
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
