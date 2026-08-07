import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/db/mongoose/connection";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stateBefore = mongoose.connection.readyState;
    await connectDB();
    const stateAfter = mongoose.connection.readyState;
    
    // Also try to run a simple query to verify it actually works
    const db = mongoose.connection.db;
    let pingResult = null;
    if (db) {
      pingResult = await db.command({ ping: 1 });
    }

    const rawUri = process.env.MONGODB_URI || "MISSING";
    const sanitizedUri = rawUri.replace(/:([^:@]{3,})@/, ':***@');

    return NextResponse.json({
      status: "success",
      stateBefore,
      stateAfter,
      pingResult,
      activeUri: sanitizedUri,
    });
  } catch (error: any) {
    const rawUri = process.env.MONGODB_URI || "MISSING";
    const sanitizedUri = rawUri.replace(/:([^:@]{3,})@/, ':***@');

    return NextResponse.json({
      status: "error",
      message: error?.message || "Unknown error",
      stack: error?.stack,
      readyState: mongoose.connection.readyState,
      activeUri: sanitizedUri,
    }, { status: 500 });
  }
}
