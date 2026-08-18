import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key")?.trim() || "";

    if (!key || key.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectDB();
    const { Contents, ContentCategories } = models;

    // Create regex for key and words
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regexKey = new RegExp(safeKey, "i");
    const words = key.split(/\s+/).filter((w) => w.length > 2);
    const regexWords = words.map(
      (w) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    );

    // 1. Find actual matching active products for this search key
    const productQuery: any = {
      isActive: true,
      $or: [
        { name: regexKey },
        { "tag.searchTags.name": regexKey },
        { slug: regexKey },
        ...regexWords.map((r) => ({ name: r })),
        ...regexWords.map((r) => ({ "tag.searchTags.name": r }))
      ]
    };

    const matchedProducts = await Contents.find(productQuery)
      .select("category")
      .lean()
      .limit(300);

    if (!matchedProducts || matchedProducts.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Extract real category IDs and count occurrences
    const categoryCounts = new Map<string, number>();

    for (const product of matchedProducts as any[]) {
      if (product.category?.primary) {
        const idStr = String(product.category.primary);
        categoryCounts.set(idStr, (categoryCounts.get(idStr) || 0) + 2); // Primary gets weight 2
      }
      if (Array.isArray(product.category?.related)) {
        for (const relId of product.category.related) {
          if (relId) {
            const idStr = String(relId);
            categoryCounts.set(idStr, (categoryCounts.get(idStr) || 0) + 1);
          }
        }
      }
    }

    const uniqueCatIds = Array.from(categoryCounts.keys());
    if (uniqueCatIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Fetch ONLY real, active categories that contain these products
    const liveCategories = await ContentCategories.find({
      _id: { $in: uniqueCatIds },
      isActive: true
    })
      .select("name slug")
      .lean();

    if (!liveCategories || liveCategories.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 4. Sort categories by product density and relevance
    const results = liveCategories.map((cat: any) => ({
      name: cat.name,
      slug: cat.slug.replace(/^\//, ""),
      count: categoryCounts.get(String(cat._id)) || 0
    }));

    results.sort((a, b) => {
      // If a category name directly matches the search keyword, give it top priority
      const aNameMatch = a.name.toLowerCase().includes(key.toLowerCase()) ? 100 : 0;
      const bNameMatch = b.name.toLowerCase().includes(key.toLowerCase()) ? 100 : 0;
      return (b.count + bNameMatch) - (a.count + aNameMatch);
    });

    return NextResponse.json({
      success: true,
      data: results.slice(0, 15).map(({ name, slug }) => ({ name, slug }))
    });
  } catch (error: any) {
    console.error("[search/categories] error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
