"use client";

import Link from "next/link";
import type {
  PlannerBusinessChannel,
  PlannerCareerRange,
  PlannerLicenseScope,
  PlannerType,
  PlannerVerificationStatus,
} from "@prisma/client";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  STATUS_LABEL,
  businessChannelLabel,
  careerRangeLabel,
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

export type PlannerVerificationListRow = {
  id: string;
  displayName: string;
  applicantLabel: string;
  status: PlannerVerificationStatus;
  plannerType: PlannerType;
  affiliationName: string | null;
  activityRegion: string;
  careerRange: PlannerCareerRange;
  licenseScope: PlannerLicenseScope;
  businessChannel: PlannerBusinessChannel;
  containsSensitiveData: boolean;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedByLabel: string | null;
  suspendedAt: string | null;
  deletedAt: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

export default function PlannerVerificationsAdminList({
  rows,
}: {
  rows: PlannerVerificationListRow[];
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
              <th className="px-4 py-3">표시 이름</th>
              <th className="px-4 py-3">신청자</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">소속</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">경력</th>
              <th className="px-4 py-3">자격 범위</th>
              <th className="px-4 py-3">업무 채널</th>
              <th className="px-4 py-3">신청일</th>
              <th className="px-4 py-3">처리</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7ddc9]">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold text-[#102235]">{row.displayName}</p>
                  {row.containsSensitiveData ? (
                    <span className={`${badgeClass("red")} mt-1`}>민감정보</span>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-[#4f5661]">{row.applicantLabel}</td>
                <td className="px-4 py-4">
                  <span className={badgeClass(statusTone(row.status))}>
                    {STATUS_LABEL[row.status]}
                  </span>
                  {row.deletedAt ? (
                    <span className={`${badgeClass("red")} ml-1`}>삭제됨</span>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <span className={badgeClass("gray")}>
                    {plannerTypeLabel(row.plannerType)}
                  </span>
                </td>
                <td className="px-4 py-4 text-[#4f5661]">
                  {row.affiliationName ?? "—"}
                </td>
                <td className="px-4 py-4 text-[#4f5661]">{row.activityRegion}</td>
                <td className="px-4 py-4 text-[#4f5661]">
                  {careerRangeLabel(row.careerRange)}
                </td>
                <td className="px-4 py-4 text-[#4f5661]">
                  {licenseScopeLabel(row.licenseScope)}
                </td>
                <td className="px-4 py-4 text-[#4f5661]">
                  {businessChannelLabel(row.businessChannel)}
                </td>
                <td className="px-4 py-4 text-[#4f5661]">
                  {formatDate(row.requestedAt)}
                </td>
                <td className="px-4 py-4 text-xs text-[#4f5661]">
                  <p>{formatDate(row.reviewedAt)}</p>
                  {row.reviewedByLabel ? (
                    <p className="mt-0.5">{row.reviewedByLabel}</p>
                  ) : null}
                  {row.suspendedAt ? (
                    <p className="mt-0.5 text-[#8b2e2e]">
                      정지 {formatDate(row.suspendedAt)}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/planner-verifications/${row.id}`}
                    className="inline-flex min-h-9 items-center rounded-md border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                  >
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
