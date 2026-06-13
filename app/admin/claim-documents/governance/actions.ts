"use server";

import { revalidatePath } from "next/cache";
import { handleAdminUnauthorized, revalidatePublicContentPaths } from "@/lib/admin/actions";
import { buildClaimDocumentKey } from "@/lib/claim-documents/document-key";
import {
  listClaimDocumentGovernanceAuditLogs,
  upsertClaimDocumentGovernance,
} from "@/lib/claim-documents/governance-repository";
import {
  parseClaimDocumentGovernanceFormData,
  validateClaimDocumentGovernanceSave,
} from "@/lib/claim-documents/governance-validation";
import type { ClaimDocumentGovernanceAuditLogEntry } from "@/lib/claim-documents/governance-types";
import {
  getSessionUserId,
  requireClaimDocumentContentManager,
} from "../access";

const ADMIN_GOVERNANCE_PATH = "/admin/claim-documents/governance";

export type SaveClaimDocumentGovernanceResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type ClaimDocumentGovernanceAuditLogsResult =
  | { ok: true; logs: ClaimDocumentGovernanceAuditLogEntry[] }
  | { ok: false; message: string };

const SAVE_SUCCESS_MESSAGE = "검수 정보가 저장되었습니다.";
const SAVE_FAILURE_MESSAGE =
  "검수 정보를 저장하지 못했습니다. 입력값을 확인해 주세요.";

function revalidateGovernancePaths(): void {
  revalidatePath(ADMIN_GOVERNANCE_PATH);
  revalidatePublicContentPaths();
}

export async function saveClaimDocumentGovernanceAction(
  formData: FormData,
): Promise<SaveClaimDocumentGovernanceResult> {
  try {
    const session = await requireClaimDocumentContentManager();
    const userId = getSessionUserId(session);
    const payload = parseClaimDocumentGovernanceFormData(formData);
    const validated = validateClaimDocumentGovernanceSave(payload);

    if (!validated.ok) {
      return { ok: false, message: validated.message };
    }

    const {
      documentKey,
      changeReason,
      ...updateFields
    } = validated.data;

    const insurerName =
      typeof payload.insurerName === "string" ? payload.insurerName.trim() : "";
    const documentTitle =
      typeof payload.documentTitle === "string"
        ? payload.documentTitle.trim()
        : "";
    const fileName =
      typeof payload.fileName === "string" ? payload.fileName.trim() : "";
    const filePath =
      typeof payload.filePath === "string" ? payload.filePath.trim() : "";

    if (!insurerName || !documentTitle || !fileName || !filePath) {
      return { ok: false, message: SAVE_FAILURE_MESSAGE };
    }

    const expectedKey = buildClaimDocumentKey({
      filePath,
      fileName,
      insurerName,
      documentTitle,
    });
    if (expectedKey !== documentKey) {
      return { ok: false, message: SAVE_FAILURE_MESSAGE };
    }

    const insurerId =
      typeof payload.insurerId === "string" && payload.insurerId.trim()
        ? payload.insurerId.trim()
        : undefined;

    await upsertClaimDocumentGovernance(
      {
        documentKey,
        insurerId,
        insurerName,
        documentTitle,
        fileName,
        filePath,
      },
      {
        ...updateFields,
        updatedBy: userId ?? undefined,
      },
      changeReason ?? null,
    );

    revalidateGovernancePaths();
    return { ok: true, message: SAVE_SUCCESS_MESSAGE };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_GOVERNANCE_PATH, error);
    return { ok: false, message: SAVE_FAILURE_MESSAGE };
  }
}

export async function fetchClaimDocumentGovernanceAuditLogsAction(
  documentKey: string,
): Promise<ClaimDocumentGovernanceAuditLogsResult> {
  try {
    await requireClaimDocumentContentManager();
    const trimmedKey = documentKey.trim();
    if (!trimmedKey) {
      return { ok: false, message: "documentKey가 필요합니다." };
    }

    const logs = await listClaimDocumentGovernanceAuditLogs(trimmedKey, 20);
    return {
      ok: true,
      logs: logs.map((log) => ({
        id: log.id,
        fieldName: log.fieldName,
        previousValue: log.previousValue,
        nextValue: log.nextValue,
        changedBy: log.changedBy,
        changedAt: log.changedAt,
        changeReason: log.changeReason,
      })),
    };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_GOVERNANCE_PATH, error);
    return { ok: false, message: "변경 이력을 불러오지 못했습니다." };
  }
}
