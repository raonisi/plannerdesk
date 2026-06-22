import { NextRequest, NextResponse } from "next/server";
import { workToolsPublicReadRouteGuard } from "@/lib/api/work-tools-route-guard";

export async function GET(request: NextRequest) {
  const denied = await workToolsPublicReadRouteGuard("diseases");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const insurer = searchParams.get("insurer") || "";
  const category = searchParams.get("category") || "";
  const page = searchParams.get("page") || "1";
  const page_size = searchParams.get("page_size") || "30";

  const targetUrl = new URL("https://bohumschool-archive.onrender.com/api/v1/diseases");
  if (q) targetUrl.searchParams.set("q", q);
  if (insurer) targetUrl.searchParams.set("insurer", insurer);
  if (category) targetUrl.searchParams.set("category", category);
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
    console.error("Error in diseases proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
