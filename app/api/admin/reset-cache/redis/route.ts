import { NextRequest, NextResponse } from "next/server";
import { triggerFullResetCache } from "@/lib/redis/fullResetCache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const result = await triggerFullResetCache({ adminName: "Admin" });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
