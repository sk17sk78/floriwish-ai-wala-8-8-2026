import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { HomepageLayouts } = models;

/**
 * GET /api/frontend/homepage/text-content?id=<layoutId>
 *
 * Returns raw text content for a single homepage layout.
 * This endpoint exists to avoid passing large HTML strings (>30 KB) through
 * the Next.js 14 RSC payload, which causes ec() recursive String.replace
 * stack overflow when serialising strings containing < > & characters.
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await connectDB();

    const doc = await HomepageLayouts.findById(id).select("layout.text").lean();

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const text = (doc as any)?.layout?.text ?? "";

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
