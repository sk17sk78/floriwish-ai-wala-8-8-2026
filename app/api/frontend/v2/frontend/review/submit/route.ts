import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      contentId,
      contentName,
      contentSlug,
      contentType = "product",
      customerName,
      customerCity,
      rating,
      review,
      photos = []
    } = body;

    // Validate required fields
    if (!contentId || !customerName || !customerCity || !rating || !review) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (contentId, customerName, customerCity, rating, review)"
        },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    let resolvedContentId = contentId;
    let resolvedContentName = contentName || "";
    let resolvedContentSlug = contentSlug || "";

    // If contentId is valid ObjectId, verify or enrich product info
    if (mongoose.Types.ObjectId.isValid(contentId)) {
      const contentDoc = await models.Contents.findById(contentId).select("name slug type");
      if (contentDoc) {
        resolvedContentName = resolvedContentName || contentDoc.name;
        resolvedContentSlug = resolvedContentSlug || contentDoc.slug;
      }
    } else {
      // If contentId was passed as a slug
      const contentDoc = await models.Contents.findOne({ slug: contentId }).select("_id name slug type");
      if (contentDoc) {
        resolvedContentId = contentDoc._id.toString();
        resolvedContentName = resolvedContentName || contentDoc.name;
        resolvedContentSlug = resolvedContentSlug || contentDoc.slug;
      }
    }

    const reviewDoc = {
      content: mongoose.Types.ObjectId.isValid(resolvedContentId)
        ? new mongoose.Types.ObjectId(resolvedContentId)
        : resolvedContentId,
      customer: new mongoose.Types.ObjectId(),
      contentName: resolvedContentName,
      contentSlug: resolvedContentSlug,
      contentType: contentType === "service" ? "service" : "product",
      customerName: customerName.trim(),
      customerCity: customerCity.trim(),
      rating: numRating,
      review: review.trim(),
      photos: Array.isArray(photos) ? photos : [],
      status: "pending",
      isActive: true,
      isDeleted: false,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const inserted = await mongoose.connection.db!.collection("reviews").insertOne(reviewDoc);

    return NextResponse.json({
      success: true,
      message: "Your review has been submitted successfully! It will appear on the product page once approved by our team.",
      reviewId: inserted.insertedId.toString()
    });
  } catch (error: any) {
    console.error("[ERR POST /api/frontend/v2/frontend/review/submit]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
