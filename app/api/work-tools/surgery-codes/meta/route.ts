import { NextResponse } from "next/server";
import { workToolsPublicReadRouteGuard } from "@/lib/api/work-tools-route-guard";

export async function GET() {
  const denied = await workToolsPublicReadRouteGuard();
  if (denied) return denied;

  try {
    const res = await fetch("https://bohumschool-archive.onrender.com/api/v1/surgery-codes/meta");
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from backend" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in surgery-codes meta proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
