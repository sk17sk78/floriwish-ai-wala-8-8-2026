import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { CategoryBannerJobs } = models;

    const job = await CategoryBannerJobs.findById(id).lean();
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { CategoryBannerJobs } = models;

    const body = await req.json();
    const { action } = body;

    const job = await CategoryBannerJobs.findById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    if (action === "cancel") {
      job.status = "cancelled";
      job.logs.push({
        timestamp: new Date(),
        message: "Job cancelled by administrator.",
        level: "warn"
      });
      await job.save();
      return NextResponse.json({ success: true, message: "Job cancelled successfully.", job });
    }

    return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
