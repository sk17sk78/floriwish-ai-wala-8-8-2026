export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { Types } from "mongoose";

const { NotificationTokens } = models;

/**
 * POST /api/frontend/notifications/token
 * Register or update an FCM device token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userId, deviceInfo, platform, userAgent } = body;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Valid FCM token is required." },
        { status: 400 }
      );
    }

    await connectDB();

    let validUserId: Types.ObjectId | null = null;
    if (userId && Types.ObjectId.isValid(userId)) {
      validUserId = new Types.ObjectId(userId);
    }

    const updatedRecord = await NotificationTokens.findOneAndUpdate(
      { token: token.trim() },
      {
        $set: {
          token: token.trim(),
          ...(validUserId ? { userId: validUserId } : {}),
          deviceInfo: deviceInfo || "Web Browser",
          userAgent: userAgent || req.headers.get("user-agent") || "",
          platform: platform || "web",
          isActive: true
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Notification token registered successfully.",
        id: updatedRecord._id
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error registering notification token:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/frontend/notifications/token
 * Deactivate an FCM device token on logout or permission revocation
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required." },
        { status: 400 }
      );
    }

    await connectDB();

    await NotificationTokens.updateOne(
      { token: token.trim() },
      { $set: { isActive: false } }
    );

    return NextResponse.json(
      { success: true, message: "Token deactivated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deactivating notification token:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
