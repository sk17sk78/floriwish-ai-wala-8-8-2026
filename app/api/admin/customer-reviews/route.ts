import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET all customer reviews with filtering & stats
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const db = mongoose.connection.db!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query: any = { isDeleted: { $ne: true } };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerCity: { $regex: search, $options: "i" } },
        { review: { $regex: search, $options: "i" } },
        { contentName: { $regex: search, $options: "i" } },
        { contentSlug: { $regex: search, $options: "i" } }
      ];
    }

    const [reviews, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      db.collection("reviews")
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("reviews").countDocuments(query),
      db.collection("reviews").countDocuments({ status: "pending", isDeleted: { $ne: true } }),
      db.collection("reviews").countDocuments({ status: "approved", isDeleted: { $ne: true } }),
      db.collection("reviews").countDocuments({ status: "rejected", isDeleted: { $ne: true } })
    ]);

    const formattedReviews = reviews.map((r: any) => ({
      _id: r._id ? r._id.toString() : "",
      customerName: r.customerName || "",
      customerCity: r.customerCity || "",
      content: r.content ? r.content.toString() : "",
      contentName: r.contentName || "",
      contentSlug: r.contentSlug || "",
      contentType: r.contentType || "product",
      rating: r.rating || 5,
      review: r.review || "",
      photos: Array.isArray(r.photos) ? r.photos : [],
      status: r.status || "pending",
      isActive: r.isActive !== false,
      isVerified: r.isVerified !== false,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error("[ERR GET /api/admin/customer-reviews]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customer reviews" },
      { status: 500 }
    );
  }
}
