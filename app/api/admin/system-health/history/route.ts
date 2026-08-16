import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const res = await fetch(`${origin}/api/admin/system-health/scan`, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo",
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json({
      success: true,
      history: data.history || [],
      timeline: data.timeline || [],
      latestSummary: data.latestHistory || null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
