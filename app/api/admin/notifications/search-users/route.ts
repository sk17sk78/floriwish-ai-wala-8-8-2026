export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { NotificationTokens } = models;

/**
 * GET /api/admin/notifications/search-users
 * Search customers who have push notification subscriptions.
 * Query params:
 *   q - search term (name, email, mobile)
 *   limit - max results (default: 10)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    if (!q || q.length < 2) {
      return NextResponse.json(
        { success: false, message: "Search query must be at least 2 characters." },
        { status: 400 }
      );
    }

    // Find subscribers with populated user data matching the search
    const subscribers = await NotificationTokens.find({ isActive: true, userId: { $ne: null } })
      .populate({
        path: "userId",
        select: "name fullName email mobile phone",
        model: "Customer",
        match: {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { fullName: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } }
          ]
        }
      })
      .lean();

    // Filter out subscribers where population returned null (didn't match)
    const matched = subscribers.filter((s: any) => s.userId !== null && s.userId !== undefined);

    // Group by userId to show 1 user → multiple devices
    const userMap = new Map<string, any>();
    for (const sub of matched as any[]) {
      const user = sub.userId;
      if (!user || !user._id) continue;
      const uid = user._id.toString();

      if (!userMap.has(uid)) {
        userMap.set(uid, {
          userId: uid,
          name: user.name || user.fullName || "Unknown",
          email: user.email || "",
          mobile: user.mobile || user.phone || "",
          devices: []
        });
      }

      userMap.get(uid).devices.push({
        subscriberId: sub._id.toString(),
        deviceType: sub.deviceType || "desktop",
        browser: sub.browser || "Unknown",
        os: sub.os || "Unknown",
        isActive: sub.isActive,
        lastSentAt: sub.lastSentAt || null,
        subscribedAt: sub.subscribedAt || sub.createdAt
      });
    }

    const results = Array.from(userMap.values()).slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        results,
        count: results.length
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error searching notification users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
