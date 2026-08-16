import { NextRequest, NextResponse } from "next/server";
import { triggerFullResetCache, getFullResetStatus } from "@/lib/redis/fullResetCache";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { RedisCacheAuditLogs } = models;

    const currentStatus = getFullResetStatus();
    const recentLogs = RedisCacheAuditLogs
      ? await RedisCacheAuditLogs.find().sort({ createdAt: -1 }).limit(20).lean()
      : [];

    return NextResponse.json({
      success: true,
      data: {
        status: currentStatus,
        recentLogs
      }
    });
  } catch (error: any) {
    console.error("[ERR Redis Cache Status API]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const adminName = body.adminName || "Admin";
    const adminEmail = body.adminEmail || "";

    const result = await triggerFullResetCache({ adminName, adminEmail });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      jobId: result.jobId
    });
  } catch (error: any) {
    console.error("[ERR Trigger Redis Full Reset API]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
