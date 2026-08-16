export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { sendPushNotification } from "@/config/firebaseAdmin";
import { Types } from "mongoose";

const { NotificationTokens, PushNotificationLogs } = models;

/**
 * POST /api/admin/notifications/send
 * Dispatch Web Push Notifications to all active subscribers or specific users
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      imageUrl,
      clickUrl = "/",
      targetType = "all",
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

    // 2. Query target tokens
    const query: any = { isActive: true };

    if (targetType === "user") {
      if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
        return NextResponse.json(
          { success: false, message: "Valid Target User ID is required." },
          { status: 400 }
        );
      }
      query.userId = new Types.ObjectId(targetUserId);
    } else if (targetType === "guest") {
      query.userId = { $in: [null, undefined] };
    }

    const tokenRecords = await NotificationTokens.find(query).select("token").lean();
    const tokens = tokenRecords.map((r: any) => r.token).filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No active subscriber tokens found for the selected target.",
          totalTargeted: 0,
          successCount: 0,
          failureCount: 0
        },
        { status: 200 }
      );
    }

    // 3. Dispatch via Firebase Admin SDK
    const sendResult = await sendPushNotification({
      tokens,
      title: title.trim(),
      body: message.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      clickUrl: clickUrl ? clickUrl.trim() : "/",
      data: {
        url: clickUrl ? clickUrl.trim() : "/",
        timestamp: Date.now().toString()
      }
    });

    // 4. Log campaign in PushNotificationLogs
    await PushNotificationLogs.create({
      title: title.trim(),
      message: message.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : "",
      clickUrl: clickUrl ? clickUrl.trim() : "/",
      targetType: targetType || "all",
      targetUserId: targetUserId && Types.ObjectId.isValid(targetUserId) ? new Types.ObjectId(targetUserId) : null,
      totalSent: sendResult.totalTargeted,
      successCount: sendResult.successCount,
      failureCount: sendResult.failureCount
    });

    return NextResponse.json(
      {
        success: true,
        message: `Push notification sent: ${sendResult.successCount} succeeded, ${sendResult.failureCount} failed out of ${sendResult.totalTargeted} devices.`,
        data: sendResult
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
