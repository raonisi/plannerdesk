"use server";

import { redirect } from "next/navigation";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import { bulkRunError } from "@/lib/admin/bulk-run";
import { STATIC_CONTENT_DB_REQUIRED_MESSAGE } from "@/lib/admin/static-content-guard";
import { handleAdminUnauthorized, redirectWithError } from "@/lib/admin/actions";
import { requireDisclosureLinkContentManager } from "./access";

const ADMIN_PATH = "/admin/disclosure-links";

async function guardContentManager(): Promise<void> {
  try {
    await requireDisclosureLinkContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }
}

export async function executeDisclosureLinkBulkAction(
  actionId: AdminBulkActionId,
  ids: unknown,
): Promise<BulkRunResponse> {
  void actionId;
  void ids;
  await guardContentManager();
  return bulkRunError(STATIC_CONTENT_DB_REQUIRED_MESSAGE);
}

export async function createDisclosureLinkRedirect(): Promise<never> {
  await guardContentManager();
  redirectWithError(
    `${ADMIN_PATH}/new`,
    STATIC_CONTENT_DB_REQUIRED_MESSAGE,
  );
}

export async function updateDisclosureLinkRedirect(): Promise<never> {
  await guardContentManager();
  redirectWithError(ADMIN_PATH, STATIC_CONTENT_DB_REQUIRED_MESSAGE);
}

export async function redirectDisclosureNotEditable(): Promise<never> {
  redirect(ADMIN_PATH);
}
