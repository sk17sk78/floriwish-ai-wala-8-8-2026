import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { NotificationTokens } = models;

/**
 * GET /api/frontend/notifications
 * Returns public notification system status & active announcements
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      enabled: true,
      data: {
        announcements: [],
        pushEnabled: true,
        unreadCount: 0,
      }
    }, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
