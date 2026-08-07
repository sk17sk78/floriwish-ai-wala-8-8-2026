import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import MODELS from "@/db/mongoose/models";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !phone || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = await MODELS.SupportMessages.create({
      status: "new",
      name,
      phone,
      email,
      subject,
      message,
      submittedAt: new Date()
    });

    return NextResponse.json(
      { success: true, message: "Submitted", data: { id: doc._id } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
