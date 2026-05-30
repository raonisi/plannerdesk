"use server";

import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import { bulkRunError } from "@/lib/admin/bulk-run";
import { STATIC_CONTENT_DB_REQUIRED_MESSAGE } from "@/lib/admin/static-content-guard";
import { handleAdminUnauthorized, redirectWithError } from "@/lib/admin/actions";
import { requireMessageTemplateContentManager } from "./access";

const ADMIN_PATH = "/admin/message-templates";

async function guardContentManager(): Promise<void> {
  try {
    await requireMessageTemplateContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }
}

export async function executeMessageTemplateBulkAction(
  actionId: AdminBulkActionId,
  ids: unknown,
): Promise<BulkRunResponse> {
  void actionId;
  void ids;
  await guardContentManager();
  return bulkRunError(STATIC_CONTENT_DB_REQUIRED_MESSAGE);
}

export async function createMessageTemplateRedirect(): Promise<never> {
  await guardContentManager();
  redirectWithError(
    `${ADMIN_PATH}/new`,
    STATIC_CONTENT_DB_REQUIRED_MESSAGE,
  );
}

export async function updateMessageTemplateRedirect(): Promise<never> {
  await guardContentManager();
  redirectWithError(ADMIN_PATH, STATIC_CONTENT_DB_REQUIRED_MESSAGE);
}
