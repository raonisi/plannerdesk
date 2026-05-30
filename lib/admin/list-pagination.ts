export const ADMIN_LIST_PAGE_SIZE = 20;

export function parseAdminListPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function adminListPageCount(total: number, pageSize = ADMIN_LIST_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
