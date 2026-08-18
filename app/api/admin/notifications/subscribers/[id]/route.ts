export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { sendPushNotification } from "@/config/firebaseAdmin";
import { Types } from "mongoose";

const { NotificationTokens } = models;

/**
 * PATCH /api/admin/notifications/subscribers/[id]
 * Toggle isActive status of a subscriber
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subscriber ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { isActive } = body;

    const subscriber = await NotificationTokens.findById(id);
    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found." },
        { status: 404 }
      );
    }

    const newStatus = typeof isActive === "boolean" ? isActive : !subscriber.isActive;
    await NotificationTokens.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { isActive: newStatus } }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Subscriber ${newStatus ? "enabled" : "disabled"} successfully.`,
        isActive: newStatus
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error toggling subscriber status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications/subscribers/[id]
 * Permanently remove a subscriber record
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subscriber ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await NotificationTokens.deleteOne({ _id: new Types.ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscriber deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications/subscribers/[id]
 * Send a test notification to a specific subscriber
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subscriber ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const subscriber = await NotificationTokens.findById(id).lean() as any;
    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found." },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { success: false, message: "Subscriber is inactive. Enable it first." },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      tokens: [subscriber.token],
      title: "🔔 Floriwish Test Notification",
      body: "This is a test notification from your admin panel.",
      clickUrl: "/",
      data: {
        url: "/",
        type: "test",
        timestamp: Date.now().toString()
      }
    });

    // Update lastError if failed
    if (result.failureCount > 0 && result.invalidTokens.length > 0) {
      await NotificationTokens.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { lastError: "Test notification failed — token may be invalid", isActive: false } }
      );
    } else if (result.successCount > 0) {
      await NotificationTokens.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { lastSentAt: new Date(), lastError: null } }
      );
    }

    const success = result.successCount > 0;
    return NextResponse.json(
      {
        success,
        message: success
          ? "✓ Test notification sent successfully."
          : `✕ Test notification failed. ${result.error || "Token may be expired or invalid."}`,
        result
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
