import { NextRequest, NextResponse } from "next/server";

import {
  buildWorkToolsStorageObjectPath,
  getWorkToolsFirebaseUploadConfig,
  WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR,
} from "@/lib/api/work-tools-storage-config";
import { workToolsRouteGuard } from "@/lib/api/work-tools-route-guard";
import { uploadFileToFirebaseStorage } from "@/lib/firebase/google-service-account";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

export async function POST(request: NextRequest) {
  const denied = await workToolsRouteGuard();
  if (denied) return denied;

  const config = getWorkToolsFirebaseUploadConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const prefix = String(formData?.get("prefix") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "invalid_file_size" }, { status: 400 });
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ ok: false, error: "unsupported_file_type" }, { status: 415 });
  }

  const objectPath = buildWorkToolsStorageObjectPath(prefix, file.name);
  if (!objectPath) {
    return NextResponse.json({ ok: false, error: "invalid_file_path" }, { status: 400 });
  }

  try {
    const result = await uploadFileToFirebaseStorage({
      config,
      objectPath,
      contentType,
      bytes: Buffer.from(await file.arrayBuffer()),
    });

    return NextResponse.json({
      ok: true,
      file: {
        name: result.name,
        bucket: result.bucket,
        size: result.size,
        contentType: result.contentType,
        public_url: result.downloadUrl,
      },
    });
  } catch {
    console.error("Error in storage upload proxy");
    return NextResponse.json({ ok: false, error: "firebase_storage_upload_failed" }, { status: 502 });
  }
}
