import {
  getInsurerDisplayCategory,
  INSURER_CATEGORY_SORT_ORDER,
} from "@/lib/directory/insurer-display-category";
import type { PublicInsurer } from "@/lib/public/insurers";

export type InsurerSortMode =
  | "featured"
  | "name"
  | "category"
  | "verified"
  | "favorites"
  | "system";

export const INSURER_SORT_OPTIONS: ReadonlyArray<{
  value: InsurerSortMode;
  label: string;
  plannerOnly?: boolean;
}> = [
  { value: "featured", label: "추천 순" },
  { value: "name", label: "가나다순" },
  { value: "category", label: "업종순" },
  { value: "verified", label: "확인일 최신순" },
  { value: "system", label: "전산 링크 우선" },
  { value: "favorites", label: "즐겨찾기 우선", plannerOnly: true },
];

export function sortPublicInsurers(
  insurers: PublicInsurer[],
  mode: InsurerSortMode,
  options?: { isFavorite?: (id: string) => boolean },
): PublicInsurer[] {
  if (mode === "featured") {
    return insurers;
  }

  const sorted = [...insurers];

  switch (mode) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
    case "category":
      return sorted.sort((a, b) => {
        const categoryDelta =
          INSURER_CATEGORY_SORT_ORDER[getInsurerDisplayCategory(a)] -
          INSURER_CATEGORY_SORT_ORDER[getInsurerDisplayCategory(b)];
        if (categoryDelta !== 0) return categoryDelta;
        return a.name.localeCompare(b.name, "ko-KR");
      });
    case "verified":
      return sorted.sort((a, b) => {
        const aDate = a.lastVerifiedAt ?? "";
        const bDate = b.lastVerifiedAt ?? "";
        if (aDate === bDate) {
          return a.name.localeCompare(b.name, "ko-KR");
        }
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.localeCompare(aDate);
      });
    case "favorites": {
      const isFavorite = options?.isFavorite;
      if (!isFavorite) return sorted;
      return sorted.sort((a, b) => {
        const aFav = isFavorite(a.id) ? 0 : 1;
        const bFav = isFavorite(b.id) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.name.localeCompare(b.name, "ko-KR");
      });
    }
    case "system":
      return sorted.sort((a, b) => {
        const aHas = Boolean(a.systemUrl?.trim()) ? 0 : 1;
        const bHas = Boolean(b.systemUrl?.trim()) ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas;
        return a.name.localeCompare(b.name, "ko-KR");
      });
    default:
      return sorted;
  }
}
