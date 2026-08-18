export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { NotificationTokens } = models;

/**
 * GET /api/admin/notifications/subscribers
 * Paginated subscriber list with populated user info.
 * Query params:
 *   page       - page number (default: 1)
 *   limit      - items per page (default: 20, max: 100)
 *   search     - search by user name / email / subscriber ID prefix
 *   deviceType - filter: mobile | desktop | tablet | all
 *   status     - filter: active | inactive | all
 *   userType   - filter: loggedin | guest | all
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();
    const deviceType = searchParams.get("deviceType") || "all";
    const status = searchParams.get("status") || "active";
    const userType = searchParams.get("userType") || "all";
    const skip = (page - 1) * limit;

    // Build base query
    const query: any = {};

    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    if (deviceType !== "all") query.deviceType = deviceType;

    if (userType === "loggedin") query.userId = { $ne: null };
    else if (userType === "guest") query.userId = null;

    // Fetch subscribers with user population
    const [subscribers, total] = await Promise.all([
      NotificationTokens.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "userId",
          select: "name email mobile phone fullName",
          model: "Customer"
        })
        .lean(),
      NotificationTokens.countDocuments(query)
    ]);

    // Post-process: search filter on populated user data + sanitize token
    let filtered = subscribers.map((sub: any) => {
      const user = sub.userId;
      return {
        _id: sub._id,
        subscriberId: sub._id.toString(),
        // Token shown as prefix only — never expose full FCM token to admin UI
        tokenPreview: sub.token
          ? sub.token.substring(0, 12) + "..." + sub.token.substring(sub.token.length - 6)
          : "N/A",
        user: user
          ? {
              _id: user._id,
              name: user.name || user.fullName || "N/A",
              email: user.email || "",
              mobile: user.mobile || user.phone || ""
            }
          : null,
        isGuest: !sub.userId,
        deviceType: sub.deviceType || "desktop",
        browser: sub.browser || "Unknown",
        os: sub.os || "Unknown",
        osVersion: sub.osVersion || "",
        platform: sub.platform || "web",
        isActive: sub.isActive,
        subscribedAt: sub.subscribedAt || sub.createdAt,
        lastSentAt: sub.lastSentAt || null,
        lastError: sub.lastError || null,
        updatedAt: sub.updatedAt,
        createdAt: sub.createdAt
      };
    });

    // Apply search filter (on populated data)
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((s: any) => {
        return (
          s.subscriberId.toLowerCase().startsWith(q) ||
          (s.user?.name || "").toLowerCase().includes(q) ||
          (s.user?.email || "").toLowerCase().includes(q) ||
          (s.user?.mobile || "").includes(q)
        );
      });
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        subscribers: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
