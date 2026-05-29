"use client";

import { useMemo, useState, useEffect } from "react";
import { formatVerifiedDate } from "@/components/content-page";
import { Star, Copy, Send, Check } from "lucide-react";
import type {
  CustomerMessageTemplate,
  MessageSituation,
  MessageTone
} from "@/lib/content";

type SituationFilter = "all" | MessageSituation;
type ToneFilter = "all" | MessageTone;

const situationLabels: Record<MessageSituation, string> = {
  claim_documents_request: "청구서류 요청",
  claim_received_notice: "접수 완료 안내",
  supplement_request: "보완 요청",
  claim_completed_notice: "지급 완료 안내",
  consultation_schedule: "상담 일정 조율",
  coverage_review: "보장점검 안내",
  cancellation_concern: "해지 고민 고객",
  referral_response: "소개 고객 응대",
  long_time_no_contact: "장기 미연락 고객"
};

const toneLabels: Record<MessageTone, string> = {
  professional: "전문적인",
  warm: "친근한",
  concise: "짧은 안내형",
  careful: "정중한",
  formal: "신뢰형",
  calm: "차분한",
  trustworthy: "신뢰형"
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
  "long_time_no_contact"
];

const situationOptions: Array<{ label: string; value: SituationFilter }> = [
  { label: "전체", value: "all" },
  ...situationOrder.map((value) => ({ label: situationLabels[value], value }))
];

const toneOptions: Array<{ label: string; value: ToneFilter }> = [
  { label: "전체", value: "all" },
  { label: "정중한", value: "careful" },
  { label: "차분한", value: "calm" },
  { label: "친근한", value: "warm" },
  { label: "전문적인", value: "professional" },
  { label: "짧은 안내형", value: "concise" },
  { label: "신뢰형", value: "trustworthy" }
];

// Helper to convert text dynamically to different styles
function convertMessageStyle(text: string, style: "original" | "kakao" | "careful" | "professional"): string {
  let processed = text;
  
  if (style === "kakao") {
    // Make concise, add friendly emojis
    processed = "⚡ " + processed
      .replace(/하겠습니다\./g, "할게요 🙂")
      .replace(/드립니다\./g, "드려요 😊")
      .replace(/바랍니다\./g, "부탁드립니다 🙏")
      .replace(/\n\n/g, "\n");
    processed += "\n\n💬 혹시 궁금하신 점이 있으시면 언제든지 편하게 말씀해 주세요! 🍀";
  } else if (style === "careful") {
    // Ultra formal and polite
    processed = processed
      .replace(/안녕하세요/g, "안녕하십니까 고객님, PlannerDesk를 통해 믿고 맡겨주셔서 대단히 감사드립니다.")
      .replace(/부탁드립니다\./g, "바쁘시겠지만 번거로우시더라도 확인 후 정중한 협조를 간곡히 부탁드리는 바입니다.")
      .replace(/안내해 드립니다\./g, "안내해 드리오니 너른 이해와 검토를 희망합니다.");
  } else if (style === "professional") {
    // Authoritative and structured
    processed = `[알림: 담당 금융설계사 안내]\n\n귀하의 보장 계약 관리 및 공식 청구 프로세스를 위해 전해드리는 핵심 안내문입니다.\n\n${processed}`;
    processed += "\n\n※ 본 안내 내용은 관련 법령 및 상품 약관 가이드라인에 기초하였습니다.";
  }
  
  return processed;
}

export function MessageTemplateLibrary({
  templates
}: {
  templates: CustomerMessageTemplate[];
}) {
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState<SituationFilter>("all");
  const [tone, setTone] = useState<ToneFilter>("all");
  
  // Personalization fields
  const [customerName, setCustomerName] = useState("");
  const [plannerName, setPlannerName] = useState("");

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("plannerdesk.messages.favorites");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as string[];
          setTimeout(() => setFavorites(parsed), 0);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(next);
    window.localStorage.setItem("plannerdesk.messages.favorites", JSON.stringify(next));
    showToast(favorites.includes(id) ? "즐겨찾기에서 제거되었습니다." : "자주 쓰는 문구로 등록되었습니다.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return templates.filter((template) => {
      const searchTarget = [
        template.title,
        template.situation,
        situationLabels[template.situationCategory],
        toneLabels[template.tone],
        template.body
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

  // Priority group: Favorite Templates
  const favoriteItems = useMemo(() => {
    return filteredTemplates.filter((t) => favorites.includes(t.id));
  }, [filteredTemplates, favorites]);

  const groups = situationOrder
    .map((situationKey) => ({
      situation: situationKey,
      templates: filteredTemplates.filter(
        (template) => template.situationCategory === situationKey
      )
    }))
    .filter((group) => group.templates.length > 0);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0F1D2E] px-6 py-3.5 text-xs font-bold text-white shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Check className="h-4 w-4 text-[#B9975B]" />
          {toastMessage}
        </div>
      )}

      {/* 개인화 정보 입력 패널 */}
      <section className="rounded-xl border border-[#E3DED4] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B9975B]" />
            <h3 className="text-xs font-bold text-[#0F1D2E]">고객명·설계사명 실시간 치환</h3>
          </div>
          <span className="text-[10px] text-slate-400">입력하면 복사 시 자동 반영</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input 
            className="w-full rounded-lg border border-[#E3DED4] bg-[#F8F7F3] px-3 py-2 text-xs text-[#17202A] outline-none focus:border-[#B9975B] placeholder:text-slate-400"
            placeholder="고객명 (예: 홍길동)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input 
            className="w-full rounded-lg border border-[#E3DED4] bg-[#F8F7F3] px-3 py-2 text-xs text-[#17202A] outline-none focus:border-[#B9975B] placeholder:text-slate-400"
            placeholder="설계사명 (예: 김설계)"
            value={plannerName}
            onChange={(e) => setPlannerName(e.target.value)}
          />
        </div>
      </section>

      {/* 검색 및 필터 패널 */}
      <SearchAndFilters
        onQueryChange={setQuery}
        onSituationChange={setSituation}
        onToneChange={setTone}
        query={query}
        resultCount={filteredTemplates.length}
        situation={situation}
        tone={tone}
      />

      {/* 즐겨찾기 고정 그룹 */}
      {favoriteItems.length > 0 && !query && situation === "all" && (
        <section className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-[#B9975B] fill-[#B9975B]" />
            <h3 className="text-sm font-bold text-[#0F1D2E]">자주 쓰는 안내 문구</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {favoriteItems.map((template) => (
              <TemplateCard 
                key={"fav-" + template.id} 
                template={template} 
                customerName={customerName} 
                plannerName={plannerName}
                isFav={true}
                onToggleFav={toggleFavorite}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* 일반 문구 상황별 그룹 */}
      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.situation} className="space-y-4">
              <h3 className="text-sm font-bold text-[#0F1D2E] border-l-4 border-[#B9975B] pl-2">
                {situationLabels[group.situation]}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
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
        <EmptyState />
      )}
    </div>
  );
}

function SearchAndFilters({
  onQueryChange,
  onSituationChange,
  onToneChange,
  query,
  resultCount,
  situation,
  tone
}: {
  onQueryChange: (value: string) => void;
  onSituationChange: (value: SituationFilter) => void;
  onToneChange: (value: ToneFilter) => void;
  query: string;
  resultCount: number;
  situation: SituationFilter;
  tone: ToneFilter;
}) {
  return (
    <section className="rounded-xl border border-[#E3DED4] bg-white p-4 shadow-sm">
      <input
        className="w-full rounded-lg border border-[#E3DED4] bg-[#F8F7F3] px-3 py-2 text-xs text-[#17202A] outline-none focus:border-[#B9975B] placeholder:text-slate-400"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="문구 검색 (제목, 상황, 내용)..."
        type="search"
        value={query}
      />
      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
        <FilterGroup
          label="상황"
          onChange={(value) => onSituationChange(value as SituationFilter)}
          options={situationOptions}
          value={situation}
        />
        <FilterGroup
          label="톤"
          onChange={(value) => onToneChange(value as ToneFilter)}
          options={toneOptions}
          value={tone}
        />
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        {resultCount}개 문구
      </p>
    </section>
  );
}

function FilterGroup({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className="mt-2 flex max-w-full gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isSelected
                  ? "border-[#0F1D2E] bg-[#0F1D2E] text-white"
                  : "border-[#E3DED4] bg-white text-slate-600 hover:border-[#B9975B] hover:text-[#B9975B]"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TemplateCard({ 
  template, 
  customerName, 
  plannerName,
  isFav,
  onToggleFav,
  onToast
}: { 
  template: CustomerMessageTemplate;
  customerName: string;
  plannerName: string;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const [activeStyle, setActiveStyle] = useState<"original" | "kakao" | "careful" | "professional">("original");

  // OOO, 고객명 등을 치환하는 로직
  const replacedOriginal = useMemo(() => {
    let text = template.body;
    if (customerName) {
      text = text.replace(/O+고객|O+님|\[고객명\]|\{고객명\}|OOO/g, customerName);
    }
    if (plannerName) {
      text = text.replace(/\[설계사명\]|\{설계사명\}|담당자 OOO/g, plannerName);
    }
    return text;
  }, [template.body, customerName, plannerName]);

  const activeBody = useMemo(() => {
    return convertMessageStyle(replacedOriginal, activeStyle);
  }, [replacedOriginal, activeStyle]);

  async function handleCopy(style: typeof activeStyle) {
    const finalVal = convertMessageStyle(replacedOriginal, style);
    await navigator.clipboard.writeText(finalVal);
    
    let styleName = "기본 문구";
    if (style === "kakao") styleName = "짧은 카톡 버전";
    if (style === "careful") styleName = "정중한 버전";
    if (style === "professional") styleName = "전문가 버전";
    
    onToast(`💬 ${styleName}가 복사되었습니다.`);
  }

  return (
    <article className="rounded-2xl border border-[#E3DED4] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-[#E3DED4] bg-[#F7F4EE] px-2 py-0.5 text-[10px] font-bold text-[#16382C]">
              {situationLabels[template.situationCategory]}
            </span>
            <span className="rounded bg-[#F8F7F3] border border-[#E3DED4] px-2 py-0.5 text-[10px] font-bold text-slate-500">
              {toneLabels[template.tone]}
            </span>
          </div>
          <h4 className="mt-3 text-base font-bold text-[#0F1D2E] leading-snug">
            {template.title}
          </h4>
        </div>
        
        {/* Favorite Star Button */}
        <button
          onClick={() => onToggleFav(template.id)}
          className="text-slate-300 hover:text-[#B9975B] transition shrink-0"
          aria-label={`${template.title} 즐겨찾기 토글`}
        >
          <Star className={`h-4.5 w-4.5 ${isFav ? "fill-[#B9975B] text-[#B9975B]" : ""}`} />
        </button>
      </div>

      <p className="mt-2 text-xs text-[#5B6470] leading-relaxed break-keep">
        {template.situation}
      </p>

      {/* 다중 스타일 버전 탭 */}
      <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#E3DED4]">
        {[
          { id: "original", label: "기본 버전" },
          { id: "kakao", label: "짧은 카톡" },
          { id: "careful", label: "정중한 버전" },
          { id: "professional", label: "전문가용" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStyle(tab.id as "original" | "kakao" | "careful" | "professional")}
            className={`shrink-0 rounded-t-lg px-3 py-1.5 text-[11px] font-bold transition-all -mb-px border-b-2 ${
              activeStyle === tab.id
                ? "border-[#B9975B] text-[#B9975B] font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 실시간 적용된 본문 프리뷰 윈도우 */}
      <div className="mt-4 rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4 font-mono text-xs leading-relaxed text-[#17202A] whitespace-pre-wrap break-keep min-h-[120px]">
        {activeBody}
      </div>

      {template.safetyNote && (
        <p className="mt-3 border-l-2 border-amber-300 pl-3 text-[11px] text-amber-700 leading-normal break-keep">
          📌 {template.safetyNote}
        </p>
      )}

      {/* 액션 실행 영역 */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          최근 검수: {formatVerifiedDate(template.lastUpdatedAt)}
        </span>
        
        {/* 복사 버튼 트리거 */}
        <div className="flex gap-2">
          <button
            onClick={() => handleCopy(activeStyle)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0F1D2E] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1C3552] shadow-sm"
          >
            <Copy className="h-3.5 w-3.5" />
            치환본 복사
          </button>
          <button
            onClick={() => handleCopy("kakao")}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-xs font-bold text-[#0F1D2E] transition hover:bg-slate-50"
          >
            <Send className="h-3.5 w-3.5 text-amber-600" />
            카톡용 복사
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-[#E3DED4] bg-white p-10 text-center">
      <p className="break-keep text-sm font-bold text-[#0F1D2E]">
        선택한 상황이나 조건에 맞는 안내 문구가 없습니다.
      </p>
      <p className="mt-2 text-xs text-slate-400">
        통합 검색 창을 초기화하거나 필터 버튼을 클릭해 다시 시도해 주세요.
      </p>
    </section>
  );
}
