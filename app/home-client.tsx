"use client";

import { useEffect, useState } from "react";
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
  Clock,
} from "lucide-react";
import { EmptyStatePanel } from "@/components/launcher/empty-state-panel";
import { HomeMiniToolCard } from "@/components/launcher/home-mini-tool-card";
import { HomeQuickLaunchCard } from "@/components/launcher/home-quick-launch-card";
import { SectionHeader } from "@/components/launcher/section-header";
import type { PublicInsurer } from "@/lib/public/insurers";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import {
  launcherIconTone,
  notices,
  sectionEyebrow,
  shadows,
  spacing,
  surfaces,
  textStyles,
} from "@/lib/design-system";
import { uiLabels } from "@/lib/ui-labels";

interface HomeClientProps {
  insurers: PublicInsurer[];
  claimDocuments: PublicClaimDocument[];
}

const QUICK_KEYWORDS = [
  { label: "삼성화재", href: "/directory?search=삼성화재" },
  { label: "현대해상", href: "/directory?search=현대해상" },
  { label: "실손 청구", href: "/claim-documents?search=실손" },
  { label: "보험나이", href: "/work-tools?tool=insurance-age" },
  { label: "상병코드", href: "/work-tools?tool=disease-code" },
  { label: "고객 안내문", href: "/message-templates" },
] as const;

const FAVORITE_LABELS: Record<string, string> = {
  "planner-stats": "통계실",
  "disease-search": "인수예외질환",
  "surgery-code": "수술분류표",
  "disease-code": "상병코드",
  "silbi-calculator": "실손보험금",
  "insurance-age": "보험나이",
  "bmi-calculator": "BMI",
  "hidden-insurance": "숨은보험금",
};

export function HomeClient({ insurers, claimDocuments }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<
    Array<{ id: string; label: string; href: string; type: string }>
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedFavs = window.localStorage.getItem("plannerdesk.workTools.favorites");
    if (savedFavs) {
      try {
        const parsed = JSON.parse(savedFavs) as string[];
        setTimeout(() => setFavorites(parsed), 0);
      } catch (e) {
        console.error(e);
      }
    }
    const savedRecents = window.localStorage.getItem("plannerdesk.home.recents");
    if (savedRecents) {
      try {
        const parsed = JSON.parse(savedRecents) as Array<{
          id: string;
          label: string;
          href: string;
          type: string;
        }>;
        setTimeout(() => setRecents(parsed), 0);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().replace(/\s+/g, "");

    const items: Array<{
      id: string;
      label: string;
      sub: string;
      href: string;
      type: "insurer" | "tool" | "doc" | "message";
    }> = [];

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

    const staticTools = [
      {
        id: "insurance-age",
        label: "보험나이",
        sub: "만 나이·보험나이 산출",
        href: "/work-tools?tool=insurance-age",
      },
      {
        id: "silbi-calculator",
        label: "실손보험금",
        sub: "비례보상 참고 계산",
        href: "/work-tools?tool=silbi-calculator",
      },
      {
        id: "disease-code",
        label: "상병코드",
        sub: "KCD 질병분류 검색",
        href: "/work-tools?tool=disease-code",
      },
      {
        id: "surgery-code",
        label: "수술분류표",
        sub: "종 수술 분류 검색",
        href: "/work-tools?tool=surgery-code",
      },
      {
        id: "hidden-insurance",
        label: "숨은보험금찾기",
        sub: "내보험찾아줌 공식 채널",
        href: "/work-tools?tool=hidden-insurance",
      },
    ];

    staticTools.forEach((tool) => {
      if (
        tool.label.toLowerCase().includes(query) ||
        tool.sub.toLowerCase().includes(query)
      ) {
        items.push({
          id: tool.id,
          label: tool.label,
          sub: `업무 도구 | ${tool.sub}`,
          href: tool.href,
          type: "tool",
        });
      }
    });

    claimDocuments.forEach((doc) => {
      if (doc.title.toLowerCase().includes(query)) {
        items.push({
          id: doc.id,
          label: doc.title,
          sub: `청구서류 | ${doc.insurerName || "공통"}`,
          href: `/claim-documents?search=${encodeURIComponent(doc.title)}`,
          type: "doc",
        });
      }
    });

    if (
      "고객안내문".includes(query) ||
      "고객 문구".replace(/\s/g, "").includes(query)
    ) {
      items.push({
        id: "message-templates",
        label: "고객 안내문",
        sub: "고객 문구 | 상황별 템플릿",
        href: "/message-templates",
        type: "message",
      });
    }

    return items.slice(0, 6);
  })();

  const trackRecent = (item: {
    id: string;
    label: string;
    href: string;
    type: string;
  }) => {
    const updated = [item, ...recents.filter((r) => r.id !== item.id)].slice(0, 4);
    setRecents(updated);
    window.localStorage.setItem("plannerdesk.home.recents", JSON.stringify(updated));
  };

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-5 py-8 pb-14 sm:px-8 lg:px-10">
      {/* Hero */}
      <section
        className={`relative overflow-hidden rounded-2xl border border-[#E3DED4] bg-gradient-to-br from-[#F8F7F3] via-white to-[#F7F4EE] p-6 shadow-sm sm:p-10 md:p-12`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#16382C]/5" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#B9975B]/10" />
        <div className="relative max-w-3xl">
          <p className={sectionEyebrow}>보험설계사용 실무 데스크</p>
          <h1 className="mt-3 break-keep text-3xl font-extrabold tracking-tight text-[#0F1D2E] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            보험설계사의 하루를 빠르게 여는 실무 커맨드센터
          </h1>
          <p className={`mt-4 max-w-2xl break-keep ${textStyles.body}`}>
            보험사 전산, 청구서류, 업무 도구, 고객 문구, 공시·약관을 한 화면에서
            빠르게 찾고 실행하세요.
          </p>

          <div className="relative z-10 mt-8 max-w-2xl">
            <label className="sr-only" htmlFor="home-unified-search">
              통합 검색
            </label>
            <div className="flex min-h-14 items-center rounded-xl border border-[#E3DED4] bg-white px-4 shadow-md ring-1 ring-[#E3DED4]/80 focus-within:ring-2 focus-within:ring-[#B9975B]/50">
              <Search aria-hidden className="h-5 w-5 shrink-0 text-[#5B6470]" />
              <input
                id="home-unified-search"
                type="search"
                placeholder="보험사명, 청구서류, 업무 도구, 고객 문구 검색"
                className="ml-3 min-w-0 flex-1 bg-transparent text-base font-medium text-[#17202A] outline-none placeholder:text-[#5B6470]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[#5B6470] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                >
                  지우기
                </button>
              ) : null}
            </div>

            {showResults && searchQuery.trim() ? (
              <div
                className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-[#E3DED4] bg-white p-2 shadow-lg"
                role="listbox"
                aria-label="검색 결과"
              >
                <p className={`px-3 py-1.5 ${sectionEyebrow}`}>검색 결과</p>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#E3DED4]/60">
                    {searchResults.map((res) => (
                      <Link
                        key={res.type + res.id}
                        href={res.href}
                        onClick={() =>
                          trackRecent({
                            id: res.id,
                            label: res.label,
                            href: res.href,
                            type: res.type,
                          })
                        }
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition hover:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                        role="option"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#0F1D2E]">
                            {res.label}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#5B6470]">
                            {res.sub}
                          </p>
                        </div>
                        <ArrowRight
                          aria-hidden
                          className="h-4 w-4 shrink-0 text-[#B9975B]"
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-center text-sm text-[#5B6470]">
                    검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2">
            <span className="sr-only">빠른 검색 키워드</span>
            {QUICK_KEYWORDS.map((kw) => (
              <Link
                key={kw.label}
                href={kw.href}
                className="inline-flex min-h-9 items-center rounded-full border border-[#E3DED4] bg-white px-3.5 text-xs font-bold text-[#5B6470] shadow-sm transition hover:border-[#B9975B] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
              >
                {kw.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 빠른 실행 */}
      <section className="mt-12">
        <SectionHeader eyebrow={uiLabels.homeHub} title="오늘의 빠른 실행" />
        <div className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-5">
          <HomeQuickLaunchCard
            actionLabel="보험사 찾기"
            description="공식 전산·고객센터·팩스"
            emphasis="primary"
            href="/directory"
            icon={Building2}
            iconToneClass={launcherIconTone.green}
            title="보험사 바로가기"
          />
          <HomeQuickLaunchCard
            actionLabel="서류 찾기"
            description="보험사별 필요서류 PDF"
            href="/claim-documents"
            icon={FileText}
            iconToneClass={launcherIconTone.navy}
            title="청구서류 찾기"
          />
          <HomeQuickLaunchCard
            actionLabel="도구 열기"
            description="계산기·상병·수술 검색"
            href="/work-tools"
            icon={Wrench}
            iconToneClass={launcherIconTone.navy}
            title="업무 도구 열기"
          />
          <HomeQuickLaunchCard
            actionLabel="문구 복사"
            description="상황별 카톡 안내 멘트"
            href="/message-templates"
            icon={MessageSquare}
            iconToneClass={launcherIconTone.gold}
            title="고객 문구 복사"
          />
          <HomeQuickLaunchCard
            actionLabel="공식자료 확인"
            description="상품공시·통합 약관"
            href="/disclosure-links"
            icon={BookOpen}
            iconToneClass={launcherIconTone.gold}
            title="공시·약관 확인"
          />
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader
            eyebrow={uiLabels.quickTools}
            title="자주 쓰는 업무"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <HomeMiniToolCard
              description="만 나이·보험나이 즉시 산출"
              href="/work-tools?tool=insurance-age"
              onNavigate={() =>
                trackRecent({
                  id: "insurance-age",
                  label: "보험나이",
                  href: "/work-tools?tool=insurance-age",
                  type: "tool",
                })
              }
              title="보험나이"
            />
            <HomeMiniToolCard
              description="의료비 비례보상 참고 계산"
              href="/work-tools?tool=silbi-calculator"
              onNavigate={() =>
                trackRecent({
                  id: "silbi-calculator",
                  label: "실손보험금",
                  href: "/work-tools?tool=silbi-calculator",
                  type: "tool",
                })
              }
              title="실손보험금"
            />
            <HomeMiniToolCard
              description="KCD 질병분류기호 검색"
              href="/work-tools?tool=disease-code"
              onNavigate={() =>
                trackRecent({
                  id: "disease-code",
                  label: "상병코드",
                  href: "/work-tools?tool=disease-code",
                  type: "tool",
                })
              }
              title="상병코드"
            />
            <HomeMiniToolCard
              description="종 수술 분류 기준 검색"
              href="/work-tools?tool=surgery-code"
              onNavigate={() =>
                trackRecent({
                  id: "surgery-code",
                  label: "수술분류표",
                  href: "/work-tools?tool=surgery-code",
                  type: "tool",
                })
              }
              title="수술분류표"
            />
            <HomeMiniToolCard
              description="보험사별 팩스·우편 접수처"
              href="/directory"
              onNavigate={() =>
                trackRecent({
                  id: "directory-fax",
                  label: "청구 팩스",
                  href: "/directory",
                  type: "shortcut",
                })
              }
              title="청구 팩스"
            />
            <HomeMiniToolCard
              description="카톡용 안내 문구 복사"
              href="/message-templates"
              onNavigate={() =>
                trackRecent({
                  id: "message-templates",
                  label: "고객 안내문",
                  href: "/message-templates",
                  type: "shortcut",
                })
              }
              title="고객 안내문"
            />
          </div>
        </section>

        <div className="space-y-6">
          <section
            className={`rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-5 ${shadows.card}`}
          >
            <h2 className={`flex items-center gap-1.5 ${sectionEyebrow}`}>
              <Star className="h-3.5 w-3.5 fill-[#B9975B] text-[#B9975B]" />
              즐겨찾기
            </h2>
            {favorites.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {favorites.map((favId) => (
                  <Link
                    key={favId}
                    href={`/work-tools?tool=${favId}`}
                    className="inline-flex min-h-9 items-center rounded-lg border border-[#E3DED4] bg-white px-3 text-xs font-bold text-[#0F1D2E] transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                  >
                    {FAVORITE_LABELS[favId] || favId}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <EmptyStatePanel
                  actions={[
                    { href: "/directory", label: "보험사 둘러보기", variant: "outline" },
                    { href: "/work-tools", label: "업무 도구 보기", variant: "primary" },
                  ]}
                  description="즐겨찾기한 항목은 이곳에서 빠르게 다시 열 수 있습니다."
                  title="자주 쓰는 보험사와 도구를 저장해 보세요"
                />
              </div>
            )}
          </section>

          <section className={`rounded-xl border border-[#E3DED4] bg-white p-5 ${shadows.card}`}>
            <h2 className={`flex items-center gap-1.5 ${sectionEyebrow}`}>
              <Clock className="h-3.5 w-3.5 text-[#B9975B]" />
              최근 사용
            </h2>
            {recents.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recents.map((rec) => (
                  <li key={rec.id + rec.href}>
                    <Link
                      href={rec.href}
                      className="flex min-h-9 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-[#5B6470] transition hover:bg-[#F7F4EE] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                    >
                      <span className="truncate font-medium">{rec.label}</span>
                      <span className="shrink-0 rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B6470]">
                        {rec.type === "insurer"
                          ? "보험사"
                          : rec.type === "tool"
                            ? "도구"
                            : "링크"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3">
                <EmptyStatePanel
                  description="보험사, 청구서류, 업무 도구를 열면 이곳에 최근 항목이 표시됩니다."
                  title="아직 최근 사용 기록이 없습니다"
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <details
        className={`group mt-12 ${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}
      >
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={notices.safetyTitle}>{uiLabels.safetyBoundary}</p>
              <p className={`mt-1 ${textStyles.small}`}>
                본 자료는 설계사 실무 참고용입니다. 최종 기준은 보험사 공식 안내와
                약관을 확인해 주세요.
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
        <ul
          className={`mt-4 border-t border-[#E3DED4] pt-4 space-y-2 break-keep ${textStyles.small}`}
        >
          <li>
            플래너데스크 정보는 반복 검색을 줄이기 위한 참고용 가이드입니다.
          </li>
          <li>
            보험사별 서류·접수 기준은 수시로 변경될 수 있으므로 제출 전 공식 안내를
            재확인해 주세요.
          </li>
          <li>
            보험금 지급 판단·금액 산정·손해사정 업무는 제공하지 않습니다.
          </li>
        </ul>
      </details>
    </div>
  );
}
