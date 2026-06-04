import Link from "next/link";
import { KnowledgeArticleStatus } from "@prisma/client";
import { borders, shadows, surfaces } from "@/lib/design-system";
import { KNOWLEDGE_REVIEW_CHECKLIST } from "@/lib/knowledge/workflow-labels";

const QUICK_FILTERS: Array<{ href: string; label: string }> = [
  {
    href: `/admin/knowledge?status=${KnowledgeArticleStatus.needs_review}`,
    label: "검수 대기",
  },
  {
    href: `/admin/knowledge?status=${KnowledgeArticleStatus.verified}&published=false`,
    label: "공개 가능·미게시",
  },
  {
    href: `/admin/knowledge?status=${KnowledgeArticleStatus.rejected}`,
    label: "수정 필요",
  },
  {
    href: `/admin/knowledge?status=${KnowledgeArticleStatus.archived}`,
    label: "보류",
  },
  {
    href: "/admin/knowledge?published=true",
    label: "게시 중",
  },
];

export default function KnowledgeAdminWorkflowGuide() {
  return (
    <section
      className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 rounded-lg p-4 sm:p-5`}
      aria-label="지식 아카이브 운영 흐름"
    >
      <h2 className="text-sm font-bold text-[#102235]">등록·검수·공개 흐름</h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-[#4f5661]">
        <li>초안 작성 → 검수 대기 → 공개 가능 → 게시(공개 화면 후보)</li>
        <li>수정 필요·보류 상태는 public에 노출되지 않습니다.</li>
        <li>일괄 상태 변경 전 선택 건수와 공식 출처·금지 표현을 확인합니다.</li>
      </ol>
      <p className="mt-3 text-xs font-semibold text-[#102235]">공개 전 확인</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-relaxed text-[#4f5661]">
        {KNOWLEDGE_REVIEW_CHECKLIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => (
          <Link
            key={filter.href}
            className="inline-flex min-h-9 items-center rounded-full border border-[#d9c9a8] bg-white px-3.5 text-xs font-semibold text-[#303845] transition hover:border-[#aa8137] hover:text-[#7a612d]"
            href={filter.href}
          >
            {filter.label}
          </Link>
        ))}
        <Link
          className="inline-flex min-h-9 items-center rounded-full border border-[#c8d2dc] bg-[#eef3f7] px-3.5 text-xs font-semibold text-[#102235]"
          href="/admin/knowledge"
        >
          필터 초기화
        </Link>
      </div>
    </section>
  );
}
