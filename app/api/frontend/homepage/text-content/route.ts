import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { HomepageLayouts } = models;

// In-memory L1 cache: keyed by layoutId or "__default__"
const textCache = new Map<string, { text: string; ts: number }>();
const L1_TTL_MS = 120 * 1000; // 120 seconds

/**
 * GET /api/frontend/homepage/text-content?id=<layoutId>
 *
 * Returns raw text content for a single homepage layout.
 * If id is omitted, returns the primary text layout content or empty string with 200 OK.
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const cacheKey = id || "__default__";
    const now = Date.now();

    // L1 in-memory cache hit
    const cached = textCache.get(cacheKey);
    if (cached && now - cached.ts < L1_TTL_MS) {
      return new NextResponse(cached.text, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
          "X-Cache": "HIT"
        }
      });
    }

    await connectDB();

    let doc: any = null;
    if (id) {
      doc = await HomepageLayouts.findById(id).select("layout.text").lean();
    } else {
      doc = await HomepageLayouts.findOne({ type: "text", isActive: true }).select("layout.text").lean();
    }

    const text = doc?.layout?.text ?? "";
    textCache.set(cacheKey, { text, ts: now });

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
        "X-Cache": "MISS"
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

