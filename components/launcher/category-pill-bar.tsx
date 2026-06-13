"use client";

export function CategoryPillBar({
  categories,
  selectedId,
  onSelect,
  ariaLabel = "필터",
}: {
  categories: ReadonlyArray<{ id: string; label: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label={ariaLabel}
    >
      {categories.map((cat) => {
        const selected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(cat.id)}
            className={`min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
              selected
                ? "border-[#0F1D2E] bg-[#0F1D2E] text-white shadow-sm"
                : "border-[#E3DED4] bg-white text-[#5B6470] hover:border-[#B9975B] hover:bg-[#F7F4EE] hover:text-[#0F1D2E]"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
