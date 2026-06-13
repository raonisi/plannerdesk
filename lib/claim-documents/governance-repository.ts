import type {
  ClaimDocumentGovernanceReviewStatus as PrismaReviewStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ClaimDocumentReviewStatus } from "./governance-types";

export type ClaimDocumentGovernanceRecord = {
  id: string;
  documentKey: string;
  insurerId?: string;
  insurerName: string;
  documentTitle: string;
  fileName: string;
  filePath: string;
  officialSourceUrl?: string;
  officialSourceLabel?: string;
  lastVerifiedAt?: string;
  nextReviewDueAt?: string;
  reviewStatus: ClaimDocumentReviewStatus;
  isVisible: boolean;
  isDownloadEnabled: boolean;
  cautionText?: string;
  adminMemo?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
};

export type ClaimDocumentGovernanceAuditLogRecord = {
  id: string;
  governanceId: string;
  documentKey: string;
  changedBy?: string;
  changedAt: string;
  fieldName: string;
  previousValue?: string;
  nextValue?: string;
  changeReason?: string;
};

export type ClaimDocumentGovernanceIdentity = {
  documentKey: string;
  insurerId?: string;
  insurerName: string;
  documentTitle: string;
  fileName: string;
  filePath: string;
};

export type ClaimDocumentGovernanceUpdateInput = {
  officialSourceUrl?: string | null;
  officialSourceLabel?: string | null;
  lastVerifiedAt?: string | null;
  nextReviewDueAt?: string | null;
  reviewStatus: ClaimDocumentReviewStatus;
  isVisible: boolean;
  isDownloadEnabled: boolean;
  cautionText?: string | null;
  adminMemo?: string | null;
  updatedBy?: string;
};

function toIsoDate(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.toISOString();
}

function toDateOnlyIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function mapReviewStatus(
  value: PrismaReviewStatus,
): ClaimDocumentReviewStatus {
  return value as ClaimDocumentReviewStatus;
}

function mapGovernanceRow(row: {
  id: string;
  documentKey: string;
  insurerId: string | null;
  insurerName: string;
  documentTitle: string;
  fileName: string;
  filePath: string;
  officialSourceUrl: string | null;
  officialSourceLabel: string | null;
  lastVerifiedAt: Date | null;
  nextReviewDueAt: Date | null;
  reviewStatus: PrismaReviewStatus;
  isVisible: boolean;
  isDownloadEnabled: boolean;
  cautionText: string | null;
  adminMemo: string | null;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | null;
}): ClaimDocumentGovernanceRecord {
  return {
    id: row.id,
    documentKey: row.documentKey,
    insurerId: row.insurerId ?? undefined,
    insurerName: row.insurerName,
    documentTitle: row.documentTitle,
    fileName: row.fileName,
    filePath: row.filePath,
    officialSourceUrl: row.officialSourceUrl ?? undefined,
    officialSourceLabel: row.officialSourceLabel ?? undefined,
    lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
    nextReviewDueAt: toIsoDate(row.nextReviewDueAt),
    reviewStatus: mapReviewStatus(row.reviewStatus),
    isVisible: row.isVisible,
    isDownloadEnabled: row.isDownloadEnabled,
    cautionText: row.cautionText ?? undefined,
    adminMemo: row.adminMemo ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy ?? undefined,
  };
}

function mapAuditLogRow(row: {
  id: string;
  governanceId: string;
  documentKey: string;
  changedBy: string | null;
  changedAt: Date;
  fieldName: string;
  previousValue: string | null;
  nextValue: string | null;
  changeReason: string | null;
}): ClaimDocumentGovernanceAuditLogRecord {
  return {
    id: row.id,
    governanceId: row.governanceId,
    documentKey: row.documentKey,
    changedBy: row.changedBy ?? undefined,
    changedAt: row.changedAt.toISOString(),
    fieldName: row.fieldName,
    previousValue: row.previousValue ?? undefined,
    nextValue: row.nextValue ?? undefined,
    changeReason: row.changeReason ?? undefined,
  };
}

function serializeFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

const TRACKED_FIELDS = [
  "officialSourceUrl",
  "officialSourceLabel",
  "lastVerifiedAt",
  "nextReviewDueAt",
  "reviewStatus",
  "isVisible",
  "isDownloadEnabled",
  "cautionText",
  "adminMemo",
] as const;

export async function listClaimDocumentGovernanceRecords(): Promise<
  ClaimDocumentGovernanceRecord[]
> {
  const rows = await prisma.claimDocumentGovernance.findMany({
    orderBy: [{ insurerName: "asc" }, { documentTitle: "asc" }],
  });
  return rows.map(mapGovernanceRow);
}

export async function getClaimDocumentGovernanceByDocumentKey(
  documentKey: string,
): Promise<ClaimDocumentGovernanceRecord | null> {
  const row = await prisma.claimDocumentGovernance.findUnique({
    where: { documentKey },
  });
  return row ? mapGovernanceRow(row) : null;
}

export async function listClaimDocumentGovernanceAuditLogs(
  documentKey: string,
  limit = 20,
): Promise<ClaimDocumentGovernanceAuditLogRecord[]> {
  const rows = await prisma.claimDocumentGovernanceAuditLog.findMany({
    where: { documentKey },
    orderBy: { changedAt: "desc" },
    take: limit,
  });
  return rows.map(mapAuditLogRow);
}

export async function createClaimDocumentGovernanceAuditLog(input: {
  governanceId: string;
  documentKey: string;
  changedBy?: string;
  fieldName: string;
  previousValue?: string | null;
  nextValue?: string | null;
  changeReason?: string | null;
}): Promise<void> {
  await prisma.claimDocumentGovernanceAuditLog.create({
    data: {
      governanceId: input.governanceId,
      documentKey: input.documentKey,
      changedBy: input.changedBy ?? null,
      fieldName: input.fieldName,
      previousValue: input.previousValue ?? null,
      nextValue: input.nextValue ?? null,
      changeReason: input.changeReason ?? null,
    },
  });
}

function buildPersistedData(
  input: ClaimDocumentGovernanceUpdateInput,
): {
  officialSourceUrl: string | null;
  officialSourceLabel: string | null;
  lastVerifiedAt: Date | null;
  nextReviewDueAt: Date | null;
  reviewStatus: PrismaReviewStatus;
  isVisible: boolean;
  isDownloadEnabled: boolean;
  cautionText: string | null;
  adminMemo: string | null;
  updatedBy: string | null;
} {
  return {
    officialSourceUrl: input.officialSourceUrl ?? null,
    officialSourceLabel: input.officialSourceLabel ?? null,
    lastVerifiedAt: toDateOnlyIso(input.lastVerifiedAt),
    nextReviewDueAt: toDateOnlyIso(input.nextReviewDueAt),
    reviewStatus: input.reviewStatus as PrismaReviewStatus,
    isVisible: input.isVisible,
    isDownloadEnabled: input.isDownloadEnabled,
    cautionText: input.cautionText ?? null,
    adminMemo: input.adminMemo ?? null,
    updatedBy: input.updatedBy ?? null,
  };
}

async function writeAuditLogsForChanges(input: {
  governanceId: string;
  documentKey: string;
  changedBy?: string;
  changeReason?: string | null;
  previous: Record<string, unknown>;
  next: Record<string, unknown>;
}): Promise<void> {
  for (const fieldName of TRACKED_FIELDS) {
    const previousValue = serializeFieldValue(input.previous[fieldName]);
    const nextValue = serializeFieldValue(input.next[fieldName]);
    if (previousValue === nextValue) continue;

    await createClaimDocumentGovernanceAuditLog({
      governanceId: input.governanceId,
      documentKey: input.documentKey,
      changedBy: input.changedBy,
      fieldName,
      previousValue,
      nextValue,
      changeReason: input.changeReason ?? null,
    });
  }
}

export async function upsertClaimDocumentGovernance(
  identity: ClaimDocumentGovernanceIdentity,
  input: ClaimDocumentGovernanceUpdateInput,
  changeReason?: string | null,
): Promise<ClaimDocumentGovernanceRecord> {
  const persisted = buildPersistedData(input);
  const existing = await prisma.claimDocumentGovernance.findUnique({
    where: { documentKey: identity.documentKey },
  });

  if (!existing) {
    const created = await prisma.claimDocumentGovernance.create({
      data: {
        documentKey: identity.documentKey,
        insurerId: identity.insurerId ?? null,
        insurerName: identity.insurerName,
        documentTitle: identity.documentTitle,
        fileName: identity.fileName,
        filePath: identity.filePath,
        ...persisted,
      },
    });

    await writeAuditLogsForChanges({
      governanceId: created.id,
      documentKey: identity.documentKey,
      changedBy: input.updatedBy,
      changeReason,
      previous: Object.fromEntries(TRACKED_FIELDS.map((field) => [field, null])),
      next: persisted,
    });

    return mapGovernanceRow(created);
  }

  return updateClaimDocumentGovernance(
    identity.documentKey,
    input,
    changeReason,
  );
}

export async function updateClaimDocumentGovernance(
  documentKey: string,
  input: ClaimDocumentGovernanceUpdateInput,
  changeReason?: string | null,
): Promise<ClaimDocumentGovernanceRecord> {
  const existing = await prisma.claimDocumentGovernance.findUnique({
    where: { documentKey },
  });
  if (!existing) {
    throw new Error("CLAIM_DOCUMENT_GOVERNANCE_NOT_FOUND");
  }

  const persisted = buildPersistedData(input);
  const previousSnapshot = {
    officialSourceUrl: existing.officialSourceUrl,
    officialSourceLabel: existing.officialSourceLabel,
    lastVerifiedAt: existing.lastVerifiedAt,
    nextReviewDueAt: existing.nextReviewDueAt,
    reviewStatus: existing.reviewStatus,
    isVisible: existing.isVisible,
    isDownloadEnabled: existing.isDownloadEnabled,
    cautionText: existing.cautionText,
    adminMemo: existing.adminMemo,
  };

  const updated = await prisma.claimDocumentGovernance.update({
    where: { documentKey },
    data: persisted,
  });

  await writeAuditLogsForChanges({
    governanceId: updated.id,
    documentKey,
    changedBy: input.updatedBy,
    changeReason,
    previous: previousSnapshot,
    next: persisted,
  });

  return mapGovernanceRow(updated);
}

export type PublicClaimPdfGovernanceOverlayEntry = {
  isVisible: boolean;
  isDownloadEnabled: boolean;
  officialSourceUrl?: string | null;
  cautionText?: string | null;
};

export type PublicClaimPdfGovernanceOverlay = Record<
  string,
  PublicClaimPdfGovernanceOverlayEntry
>;

export async function getPublicClaimPdfGovernanceOverlay(): Promise<PublicClaimPdfGovernanceOverlay> {
  const rows = await prisma.claimDocumentGovernance.findMany({
    select: {
      documentKey: true,
      isVisible: true,
      isDownloadEnabled: true,
      officialSourceUrl: true,
      cautionText: true,
    },
  });

  const overlay: PublicClaimPdfGovernanceOverlay = {};
  for (const row of rows) {
    overlay[row.documentKey] = {
      isVisible: row.isVisible,
      isDownloadEnabled: row.isDownloadEnabled,
      officialSourceUrl: row.officialSourceUrl,
      cautionText: row.cautionText,
    };
  }
  return overlay;
}

export async function safeGetPublicClaimPdfGovernanceOverlay(): Promise<PublicClaimPdfGovernanceOverlay> {
  try {
    return await getPublicClaimPdfGovernanceOverlay();
  } catch {
    return {};
  }
}

export async function safeListClaimDocumentGovernanceRecords(): Promise<
  ClaimDocumentGovernanceRecord[]
> {
  try {
    return await listClaimDocumentGovernanceRecords();
  } catch {
    return [];
  }
}
