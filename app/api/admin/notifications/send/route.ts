export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { sendPushNotification } from "@/config/firebaseAdmin";
import { Types } from "mongoose";

const { NotificationTokens, PushNotificationLogs } = models;

type TargetType = "all" | "loggedin" | "guest" | "mobile" | "desktop" | "tablet" | "user";

const TARGET_LABELS: Record<TargetType, string> = {
  all: "All Subscribers",
  loggedin: "All Logged-in Users",
  guest: "Guest Visitors",
  mobile: "Mobile Devices",
  desktop: "Desktop/Laptop",
  tablet: "Tablet Devices",
  user: "Specific User"
};

/**
 * POST /api/admin/notifications/send
 * Dispatch Web Push Notifications to active subscribers.
 * targetType options: all | loggedin | guest | mobile | desktop | tablet | user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      imageUrl,
      clickUrl = "/",
      targetType = "all" as TargetType,
      targetUserId
    } = body;

    // 1. Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Notification title is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Notification message is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Build query based on targetType
    const query: any = { isActive: true };

    switch (targetType as TargetType) {
      case "loggedin":
        query.userId = { $ne: null };
        break;
      case "guest":
        query.userId = null;
        break;
      case "mobile":
        query.deviceType = "mobile";
        break;
      case "desktop":
        query.deviceType = "desktop";
        break;
      case "tablet":
        query.deviceType = "tablet";
        break;
      case "user":
        if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
          return NextResponse.json(
            { success: false, message: "Valid Target User ID is required." },
            { status: 400 }
          );
        }
        query.userId = new Types.ObjectId(targetUserId);
        break;
      case "all":
      default:
        // No additional filter — all active
        break;
    }

    const tokenRecords = await NotificationTokens.find(query)
      .select("token _id")
      .lean();
    const tokens = tokenRecords.map((r: any) => r.token).filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No active subscriber tokens found for the selected target.",
          totalTargeted: 0,
          successCount: 0,
          failureCount: 0,
          invalidCount: 0
        },
        { status: 200 }
      );
    }

    const sentAt = new Date();

    // 3. Dispatch via Firebase Admin SDK (handles batching internally)
    const sendResult = await sendPushNotification({
      tokens,
      title: title.trim(),
      body: message.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      clickUrl: clickUrl ? clickUrl.trim() : "/",
      data: {
        url: clickUrl ? clickUrl.trim() : "/",
        timestamp: sentAt.getTime().toString()
      }
    });

    // 4. Determine campaign status
    const status =
      sendResult.successCount === 0
        ? "failed"
        : sendResult.failureCount > 0
        ? "partial"
        : "sent";

    // 5. Update lastSentAt for all tokens in this batch (non-blocking)
    const tokenValues = tokenRecords.map((r: any) => r.token);
    NotificationTokens.updateMany(
      { token: { $in: tokenValues } },
      { $set: { lastSentAt: sentAt } }
    ).catch((e: any) => console.error("[FCM] Error updating lastSentAt:", e));

    // 6. Log campaign in PushNotificationLogs
    await PushNotificationLogs.create({
      title: title.trim(),
      message: message.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : "",
      clickUrl: clickUrl ? clickUrl.trim() : "/",
      targetType: targetType || "all",
      targetLabel: TARGET_LABELS[(targetType as TargetType) || "all"],
      targetUserId:
        targetUserId && Types.ObjectId.isValid(targetUserId)
          ? new Types.ObjectId(targetUserId)
          : null,
      totalSent: sendResult.totalTargeted,
      successCount: sendResult.successCount,
      failureCount: sendResult.failureCount,
      invalidCount: sendResult.invalidTokens.length,
      status,
      sentAt
    });

    return NextResponse.json(
      {
        success: true,
        message: `Push notification sent: ${sendResult.successCount} succeeded, ${sendResult.failureCount} failed, ${sendResult.invalidTokens.length} invalid (auto-cleaned) out of ${sendResult.totalTargeted} devices.`,
        data: {
          ...sendResult,
          status,
          sentAt: sentAt.toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error dispatching push notifications:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
