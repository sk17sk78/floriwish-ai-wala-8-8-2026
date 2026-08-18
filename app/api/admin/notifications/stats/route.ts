export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { NotificationTokens, PushNotificationLogs } = models;

/**
 * GET /api/admin/notifications/stats
 * Returns subscriber metrics (with device breakdown) and recent campaign logs
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const [
      totalActive,
      totalLoggedIn,
      totalGuests,
      totalInactive,
      totalMobile,
      totalDesktop,
      totalTablet,
      recentCampaigns
    ] = await Promise.all([
      NotificationTokens.countDocuments({ isActive: true }),
      NotificationTokens.countDocuments({ isActive: true, userId: { $ne: null } }),
      NotificationTokens.countDocuments({ isActive: true, userId: null }),
      NotificationTokens.countDocuments({ isActive: false }),
      NotificationTokens.countDocuments({ isActive: true, deviceType: "mobile" }),
      NotificationTokens.countDocuments({ isActive: true, deviceType: "desktop" }),
      NotificationTokens.countDocuments({ isActive: true, deviceType: "tablet" }),
      PushNotificationLogs.find().sort({ createdAt: -1 }).limit(20).lean()
    ]);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalActive,
          totalLoggedIn,
          totalGuests,
          totalInactive,
          totalMobile,
          totalDesktop,
          totalTablet
        },
        campaigns: recentCampaigns
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching notification stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

