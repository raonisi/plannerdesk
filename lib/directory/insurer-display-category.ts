import type { PublicInsurer } from "@/lib/public/insurers";

export type InsurerDisplayCategory = "life" | "non_life" | "mutual" | "digital";

/** Public directory tabs and sort — derived category beyond Prisma life/non_life. */
export function getInsurerDisplayCategory(
  insurer: PublicInsurer,
): InsurerDisplayCategory {
  if (
    insurer.id.endsWith("-mutual") ||
    insurer.name.includes("공제") ||
    insurer.name.includes("우체국")
  ) {
    return "mutual";
  }
  if (
    insurer.id.endsWith("-digital") ||
    insurer.name.includes("디지털") ||
    insurer.name.includes("캐롯")
  ) {
    return "digital";
  }
  return insurer.category;
}

/** 생보 → 손보 → 디지털손보 → 공제 */
export const INSURER_CATEGORY_SORT_ORDER: Record<InsurerDisplayCategory, number> =
  {
    life: 0,
    non_life: 1,
    digital: 2,
    mutual: 3,
  };
