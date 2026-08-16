import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    await connectDB();
    const { contentId } = await params;
    const db = mongoose.connection.db!;

    if (!contentId) {
      return NextResponse.json({ success: false, reviews: [] });
    }

    const query: any = {
      status: "approved",
      isDeleted: { $ne: true },
      isActive: { $ne: false }
    };

    if (mongoose.Types.ObjectId.isValid(contentId)) {
      query.$or = [
        { content: new mongoose.Types.ObjectId(contentId) },
        { content: contentId },
        { contentSlug: contentId }
      ];
    } else {
      // Find content by slug first
      const contentDoc = await db.collection("contents").findOne({ slug: contentId });
      if (contentDoc) {
        query.$or = [
          { content: contentDoc._id },
          { content: contentDoc._id.toString() },
          { contentSlug: contentId }
        ];
      } else {
        query.contentSlug = contentId;
      }
    }

    const reviews = await db.collection("reviews")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const formattedReviews = reviews.map((r: any) => ({
      _id: r._id ? r._id.toString() : "",
      customerName: r.customerName || "Customer",
      customerCity: r.customerCity || "Verified Buyer",
      rating: r.rating || 5,
      review: r.review || "",
      photos: Array.isArray(r.photos) ? r.photos : [],
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric"
          })
        : "Recent",
      isVerified: r.isVerified !== false
    }));

    return NextResponse.json({
      success: true,
      count: formattedReviews.length,
      reviews: formattedReviews
    });
  } catch (error: any) {
    console.error("[ERR GET /api/frontend/v2/frontend/review/product/[contentId]]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews", reviews: [] },
      { status: 500 }
    );
  }
}
