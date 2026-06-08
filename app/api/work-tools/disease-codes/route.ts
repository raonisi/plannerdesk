import { NextRequest, NextResponse } from "next/server";
import { workToolsRouteGuard } from "@/lib/api/work-tools-route-guard";

export async function GET(request: NextRequest) {
  const denied = await workToolsRouteGuard();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";
  const page_size = searchParams.get("page_size") || "30";

  const targetUrl = new URL("https://bohumschool-archive.onrender.com/api/v1/disease-codes");
  if (q) targetUrl.searchParams.set("q", q);
  targetUrl.searchParams.set("page", page);
  targetUrl.searchParams.set("page_size", page_size);

  try {
    const res = await fetch(targetUrl.toString());
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from backend" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in disease-codes proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
