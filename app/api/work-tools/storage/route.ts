import { NextRequest, NextResponse } from "next/server";
import { workToolsPublicReadRouteGuard } from "@/lib/api/work-tools-route-guard";
import {
  buildWorkToolsStorageListUrl,
  buildWorkToolsStoragePublicUrl,
  getWorkToolsSupabaseConfig,
  WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR,
} from "@/lib/api/work-tools-storage-config";

interface StorageListFile {
  name: string;
  id: string;
  updated_at: string | null;
  metadata: {
    size: number;
  } | null;
}

export async function GET(request: NextRequest) {
  const denied = await workToolsPublicReadRouteGuard();
  if (denied) return denied;

  const config = getWorkToolsSupabaseConfig();
  if (!config) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json([
        {
          name: "샘플_테스트_자료_1.pdf",
          size: 1024 * 1024 * 2.5,
          updated_at: new Date().toISOString(),
          public_url: "#",
        },
        {
          name: "샘플_테스트_자료_2.pdf",
          size: 1024 * 1024 * 1.2,
          updated_at: new Date().toISOString(),
          public_url: "#",
        },
      ]);
    }
    return NextResponse.json(
      { ok: false, error: WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");
  const prefix = searchParams.get("prefix") || "";

  if (!bucket) {
    return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });
  }

  const listUrl = buildWorkToolsStorageListUrl(config.url, bucket);

  try {
    const res = await fetch(listUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
      body: JSON.stringify({
        prefix,
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to list storage files" }, { status: res.status });
    }

    const data = (await res.json()) as StorageListFile[];
    const formatted = (data || [])
      .filter((file) => file.name && !file.name.endsWith("/") && file.id)
      .map((file) => ({
        name: file.name,
        size: file.metadata?.size ?? null,
        updated_at: file.updated_at ?? null,
        public_url: buildWorkToolsStoragePublicUrl(
          config.url,
          bucket,
          prefix,
          file.name,
        ),
      }));

    return NextResponse.json(formatted);
  } catch {
    console.error("Error in storage proxy");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
