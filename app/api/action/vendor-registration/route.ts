import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import MODELS from "@/db/mongoose/models";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim();
    const businessName = String(body.businessName || "").trim();
    const city = String(body.city || "").trim();
    const interestedCategory = String(body.interestedCategory || "").trim();
    const mobile = String(body.mobile || "").trim();
    const address = String(body.address || "").trim();

    if (
      !fullName ||
      !email ||
      !businessName ||
      !city ||
      !interestedCategory ||
      !mobile ||
      !address
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = await MODELS.VendorRegistrations.create({
      status: "new",
      fullName,
      email,
      businessName,
      city,
      interestedCategory,
      mobile,
      whatsapp: body.whatsapp ? String(body.whatsapp).trim() : undefined,
      address,
      gstNumber: body.gstNumber ? String(body.gstNumber).trim() : undefined,
      foundUs: body.foundUs ? String(body.foundUs).trim() : undefined,
      socialPlatform: body.socialPlatform
        ? String(body.socialPlatform).trim()
        : undefined,
      socialLink: body.socialLink ? String(body.socialLink).trim() : undefined,
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

