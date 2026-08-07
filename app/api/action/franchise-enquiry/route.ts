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
    const city = String(body.city || "").trim();
    const investmentRange = String(body.investmentRange || "").trim();
    const message = body.message ? String(body.message).trim() : undefined;

    if (!name || !phone || !email || !city || !investmentRange) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = await MODELS.FranchiseEnquiries.create({
      status: "new",
      name,
      phone,
      email,
      city,
      investmentRange,
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

