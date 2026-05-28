import { NextRequest, NextResponse } from "next/server";

interface SupabaseFile {
  name: string;
  id: string;
  updated_at: string | null;
  metadata: {
    size: number;
  } | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");
  const prefix = searchParams.get("prefix") || "";

  if (!bucket) {
    return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });
  }

  const url = `https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/list/${bucket}`;
  const apiKey = "sb_publishable_D6HiIqwm-zYE2fpf5DQCGQ_VpBXasHm";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prefix,
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to list files from Supabase" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as SupabaseFile[];
    const formatted = (data || [])
      .filter((file) => file.name && !file.name.endsWith("/") && file.id)
      .map((file) => ({
        name: file.name,
        size: file.metadata?.size ?? null,
        updated_at: file.updated_at ?? null,
        public_url: `https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/${bucket}/${
          prefix ? `${prefix}/` : ""
        }${encodeURIComponent(file.name)}`,
      }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error in storage proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
