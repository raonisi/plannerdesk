"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Star, Copy } from "lucide-react";
import {
  EmptyState,
  SearchBar,
  formatVerifiedDate,
} from "@/components/content-page";
import { CategoryPillBar } from "@/components/launcher/category-pill-bar";
import { CopyToast } from "@/components/ui/copy-toast";
import type {
  CustomerMessageTemplate,
  MessageSituation,
  MessageTone,
} from "@/lib/content";
import { buttons, sectionEyebrow, shadows } from "@/lib/design-system";

type SituationFilter = "all" | MessageSituation;
type ToneFilter = "all" | MessageTone;
type CopyStyle = "original" | "kakao" | "careful" | "professional";

const situationLabels: Record<MessageSituation, string> = {
  claim_documents_request: "청구서류 요청",
  claim_received_notice: "접수 완료 안내",
  supplement_request: "보완 요청",
  claim_completed_notice: "지급 완료 안내",
  consultation_schedule: "상담 일정 조율",
  coverage_review: "보장점검 안내",
  cancellation_concern: "해지 고민 고객",
  referral_response: "소개 고객 응대",
  long_time_no_contact: "장기 미연락 고객",
};

const toneLabels: Record<MessageTone, string> = {
  professional: "전문적인",
  warm: "친근한",
  concise: "짧은 안내형",
  careful: "정중한",
  formal: "신뢰형",
  calm: "차분한",
  trustworthy: "신뢰형",
};

const situationOrder: MessageSituation[] = [
  "claim_documents_request",
  "claim_received_notice",
  "supplement_request",
  "claim_completed_notice",
  "consultation_schedule",
  "coverage_review",
  "cancellation_concern",
  "referral_response",
  "long_time_no_contact",
];

const situationOptions = [
  { id: "all", label: "전체" },
  ...situationOrder.map((value) => ({
    id: value,
    label: situationLabels[value],
  })),
];

const toneOptions: Array<{ id: ToneFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "careful", label: "정중한" },
  { id: "calm", label: "차분한" },
  { id: "warm", label: "친근한" },
  { id: "professional", label: "전문적인" },
  { id: "concise", label: "짧은 안내형" },
  { id: "trustworthy", label: "신뢰형" },
];

const copyToastMessages: Record<CopyStyle, string> = {
  original: "문구가 복사되었습니다.",
  kakao: "짧은 카톡 문구가 복사되었습니다.",
  careful: "정중한 버전이 복사되었습니다.",
  professional: "전문가용 문구가 복사되었습니다.",
};

function convertMessageStyle(
  text: string,
  style: CopyStyle
): string {
  let processed = text;

  if (style === "kakao") {
    processed =
      "⚡ " +
      processed
        .replace(/하겠습니다\./g, "할게요 🙂")
        .replace(/드립니다\./g, "드려요 😊")
        .replace(/바랍니다\./g, "부탁드립니다 🙏")
        .replace(/\n\n/g, "\n");
    processed +=
      "\n\n💬 혹시 궁금하신 점이 있으시면 언제든지 편하게 말씀해 주세요! 🍀";
  } else if (style === "careful") {
    processed = processed
      .replace(
        /안녕하세요/g,
        "안녕하십니까 고객님, 항상 믿고 맡겨주셔서 대단히 감사드립니다."
      )
      .replace(
        /부탁드립니다\./g,
        "바쁘시겠지만 번거로우시더라도 확인 후 정중한 협조를 간곡히 부탁드리는 바입니다."
      )
      .replace(
        /안내해 드립니다\./g,
        "안내해 드리오니 너른 이해와 검토를 희망합니다."
      );
  } else if (style === "professional") {
    processed = `[알림: 담당 금융설계사 안내]\n\n귀하의 보장 계약 관리 및 공식 청구 프로세스를 위해 전해드리는 핵심 안내문입니다.\n\n${processed}`;
    processed +=
      "\n\n※ 본 안내는 실무 참고용이며, 최종 기준은 보험사 공식 안내와 상품 약관을 확인해 주세요.";
  }

  return processed;
}

function applyNameReplacement(
  text: string,
  customerName: string,
  plannerName: string
): string {
  let result = text;
  if (customerName) {
    result = result.replace(
      /O+고객|O+님|\[고객명\]|\{고객명\}|OOO/g,
      customerName
    );
  }
  if (plannerName) {
    result = result.replace(
      /\[설계사명\]|\{설계사명\}|담당자 OOO/g,
      plannerName
    );
  }
  return result;
}

export function MessageTemplateLibrary({
  templates,
}: {
  templates: CustomerMessageTemplate[];
}) {
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState<SituationFilter>("all");
  const [tone, setTone] = useState<ToneFilter>("all");
  const [customerName, setCustomerName] = useState("");
  const [plannerName, setPlannerName] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("plannerdesk.messages.favorites");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as string[];
      setTimeout(() => setFavorites(parsed), 0);
    } catch (e) {
      console.error(e);
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
      JSON.stringify(next)
    );
    showToast(
      favorites.includes(id)
        ? "즐겨찾기에서 제거되었습니다."
        : "자주 쓰는 문구로 등록되었습니다."
    );
  };

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return templates.filter((template) => {
      const searchTarget = [
        template.title,
        template.situation,
        situationLabels[template.situationCategory],
        toneLabels[template.tone],
        template.body,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesSituation =
        situation === "all" || template.situationCategory === situation;
      const matchesTone = tone === "all" || template.tone === tone;

      return matchesQuery && matchesSituation && matchesTone;
    });
  }, [query, situation, templates, tone]);

  const favoriteItems = useMemo(
    () => filteredTemplates.filter((t) => favorites.includes(t.id)),
    [filteredTemplates, favorites]
  );

  const groups = situationOrder
    .map((situationKey) => ({
      situation: situationKey,
      templates: filteredTemplates.filter(
        (template) => template.situationCategory === situationKey
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
          고객명·설계사명 입력
        </h2>
        <p className="mt-1 text-sm text-[#5B6470] break-keep">
          입력한 이름은 문구 치환에만 사용됩니다. 저장되지 않습니다.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-[#17202A]">고객명</span>
            <input
              aria-label="고객명"
              className="mt-1.5 w-full min-h-11 rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm text-[#17202A] outline-none focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/15 placeholder:text-[#5B6470]/60"
              placeholder="예: 홍길동"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-[#17202A]">설계사명</span>
            <input
              aria-label="설계사명"
              className="mt-1.5 w-full min-h-11 rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm text-[#17202A] outline-none focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/15 placeholder:text-[#5B6470]/60"
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
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="청구, 보완 요청, 해지 고민, 상담 일정 검색"
              value={query}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className={sectionEyebrow}>상황</p>
          <div className="mt-2">
            <CategoryPillBar
              categories={situationOptions}
              onSelect={(id) => setSituation(id as SituationFilter)}
              selectedId={situation}
            />
          </div>
        </div>
        <div>
          <p className={sectionEyebrow}>톤</p>
          <div className="mt-2">
            <CategoryPillBar
              categories={toneOptions}
              onSelect={(id) => setTone(id as ToneFilter)}
              selectedId={tone}
            />
          </div>
        </div>
        <p className="text-sm text-[#5B6470]">
          <span className="font-bold text-[#0F1D2E]">
            {filteredTemplates.length}
          </span>
          개 문구
        </p>
      </section>

      {favoriteItems.length > 0 && !query && situation === "all" && (
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
      )}

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.situation}>
              <h3 className="text-base font-bold text-[#0F1D2E]">
                {situationLabels[group.situation]}
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
          description="검색어를 줄이거나 상황·톤 필터를 변경해 주세요."
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
  template: CustomerMessageTemplate;
  customerName: string;
  plannerName: string;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const replacedOriginal = useMemo(
    () => applyNameReplacement(template.body, customerName, plannerName),
    [template.body, customerName, plannerName]
  );

  async function handleCopy(style: CopyStyle) {
    const finalVal = convertMessageStyle(replacedOriginal, style);
    await navigator.clipboard.writeText(finalVal);
    onToast(copyToastMessages[style]);
  }

  const copyActions: Array<{ style: CopyStyle; label: string; primary?: boolean }> =
    [
      { style: "original", label: "기본 복사", primary: true },
      { style: "kakao", label: "짧은 카톡 복사" },
      { style: "careful", label: "정중한 버전 복사" },
      { style: "professional", label: "전문가용 복사" },
    ];

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-[#E3DED4] bg-white p-5 ${shadows.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-2 py-0.5 text-[10px] font-bold text-[#16382C]">
              {situationLabels[template.situationCategory]}
            </span>
            <span className="rounded-md border border-[#E3DED4] bg-[#F8F7F3] px-2 py-0.5 text-[10px] font-bold text-[#5B6470]">
              {toneLabels[template.tone]}
            </span>
          </div>
          <h4 className="mt-2 break-keep text-lg font-bold leading-snug text-[#0F1D2E]">
            {template.title}
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onToggleFav(template.id)}
          className="shrink-0 rounded-lg p-1.5 text-[#E3DED4] transition hover:text-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
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

      <p className="mt-2 text-xs leading-relaxed text-[#5B6470] break-keep">
        {template.situation}
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4">
        <p className="text-[10px] font-bold text-[#B9975B]">문구 미리보기</p>
        <p className="mt-2 line-clamp-6 whitespace-pre-wrap break-keep text-sm leading-relaxed text-[#17202A]">
          {replacedOriginal}
        </p>
      </div>

      {template.safetyNote ? (
        <p className="mt-3 text-[11px] leading-relaxed text-[#5B6470]/90 break-keep border-l-2 border-[#E3DED4] pl-3">
          {template.safetyNote}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {copyActions.map((action) => (
          <button
            key={action.style}
            type="button"
            onClick={() => handleCopy(action.style)}
            className={`${buttons.base} gap-2 px-3 text-xs sm:text-sm ${
              action.primary ? buttons.primary : buttons.outline
            }`}
            aria-label={`${template.title} ${action.label}`}
          >
            <Copy aria-hidden className="h-4 w-4 shrink-0" />
            {action.label}
          </button>
        ))}
      </div>

      <p className="mt-4 border-t border-[#E3DED4] pt-3 text-[10px] text-[#5B6470]">
        최근 확인일 {formatVerifiedDate(template.lastUpdatedAt)}
      </p>
    </article>
  );
}
