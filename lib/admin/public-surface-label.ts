/** Consolidated public-surface label for admin list rows (PR111). */

export type AdminPublicSurfaceTone = "green" | "gold" | "gray";

export function getAdminPublicSurfaceLabel(options: {
  isPublished: boolean;
  publiclyVisible: boolean;
}): { label: string; tone: AdminPublicSurfaceTone; title?: string } {
  if (options.publiclyVisible) {
    return { label: "공개 중", tone: "green" };
  }

  if (options.isPublished) {
    return {
      label: "게시 중·공개 전 확인 필요",
      tone: "gold",
      title: "검수 상태 또는 공개 조건을 확인한 뒤 공개 화면에 표시됩니다.",
    };
  }

  return { label: "비공개", tone: "gray" };
}
