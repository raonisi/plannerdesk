"use client";

import Link from "next/link";
import type { CommunityPostCategory, CommunityPostStatus } from "@prisma/client";
import { CATEGORY_LABEL, STATUS_LABEL, statusTone } from "./visibility";

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  const base = "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";
  if (tone === "green") return `${base} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${base} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${base} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${base} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${base} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

export type CommunityAdminListRow = {
  id: string;
  category: CommunityPostCategory;
  title: string;
  status: CommunityPostStatus;
  isBlind: boolean;
  reportCount: number;
  authorLabel: string;
  createdAt: string;
  deletedAt: string | null;
};

export default function CommunityPostsAdminList({ rows }: { rows: CommunityAdminListRow[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#d9c9a8] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
          <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
            <tr>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">신고 수</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7ddc9]">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="px-4 py-4 text-[#4f5661]">{CATEGORY_LABEL[row.category]}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-[#102235]">{row.title}</p>
                  {row.deletedAt ? <p className="mt-1 text-xs text-[#8b2e2e]">삭제됨</p> : null}
                </td>
                <td className="px-4 py-4">
                  <span className={badgeClass(statusTone(row.status))}>{STATUS_LABEL[row.status]}</span>
                  {row.isBlind ? <span className={`${badgeClass("red")} ml-1`}>블라인드</span> : null}
                </td>
                <td className="px-4 py-4 text-[#4f5661]">{row.authorLabel}</td>
                <td className="px-4 py-4 text-[#4f5661]">{row.reportCount}</td>
                <td className="px-4 py-4 text-[#4f5661]">{row.createdAt.slice(0, 10)}</td>
                <td className="px-4 py-4 text-right">
                  <Link href={`/admin/community-posts/${row.id}`} className="inline-flex min-h-9 items-center rounded-md border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]">
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

