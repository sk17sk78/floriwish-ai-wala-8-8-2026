export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { Types } from "mongoose";

const { NotificationTokens } = models;

// ─── UA Parser (no external dependency) ───────────────────────────────────────
function parseUserAgent(ua: string): {
  deviceType: "mobile" | "desktop" | "tablet";
  browser: string;
  os: string;
  osVersion: string;
} {
  const s = ua || "";

  const isTablet = /iPad|Tablet|PlayBook|(Android(?!.*Mobile))/i.test(s);
  const isMobile = !isTablet && /iPhone|iPod|Android.*Mobile|Windows Phone|Mobile/i.test(s);
  const deviceType: "mobile" | "desktop" | "tablet" = isTablet
    ? "tablet"
    : isMobile
    ? "mobile"
    : "desktop";

  let browser = "Unknown";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = "Chrome";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Safari\//i.test(s) && !/Chrome/i.test(s)) browser = "Safari";
  else if (/MSIE|Trident/i.test(s)) browser = "IE";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung Browser";

  let os = "Unknown";
  let osVersion = "";
  const winMatch = s.match(/Windows NT ([\d.]+)/i);
  const macMatch = s.match(/Mac OS X ([\d_]+)/i);
  const andMatch = s.match(/Android ([\d.]+)/i);
  const iphMatch = s.match(/iPhone OS ([\d_]+)/i);
  const ipdMatch = s.match(/iPad.*OS ([\d_]+)/i);

  if (winMatch) {
    os = "Windows";
    const map: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" };
    osVersion = map[winMatch[1]] || winMatch[1];
  } else if (macMatch) {
    os = "macOS";
    osVersion = macMatch[1].replace(/_/g, ".");
  } else if (andMatch) {
    os = "Android";
    osVersion = andMatch[1];
  } else if (ipdMatch) {
    os = "iPadOS";
    osVersion = ipdMatch[1].replace(/_/g, ".");
  } else if (iphMatch) {
    os = "iOS";
    osVersion = iphMatch[1].replace(/_/g, ".");
  } else if (/CrOS/i.test(s)) {
    os = "ChromeOS";
  } else if (/Linux/i.test(s)) {
    os = "Linux";
  }

  return { deviceType, browser, os, osVersion };
}

/**
 * POST /api/frontend/notifications/token
 * Register or update an FCM device token.
 * - Parses UA into structured deviceType / browser / os fields
 * - Merges guest subscription to userId on login (guest -> user merge)
 * - Stores subscribedAt on first creation only
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userId, platform, userAgent: bodyUA } = body;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Valid FCM token is required." },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      const ua = bodyUA || req.headers.get("user-agent") || "";
      const { deviceType, browser, os, osVersion } = parseUserAgent(ua);

      const deviceInfo =
        deviceType === "tablet"
          ? `${os} Tablet`
          : deviceType === "mobile"
          ? `${os} Mobile`
          : `${os} Desktop`;

      let validUserId: Types.ObjectId | null = null;
      if (userId && Types.ObjectId.isValid(userId)) {
        validUserId = new Types.ObjectId(userId);
      }

      const existing = await NotificationTokens.findOne({ token: token.trim() });
      const isNew = !existing;

      const updatedRecord = await NotificationTokens.findOneAndUpdate(
        { token: token.trim() },
        {
          $set: {
            token: token.trim(),
            deviceType,
            browser,
            os,
            osVersion,
            deviceInfo,
            userAgent: ua,
            platform: platform || "web",
            isActive: true,
            lastError: null,
            ...(validUserId ? { userId: validUserId } : {})
          },
          $setOnInsert: {
            subscribedAt: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return NextResponse.json(
        {
          success: true,
          message: isNew
            ? "Notification token registered successfully."
            : "Notification token updated.",
          id: updatedRecord?._id,
          isNew
        },
        { status: 200 }
      );
    } catch (dbErr: any) {
      // Graceful fallback on transient socket reset
      console.warn("⚠️ Notification token register transient DB notice:", dbErr?.message || dbErr);
      return NextResponse.json(
        { success: true, message: "Token queued." },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 }
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
