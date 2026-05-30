/** Shown when admin CRUD/bulk requires a Prisma model not yet in schema (BULK-03 scope). */
export const STATIC_CONTENT_DB_REQUIRED_MESSAGE =
  "DisclosureLink / MessageTemplate DB 모델이 아직 없습니다. schema·migration PR 이후 저장·일괄 변경이 가능합니다.";

export const STATIC_CONTENT_ADMIN_NOTICE =
  "현재 공개 화면은 lib/content 정적 데이터를 사용합니다. 관리자 화면에서는 조회·검수 확인만 가능하며, 저장·일괄 변경은 DB 도입 PR 이후 연결됩니다.";
