"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Star, Copy, ChevronDown } from "lucide-react";
import {
  EmptyState,
  SearchBar,
  formatVerifiedDate,
} from "@/components/content-page";
import { CategoryPillBar } from "@/components/launcher/category-pill-bar";
import { CopyToast } from "@/components/ui/copy-toast";
import type { PublicMessageTemplate } from "@/lib/public/message-templates";
import {
  applySafeCopyPlaceholders,
  matchesEnumFilter,
  matchesPublicMessageCategory,
  publicMessageAudienceLabels,
  publicMessageCategoryFilterTabs,
  publicMessageCategoryLabels,
  publicMessageCategoryOrder,
  publicMessageChannelLabels,
  publicMessageRiskLabels,
  publicMessageToneLabels,
  type PublicMessageAudienceFilter,
  type PublicMessageCategoryFilterId,
  type PublicMessageChannelFilter,
  type PublicMessageRiskFilter,
  type PublicMessageToneFilter,
} from "@/lib/public/message-template-display";
import {
  MessageTemplateAudienceType,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateTone,
} from "@prisma/client";
import { buttons, sectionEyebrow, shadows } from "@/lib/design-system";

const channelFilterOptions: Array<{ id: PublicMessageChannelFilter; label: string }> =
  [
    { id: "all", label: "전체" },
    ...Object.values(MessageTemplateChannel).map((value) => ({
      id: value as PublicMessageChannelFilter,
      label: publicMessageChannelLabels[value],
    })),
  ];

const audienceFilterOptions: Array<{ id: PublicMessageAudienceFilter; label: string }> =
  [
    { id: "all", label: "전체" },
    ...Object.values(MessageTemplateAudienceType).map((value) => ({
      id: value as PublicMessageAudienceFilter,
      label: publicMessageAudienceLabels[value],
    })),
  ];

const toneFilterOptions: Array<{ id: PublicMessageToneFilter; label: string }> = [
  { id: "all", label: "전체" },
  ...Object.values(MessageTemplateTone).map((value) => ({
    id: value as PublicMessageToneFilter,
    label: publicMessageToneLabels[value],
  })),
];

const riskFilterOptions: Array<{ id: PublicMessageRiskFilter; label: string }> = [
  { id: "all", label: "전체" },
  ...Object.values(MessageTemplateRiskLevel).map((value) => ({
    id: value as PublicMessageRiskFilter,
    label: publicMessageRiskLabels[value],
  })),
];

export function MessageTemplateLibrary({
  templates,
}: {
  templates: PublicMessageTemplate[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PublicMessageCategoryFilterId>("all");
  const [channel, setChannel] = useState<PublicMessageChannelFilter>("all");
  const [audience, setAudience] = useState<PublicMessageAudienceFilter>("all");
  const [tone, setTone] = useState<PublicMessageToneFilter>("all");
  const [risk, setRisk] = useState<PublicMessageRiskFilter>("all");
  const [useCaseQuery, setUseCaseQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [plannerName, setPlannerName] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("plannerdesk.messages.favorites");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as string[];
      setTimeout(() => setFavorites(parsed), 0);
    } catch {
      // ignore invalid storage
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(next);
    window.localStorage.setItem(
      "plannerdesk.messages.favorites",
      JSON.stringify(next),
    );
    showToast(
      favorites.includes(id)
        ? "즐겨찾기에서 제거되었습니다."
        : "자주 쓰는 문구로 등록되었습니다.",
    );
  };

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    const normalizedUseCase = useCaseQuery.trim().toLocaleLowerCase("ko-KR");

    return templates.filter((template) => {
      const searchTarget = [
        template.title,
        template.description,
        template.safeCopy,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesCategoryFilter = matchesPublicMessageCategory(
        template.category,
        category,
      );
      const matchesChannel = matchesEnumFilter(template.channel, channel);
      const matchesAudience = matchesEnumFilter(template.audienceType, audience);
      const matchesTone = matchesEnumFilter(template.tone, tone);
      const matchesRisk = matchesEnumFilter(template.riskLevel, risk);
      const matchesUseCase =
        normalizedUseCase.length === 0 ||
        template.useCase.toLocaleLowerCase("ko-KR").includes(normalizedUseCase);

      return (
        matchesQuery &&
        matchesCategoryFilter &&
        matchesChannel &&
        matchesAudience &&
        matchesTone &&
        matchesRisk &&
        matchesUseCase
      );
    });
  }, [audience, category, channel, query, risk, templates, tone, useCaseQuery]);

  const favoriteItems = useMemo(
    () => filteredTemplates.filter((t) => favorites.includes(t.id)),
    [filteredTemplates, favorites],
  );

  const groups = publicMessageCategoryOrder
    .map((categoryKey) => ({
      category: categoryKey,
      templates: filteredTemplates.filter(
        (template) => template.category === categoryKey,
      ),
    }))
    .filter((group) => group.templates.length > 0);

  return (
    <div className="space-y-8">
      <CopyToast message={toastMessage} />

      <section
        className={`rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-5 ${shadows.card}`}
      >
        <h2 className="text-base font-bold text-[#0F1D2E]">
          선택적 이름 치환 (저장되지 않음)
        </h2>
        <p className="mt-1 break-keep text-sm text-[#5B6470]">
          문구에 {"{고객명}"}, {"{담당자명}"} placeholder가 있을 때만 치환됩니다.
          복사·표시되는 본문은 고객 안내용 참고 문구입니다.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-[#17202A]">고객명 (선택)</span>
            <input
              aria-label="고객명"
              className="mt-1.5 min-h-11 w-full rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm text-[#17202A] outline-none placeholder:text-[#5B6470]/60 focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/15"
              placeholder="예: 홍길동"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-[#17202A]">설계사명 (선택)</span>
            <input
              aria-label="설계사명"
              className="mt-1.5 min-h-11 w-full rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm text-[#17202A] outline-none placeholder:text-[#5B6470]/60 focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/15"
              placeholder="예: 김설계"
              value={plannerName}
              onChange={(e) => setPlannerName(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-[#17202A]">문구 검색</p>
          <div className="mt-1.5">
            <SearchBar
              ariaLabel="제목, 설명, 안전 문구 검색"
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="제목, 설명, 안전 문구 검색"
              value={query}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className={sectionEyebrow}>카테고리</p>
          <div className="mt-2">
            <CategoryPillBar
              ariaLabel="카테고리 필터"
              categories={publicMessageCategoryFilterTabs}
              onSelect={(id) => setCategory(id as PublicMessageCategoryFilterId)}
              selectedId={category}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE]">
          <button
            type="button"
            aria-controls="message-advanced-filter"
            aria-expanded={advancedOpen}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <span className="text-sm font-bold text-[#0F1D2E]">고급 필터</span>
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 text-[#B9975B] transition ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          {advancedOpen ? (
            <div
              className="space-y-4 border-t border-[#E3DED4] px-4 pb-4 pt-3"
              id="message-advanced-filter"
            >
              <div>
                <p className="mb-2 text-xs text-[#5B6470]">채널</p>
                <CategoryPillBar
                  ariaLabel="채널"
                  categories={channelFilterOptions}
                  onSelect={(id) => setChannel(id as PublicMessageChannelFilter)}
                  selectedId={channel}
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-[#5B6470]">대상 고객</p>
                <CategoryPillBar
                  ariaLabel="대상 고객"
                  categories={audienceFilterOptions}
                  onSelect={(id) => setAudience(id as PublicMessageAudienceFilter)}
                  selectedId={audience}
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-[#5B6470]">톤</p>
                <CategoryPillBar
                  ariaLabel="톤"
                  categories={toneFilterOptions}
                  onSelect={(id) => setTone(id as PublicMessageToneFilter)}
                  selectedId={tone}
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-[#5B6470]">위험도</p>
                <CategoryPillBar
                  ariaLabel="위험도"
                  categories={riskFilterOptions}
                  onSelect={(id) => setRisk(id as PublicMessageRiskFilter)}
                  selectedId={risk}
                />
              </div>
              <label className="block text-xs text-[#5B6470]">
                사용 상황
                <input
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm text-[#17202A]"
                  value={useCaseQuery}
                  onChange={(e) => setUseCaseQuery(e.target.value)}
                  placeholder="사용 상황 키워드"
                />
              </label>
            </div>
          ) : null}
        </div>

        <p className="text-sm text-[#5B6470]">
          <span className="font-bold text-[#0F1D2E]">
            {filteredTemplates.length}
          </span>
          개 고객 안내 문구
        </p>
      </section>

      {favoriteItems.length > 0 && !query && category === "all" ? (
        <section className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Star
              aria-hidden
              className="h-4 w-4 fill-[#B9975B] text-[#B9975B]"
            />
            <h3 className="text-sm font-bold text-[#0F1D2E]">
              자주 쓰는 안내 문구
            </h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {favoriteItems.map((template) => (
              <TemplateCard
                key={"fav-" + template.id}
                template={template}
                customerName={customerName}
                plannerName={plannerName}
                isFav
                onToggleFav={toggleFavorite}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      ) : null}

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h3 className="text-base font-bold text-[#0F1D2E]">
                {publicMessageCategoryLabels[group.category]}
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {group.templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    customerName={customerName}
                    plannerName={plannerName}
                    isFav={favorites.includes(template.id)}
                    onToggleFav={toggleFavorite}
                    onToast={showToast}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          description="검색어를 줄이거나 필터를 변경해 주세요."
          title="조건에 맞는 안내 문구가 없습니다."
        />
      )}
    </div>
  );
}

function TemplateCard({
  template,
  customerName,
  plannerName,
  isFav,
  onToggleFav,
  onToast,
}: {
  template: PublicMessageTemplate;
  customerName: string;
  plannerName: string;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const previewText = useMemo(
    () =>
      applySafeCopyPlaceholders(template.safeCopy, customerName, plannerName),
    [template.safeCopy, customerName, plannerName],
  );

  async function handleCopySafeCopy() {
    await copyTextToClipboard(previewText);
    onToast("고객 안내 문구가 복사되었습니다.");
  }

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-[#E3DED4] bg-white p-5 ${shadows.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-2 py-0.5 text-[10px] font-bold text-[#16382C]">
              {publicMessageCategoryLabels[template.category]}
            </span>
            <span className="rounded-md border border-[#E3DED4] bg-[#F8F7F3] px-2 py-0.5 text-[10px] font-bold text-[#5B6470]">
              {publicMessageChannelLabels[template.channel]}
            </span>
            <span className="rounded-md border border-[#E3DED4] bg-[#F8F7F3] px-2 py-0.5 text-[10px] font-bold text-[#5B6470]">
              {publicMessageToneLabels[template.tone]}
            </span>
            {template.riskLevel === MessageTemplateRiskLevel.high ? (
              <span className="rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-2 py-0.5 text-[10px] font-bold text-[#8b2e2e]">
                위험도 높음
              </span>
            ) : null}
          </div>
          <h4 className="mt-2 break-keep text-lg font-bold leading-snug text-[#0F1D2E]">
            {template.title}
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onToggleFav(template.id)}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[#E3DED4] transition hover:text-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
          aria-label={
            isFav
              ? `${template.title} 즐겨찾기 해제`
              : `${template.title} 즐겨찾기 추가`
          }
          aria-pressed={isFav}
        >
          <Star
            className={`h-5 w-5 ${isFav ? "fill-[#B9975B] text-[#B9975B]" : ""}`}
          />
        </button>
      </div>

      <p className="mt-2 break-keep text-xs leading-relaxed text-[#5B6470]">
        {template.useCase}
      </p>
      <p className="mt-1 text-xs text-[#5B6470]/90">
        대상: {publicMessageAudienceLabels[template.audienceType]}
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4">
        <p className="text-[10px] font-bold text-[#B9975B]">고객 안내 문구</p>
        <p className="mt-2 line-clamp-6 whitespace-pre-wrap break-keep text-sm leading-relaxed text-[#17202A]">
          {previewText}
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleCopySafeCopy}
          className={`${buttons.base} ${buttons.primary} w-full gap-2`}
          aria-label={`${template.title} 안전 문구 복사`}
        >
          <Copy aria-hidden className="h-4 w-4 shrink-0" />
          안전 문구 복사
        </button>
      </div>

      {(template.publishedAt ?? template.updatedAt) ? (
        <p className="mt-4 border-t border-[#E3DED4] pt-3 text-[10px] text-[#5B6470]">
          게시일 {formatVerifiedDate(template.publishedAt ?? template.updatedAt)}
        </p>
      ) : null}
    </article>
  );
}

async function copyTextToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fall through
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
  } catch {
    // ignore
  } finally {
    document.body.removeChild(textarea);
  }
}
