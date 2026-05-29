"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Wrench,
  FileText,
  MessageSquare,
  BookOpen,
  Star,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { PublicInsurer } from "@/lib/public/insurers";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import { launcherIconTone, notices, sectionEyebrow, shadows, spacing, surfaces, textStyles } from "@/lib/design-system";
import { uiLabels } from "@/lib/ui-labels";

interface HomeClientProps {
  insurers: PublicInsurer[];
  claimDocuments: PublicClaimDocument[];
}

export function HomeClient({ insurers, claimDocuments }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  // Local storage favorites and recents
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<Array<{ id: string; label: string; href: string; type: string }>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load favorites
      const savedFavs = window.localStorage.getItem("plannerdesk.workTools.favorites");
      if (savedFavs) {
        try {
          const parsed = JSON.parse(savedFavs) as string[];
          setTimeout(() => setFavorites(parsed), 0);
        } catch (e) {
          console.error(e);
        }
      }
      
      // Load recents
      const savedRecents = window.localStorage.getItem("plannerdesk.home.recents");
      if (savedRecents) {
        try {
          const parsed = JSON.parse(savedRecents) as Array<{ id: string; label: string; href: string; type: string }>;
          setTimeout(() => setRecents(parsed), 0);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Filter tools, insurers, documents based on searchQuery
  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().replace(/\s+/g, "");

    const items: Array<{ id: string; label: string; sub: string; href: string; type: "insurer" | "tool" | "doc" | "message" }> = [];

    // 1. Search insurers
    insurers.forEach((ins) => {
      if (ins.name.toLowerCase().includes(query)) {
        items.push({
          id: ins.id,
          label: ins.name,
          sub: `${ins.category === "life" ? "생명보험" : "손해보험"} | 전산 및 청구 정보`,
          href: `/directory?search=${encodeURIComponent(ins.name)}`,
          type: "insurer",
        });
      }
    });

    // 2. Search work tools
    const staticTools = [
      { id: "insurance-age", label: "보험나이 계산기", sub: "보험나이 및 만 나이 간편 산출", href: "/work-tools?tool=insurance-age" },
      { id: "silbi-calculator", label: "실손보험금 계산기", sub: "급여/비급여 입력 비례보상 계산", href: "/work-tools?tool=silbi-calculator" },
      { id: "disease-code", label: "상병코드(KCD) 검색", sub: "질병분류기호 및 상병명 검색", href: "/work-tools?tool=disease-code" },
      { id: "surgery-code", label: "수술분류표 검색", sub: "수술 종류 및 약관상 종 수술 검색", href: "/work-tools?tool=surgery-code" },
      { id: "disease-search", label: "인수예외질환 검색", sub: "질환별 인수 심사 및 확인 포인트", href: "/work-tools?tool=disease-search" },
      { id: "hidden-insurance", label: "숨은보험금찾기", sub: "내보험찾아줌 연동 및 공식 채널", href: "/work-tools?tool=hidden-insurance" },
    ];

    staticTools.forEach((tool) => {
      if (tool.label.toLowerCase().includes(query) || tool.sub.toLowerCase().includes(query)) {
        items.push({
          id: tool.id,
          label: tool.label,
          sub: `업무 도구 | ${tool.sub}`,
          href: tool.href,
          type: "tool",
        });
      }
    });

    // 3. Search claim documents
    claimDocuments.forEach((doc) => {
      if (doc.title.toLowerCase().includes(query)) {
        items.push({
          id: doc.id,
          label: doc.title,
          sub: `청구서류 | ${doc.insurerName || "공통"} 필요서류`,
          href: `/claim-documents?search=${encodeURIComponent(doc.title)}`,
          type: "doc",
        });
      }
    });

    return items.slice(0, 5); // Limit to top 5 results
  })();

  const trackRecent = (item: { id: string; label: string; href: string; type: string }) => {
    const updated = [item, ...recents.filter((r) => r.id !== item.id)].slice(0, 4);
    setRecents(updated);
    window.localStorage.setItem("plannerdesk.home.recents", JSON.stringify(updated));
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      
      {/* 1. Hero Section with Integrated Search */}
      <section className="relative rounded-2xl bg-[#0F1D2E] p-8 text-white shadow-lg md:p-12">
        <div className="max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#B9975B]/20 px-3 py-1 text-xs font-bold text-[#B9975B]">
            <ShieldCheck className="h-3.5 w-3.5" />
            {uiLabels.brandTagline}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            보험설계사의 실무를<br className="sm:hidden" /> 빠르게 정리하는 업무 포털
          </h1>
          <p className="mt-4 text-sm text-slate-300 sm:text-base">
            보험사 전산, 청구서류, 공시·약관, 고객 안내 문구를 한곳에서 바로 찾고 해결하세요.
          </p>

          {/* Search Input Box */}
          <div className="relative mt-8 max-w-2xl">
            <div className="flex min-h-14 items-center rounded-xl bg-white px-4 text-slate-900 shadow-md focus-within:ring-2 focus-within:ring-[#B9975B]">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="보험사명, 청구서류, 업무 도구, 고객 문구 검색..."
                className="ml-3 w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  지우기
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-[#E3DED4] bg-white p-2 shadow-lg text-slate-900">
                <p className={`px-3 py-1.5 ${sectionEyebrow}`}>검색 결과</p>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((res) => (
                      <Link
                        key={res.type + res.id}
                        href={res.href}
                        onClick={() => trackRecent({ id: res.id, label: res.label, href: res.href, type: res.type })}
                        className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-50 transition"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{res.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{res.sub}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#B9975B]" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-center text-sm text-slate-500">
                    검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. 오늘의 빠른 실행 (App Launcher style) */}
      <section className="mt-10">
        <h2 className={sectionEyebrow}>{uiLabels.homeHub}</h2>
        <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "보험사 바로가기", href: "/directory", desc: "공식 전산 및 고객센터", icon: Building2, color: launcherIconTone.green },
            { label: "청구서류 찾기", href: "/claim-documents", desc: "보험사별 필요서류 PDF", icon: FileText, color: launcherIconTone.navy },
            { label: "업무 도구 열기", href: "/work-tools", desc: "각종 계산기 및 상병 검색", icon: Wrench, color: launcherIconTone.navy },
            { label: "고객 문구 복사", href: "/message-templates", desc: "상황별 카톡 알림 멘트", icon: MessageSquare, color: launcherIconTone.gold },
            { label: "공시·약관 확인", href: "/disclosure-links", desc: "상품공시실 및 통합 약관", icon: BookOpen, color: launcherIconTone.gold },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col rounded-xl border p-5 bg-white transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-[#0F1D2E]">{item.label}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-normal">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. 자주 쓰는 업무 & 즐겨찾기 / 최근 사용 */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        
        {/* 자주 쓰는 업무 */}
        <section className="lg:col-span-2">
          <h2 className={sectionEyebrow}>{uiLabels.quickTools}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { label: "보험나이 계산", href: "/work-tools?tool=insurance-age", desc: "만 나이와 보험나이 즉시 산출" },
              { label: "실손보험금 계산", href: "/work-tools?tool=silbi-calculator", desc: "의료비 비례보상 모의 계산기" },
              { label: "상병코드(KCD) 검색", href: "/work-tools?tool=disease-code", desc: "질병분류기호 및 세부 질환명 찾기" },
              { label: "수술분류표 확인", href: "/work-tools?tool=surgery-code", desc: "생명보험 종 수술 분류 기준 검색" },
              { label: "청구 팩스 주소", href: "/directory", desc: "보험사별 접수처 팩스 및 우편번호" },
              { label: "고객 안내문 템플릿", href: "/message-templates", desc: "카톡용 실무 안내 문구 복사 도구" },
            ].map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                onClick={() => trackRecent({ id: tool.label, label: tool.label, href: tool.href, type: "shortcut" })}
                className="flex items-start justify-between rounded-xl border border-[#E3DED4] bg-white p-4 transition hover:border-[#B9975B] hover:shadow-sm"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#0F1D2E]">{tool.label}</h3>
                  <p className="mt-1 text-xs text-slate-500">{tool.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>

        {/* 개인화 사이드바: 즐겨찾기 및 최근 사용 */}
        <div className="space-y-6">
          <section className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-5">
            <h2 className={`flex items-center gap-1.5 ${sectionEyebrow}`}>
              <Star className="h-3.5 w-3.5 fill-[#B9975B] text-[#B9975B]" />
              즐겨찾기한 업무 도구
            </h2>
            {favorites.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {favorites.map((favId) => {
                  const labelMap: Record<string, string> = {
                    "planner-stats": "통계실",
                    "disease-search": "인수예외질환",
                    "surgery-code": "수술분류표",
                    "disease-code": "상병코드",
                    "silbi-calculator": "실손보험금",
                    "insurance-age": "보험나이",
                    "bmi-calculator": "BMI",
                    "hidden-insurance": "숨은보험금",
                  };
                  return (
                    <Link
                      key={favId}
                      href={`/work-tools?tool=${favId}`}
                      className="inline-flex items-center rounded-lg bg-white border border-[#E3DED4] px-2.5 py-1 text-xs font-bold text-[#0F1D2E] hover:border-[#B9975B]"
                    >
                      {labelMap[favId] || favId}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 break-keep leading-relaxed">
                자주 쓰는 계산기나 상병 검색 도구 옆의 [★]를 눌러 이곳에 고정해 보세요.
              </p>
            )}
          </section>

          {/* 최근 사용한 기록 */}
          <section className="rounded-xl border border-[#E3DED4] bg-white p-5">
            <h2 className={`flex items-center gap-1.5 ${sectionEyebrow}`}>
              <Clock className="h-3.5 w-3.5 text-[#B9975B]" />
              최근 사용한 링크
            </h2>
            {recents.length > 0 ? (
              <div className="mt-3 space-y-2">
                {recents.map((rec) => (
                  <Link
                    key={rec.id + rec.href}
                    href={rec.href}
                    className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 py-1"
                  >
                    <span className="truncate max-w-[200px]">{rec.label}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                      {rec.type === "insurer" ? "보험사" : rec.type === "tool" ? "도구" : "링크"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">최근에 확인한 항목이 없습니다.</p>
            )}
          </section>
        </div>
      </div>

      <details
        className={`group mt-12 ${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}
      >
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={notices.safetyTitle}>{uiLabels.safetyBoundary}</p>
              <p className={`mt-1 ${textStyles.small}`}>
                본 정보는 실무 참고용이며, 최종 기준은 보험사 공식 자료를 확인해야 합니다.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
              펼치기
            </span>
            <span className="hidden shrink-0 text-xs font-bold text-[#B9975B] group-open:inline">
              접기
            </span>
          </div>
        </summary>
        <ul className={`mt-4 border-t border-[#E3DED4] pt-4 space-y-2 break-keep ${textStyles.small}`}>
          <li>
            플래너데스크의 모든 정보는 설계사의 단순 반복 검색을 줄이기 위한 참고용 가이드
            자료입니다.
          </li>
          <li>
            보험사별 서류와 접수 기준은 수시로 변경될 수 있으므로, 최종 제출 전에 해당 보험사
            공식 안내를 재확인해야 합니다.
          </li>
          <li>
            플래너데스크는 개별 보험금 지급 판단, 금액 산정 등의 어떠한 권한도 갖지 않으며
            책임지지 않습니다.
          </li>
        </ul>
      </details>
    </div>
  );
}
