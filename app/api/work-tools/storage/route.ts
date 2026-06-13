import { NextRequest, NextResponse } from "next/server";
import { workToolsPublicReadRouteGuard } from "@/lib/api/work-tools-route-guard";
import {
  buildWorkToolsStorageListUrl,
  buildWorkToolsStoragePublicUrl,
  buildSupabaseStorageListUrl,
  buildSupabaseStoragePublicUrl,
  getWorkToolsFirebaseConfig,
  getWorkToolsSupabaseConfig,
  WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR,
} from "@/lib/api/work-tools-storage-config";

// Firebase types
interface FirebaseStorageFile {
  name: string; // Full path e.g. "prefix/file.pdf"
  bucket: string;
  size: string;
  updated: string;
}

interface FirebaseListResponse {
  prefixes?: string[];
  items?: FirebaseStorageFile[];
}

// Supabase types
interface SupabaseStorageFile {
  name: string;
  id: string;
  updated_at: string | null;
  metadata: {
    size: number;
  } | null;
}

function getDevFallbackResponse() {
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

export async function GET(request: NextRequest) {
  const denied = await workToolsPublicReadRouteGuard();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket") || "quick-link-files";
  const prefix = searchParams.get("prefix") || "";

  // Use Firebase Storage for:
  // 1. Textbooks (교재)
  // 2. Mock Exams (모의고사)
  // 3. Newsletters (소식지)
  // The rest should use Supabase Storage.
  const isTextbook = [
    "general-insurance-textbook",
    "life-insurance-textbook",
    "variable-insurance-textbook",
  ].includes(prefix);
  
  const isMockExam = [
    "general-insurance-mock-exam",
    "life-insurance-mock-exam",
    "variable-insurance-mock-exam",
  ].includes(prefix);

  const isNewsletter = prefix === "bulletin" || prefix.startsWith("newsletters/");

  const useFirebase = isTextbook || isMockExam || isNewsletter;

  if (useFirebase) {
    const config = getWorkToolsFirebaseConfig();
    if (!config) {
      if (process.env.NODE_ENV === "development") {
        return getDevFallbackResponse();
      }
      return NextResponse.json(
        { ok: false, error: WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR },
        { status: 503 },
      );
    }

    const listUrl = buildWorkToolsStorageListUrl(config.bucket, prefix);

    try {
      const res = await fetch(listUrl, {
        method: "GET",
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Failed to list storage files" }, { status: res.status });
      }

      const data = (await res.json()) as FirebaseListResponse;
      const formatted = (data.items || [])
        .filter((file) => file.name && !file.name.endsWith("/"))
        .map((file) => {
          const basename = file.name.split("/").pop() || file.name;
          return {
            name: basename,
            size: file.size ? parseInt(file.size, 10) : null,
            updated_at: file.updated ?? null,
            public_url: buildWorkToolsStoragePublicUrl(
              config.bucket,
              "", // prefix is included in file.name
              file.name,
            ),
          };
        });

      return NextResponse.json(formatted);
    } catch (err) {
      console.error("Error in storage proxy:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  } else {
    // Supabase Storage route
    const config = getWorkToolsSupabaseConfig();
    if (!config) {
      if (process.env.NODE_ENV === "development") {
        return getDevFallbackResponse();
      }
      return NextResponse.json(
        { ok: false, error: WORK_TOOLS_STORAGE_NOT_CONFIGURED_ERROR },
        { status: 503 },
      );
    }

    const listUrl = buildSupabaseStorageListUrl(config.url, bucket);

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

      const data = (await res.json()) as SupabaseStorageFile[];
      const formatted = (data || [])
        .filter((file) => file.name && !file.name.endsWith("/") && file.id)
        .map((file) => ({
          name: file.name,
          size: file.metadata?.size ?? null,
          updated_at: file.updated_at ?? null,
          public_url: buildSupabaseStoragePublicUrl(
            config.url,
            bucket,
            prefix,
            file.name,
          ),
        }));

      return NextResponse.json(formatted);
    } catch (err) {
      console.error("Error in storage proxy:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}

