import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://bohumschool-archive.onrender.com/api/v1/disease-codes/meta");
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from backend" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in disease-codes meta proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
