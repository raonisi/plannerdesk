"use client";

import Link from "next/link";
import { borders, textStyles } from "@/lib/design-system";

interface WorkLinkItem {
  title: string;
  description: string;
  status: "active" | "info" | "coming_soon";
  href?: string;
  ctaText: string;
}

const workLinks: WorkLinkItem[] = [
  {
    title: "보험사 전산실",
    description: "보험사 전산 접속, 고객센터, 헬프데스크, 청구 팩스, 카드납 정보를 한곳에서 확인합니다.",
    status: "active",
    href: "/directory",
    ctaText: "바로가기",
  },
  {
    title: "청구서류",
    description: "보험사별·청구 유형별 필요서류를 정리해 실무 확인 시간을 줄입니다.",
    status: "active",
    href: "/claim-documents",
    ctaText: "바로가기",
  },
  {
    title: "공시·약관",
    description: "상품공시, 약관, 공식 안내 링크를 기준 중심으로 확인합니다.",
    status: "active",
    href: "/disclosure-links",
    ctaText: "바로가기",
  },
  {
    title: "고객 안내문",
    description: "고객에게 보낼 안내 문구를 상황별로 빠르게 참고합니다.",
    status: "active",
    href: "/message-templates",
    ctaText: "바로가기",
  },
  {
    title: "수정 요청 / 제보",
    description: "잘못된 링크, 번호, 서류 정보를 발견했다면 검수 요청으로 남겨주세요.",
    status: "info",
    href: "#feedback-section",
    ctaText: "제보 안내",
  },
  {
    title: "실무 자료",
    description: "반복되는 질문과 업무 기준을 검색 가능한 지식 아카이브로 준비 중입니다.",
    status: "coming_soon",
    ctaText: "준비 중",
  },
  {
    title: "설계사 커뮤니티",
    description: "검증 설계사 Q&A, 실무 노하우, 업무 팁 공유 공간으로 확장 예정입니다.",
    status: "coming_soon",
    ctaText: "준비 중",
  },
  {
    title: "AI 답변 보조",
    description: "검수된 지식 아카이브를 바탕으로 답변 초안을 돕는 기능을 준비 중입니다.",
    status: "coming_soon",
    ctaText: "준비 중",
  },
];

export function MajorWorkLinks() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className={textStyles.eyebrow}>Portal</p>
        <h2 className="text-2xl font-bold text-[#102235] sm:text-3xl">주요 업무 링크</h2>
        <p className="text-sm leading-6 text-[#4f5661]">
          보험설계사분들이 매일 수행하는 실무 핵심 기능으로 빠르게 이동할 수 있는 종합 포털 영역입니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {workLinks.map((item) => {
          const isComingSoon = item.status === "coming_soon";
          const isInfo = item.status === "info";
          const isActive = item.status === "active";

          return (
            <article
              key={item.title}
              className={`flex flex-col justify-between rounded-xl border ${borders.divider} bg-[#fbf7ee] p-5 transition-all ${
                isComingSoon
                  ? "opacity-60"
                  : "shadow-[0_10px_25px_rgba(16,34,53,0.03)] hover:shadow-[0_15px_35px_rgba(16,34,53,0.06)] hover:border-[#aa8137]/60"
              }`}
              style={{ minHeight: "220px" }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-[#102235]">{item.title}</h3>
                  {isComingSoon && (
                    <span className="rounded bg-[#e7ddc9] px-2 py-0.5 text-[11px] font-semibold text-[#7a612d]">
                      준비 중
                    </span>
                  )}
                  {isInfo && (
                    <span className="rounded bg-[#fff7e6] border border-[#d9c9a8] px-2 py-0.5 text-[11px] font-semibold text-[#7a612d]">
                      안내
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-[#4f5661] break-keep">{item.description}</p>
              </div>

              <div className="mt-4 pt-2">
                {isActive && item.href && (
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#173f36] bg-white text-sm font-bold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
                  >
                    {item.ctaText}
                  </Link>
                )}
                {isInfo && item.href && (
                  <a
                    href={item.href}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#aa8137] bg-[#fff7e6] text-sm font-bold text-[#7a612d] transition hover:bg-[#fbf0d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
                  >
                    {item.ctaText}
                  </a>
                )}
                {isComingSoon && (
                  <span className="inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-lg border border-[#d6d8dc] bg-[#f4f5f6] text-sm font-semibold text-[#8a909a]">
                    {item.ctaText}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* 차분하고 정돈된 안전 안내 박스 */}
      <div className="rounded-xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_10px_25px_rgba(16,34,53,0.02)]">
        <h4 className="text-sm font-semibold text-[#102235]">실무 이용 및 개인정보 보호 안내</h4>
        <ul className="mt-3 grid gap-x-6 gap-y-2 text-xs leading-5 text-[#5f6670] sm:grid-cols-2">
          <li className="flex items-start gap-1.5 break-keep">
            <span className="text-[#aa8137]">✓</span>
            <span>플래너데스크는 보험금 지급 여부를 판단하지 않습니다.</span>
          </li>
          <li className="flex items-start gap-1.5 break-keep">
            <span className="text-[#aa8137]">✓</span>
            <span>플래너데스크는 보험금 지급 금액을 산정하지 않습니다.</span>
          </li>
          <li className="flex items-start gap-1.5 break-keep">
            <span className="text-[#aa8137]">✓</span>
            <span>고객 개인정보, 주민번호, 진단서, 청구서류 원본은 절대 입력하지 마세요.</span>
          </li>
          <li className="flex items-start gap-1.5 break-keep">
            <span className="text-[#aa8137]">✓</span>
            <span>본 포털의 모든 자료는 참고용이며, 실제 업무 처리는 보험사 공식 기준을 따릅니다.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
