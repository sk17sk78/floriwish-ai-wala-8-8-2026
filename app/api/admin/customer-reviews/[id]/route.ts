import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// PUT update review (approve, reject, edit details)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const db = mongoose.connection.db!;

    const body = await req.json();
    const {
      status,
      customerName,
      customerCity,
      rating,
      review,
      photos,
      isActive,
      isVerified
    } = body;

    const updateData: any = { updatedAt: new Date() };

    if (status !== undefined) updateData.status = status;
    if (customerName !== undefined) updateData.customerName = customerName.trim();
    if (customerCity !== undefined) updateData.customerCity = customerCity.trim();
    if (rating !== undefined) updateData.rating = Number(rating);
    if (review !== undefined) updateData.review = review.trim();
    if (photos !== undefined) updateData.photos = photos;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified);

    const query: any = mongoose.Types.ObjectId.isValid(id)
      ? { _id: new mongoose.Types.ObjectId(id) }
      : { _id: id };

    const result = await db.collection("reviews").findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Review ${status ? `marked as ${status}` : "updated successfully"}`,
      review: result
    });
  } catch (error: any) {
    console.error("[ERR PUT /api/admin/customer-reviews/[id]]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE review permanently
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const db = mongoose.connection.db!;

    const query: any = mongoose.Types.ObjectId.isValid(id)
      ? { _id: new mongoose.Types.ObjectId(id) }
      : { _id: id };

    const result = await db.collection("reviews").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error: any) {
    console.error("[ERR DELETE /api/admin/customer-reviews/[id]]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
