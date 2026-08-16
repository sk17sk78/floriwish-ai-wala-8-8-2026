import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const {
      ContentCategories,
      Topics,
      SubTopics,
      SubSubTopics,
      SubSubSubTopics,
      CatalogueCategories,
      AddonCategories
    } = models;

    const url = new URL(req.url);
    const query = (url.searchParams.get("q") || "").trim();
    const level = (url.searchParams.get("level") || "all").toLowerCase();
    const limit = parseInt(url.searchParams.get("limit") || "10000", 10);

    const filter: any = { isActive: { $ne: false } };
    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      const termRegexes = terms.map(
        (t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      );

      filter.$and = termRegexes.map((r) => ({
        $or: [{ name: r }, { slug: r }]
      }));
    }

    const selectFields = "name slug category topic subTopic subSubTopic _id";

    // Query across Category 1, 2, 3, 4, 5, Mobile Categories and Addons with hierarchy populated
    const [
      contentCats,
      topics,
      subTopics,
      subSubTopics,
      subSubSubTopics,
      catalogueCats,
      addonCats
    ] = await Promise.all([
      (level === "all" || level === "category1") && ContentCategories
        ? ContentCategories.find(filter).select(selectFields).limit(limit).lean()
        : [],
      (level === "all" || level === "category2") && Topics
        ? Topics.find(filter).select(selectFields).populate("category", "name slug").limit(limit).lean()
        : [],
      (level === "all" || level === "category3") && SubTopics
        ? SubTopics.find(filter)
            .select(selectFields)
            .populate("category", "name slug")
            .populate("topic", "name slug")
            .limit(limit)
            .lean()
        : [],
      (level === "all" || level === "category4") && SubSubTopics
        ? SubSubTopics.find(filter)
            .select(selectFields)
            .populate("category", "name slug")
            .populate("topic", "name slug")
            .populate("subTopic", "name slug")
            .limit(limit)
            .lean()
        : [],
      (level === "all" || level === "category5") && SubSubSubTopics
        ? SubSubSubTopics.find(filter)
            .select(selectFields)
            .populate("category", "name slug")
            .populate("topic", "name slug")
            .populate("subTopic", "name slug")
            .populate("subSubTopic", "name slug")
            .limit(limit)
            .lean()
        : [],
      (level === "all" || level === "catalogue") && CatalogueCategories
        ? CatalogueCategories.find(filter).select(selectFields).limit(limit).lean()
        : [],
      (level === "all" || level === "addon") && AddonCategories
        ? AddonCategories.find(filter).select(selectFields).limit(limit).lean()
        : []
    ]);

    const formattedList = [
      ...contentCats.map((c: any) => ({
        id: String(c._id),
        name: c.name?.trim(),
        slug: c.slug,
        fullPath: `/${c.slug}`,
        level: 1,
        type: "category1",
        typeLabel: "Category 1"
      })),
      ...topics.map((c: any) => {
        const catName = c.category?.name?.trim() || "";
        const catSlug = c.category?.slug || "";
        const displayName = catName ? `${catName} > ${c.name?.trim()}` : c.name?.trim();
        const fullPath = catSlug ? `/${catSlug}/${c.slug}` : `/${c.slug}`;
        return {
          id: String(c._id),
          name: displayName,
          rawName: c.name?.trim(),
          slug: c.slug,
          fullPath,
          level: 2,
          type: "category2",
          typeLabel: "Category 2"
        };
      }),
      ...subTopics.map((c: any) => {
        const catName = c.category?.name?.trim() || "";
        const topName = c.topic?.name?.trim() || "";
        const catSlug = c.category?.slug || "";
        const topSlug = c.topic?.slug || "";
        const displayName = [catName, topName, c.name?.trim()].filter(Boolean).join(" > ");
        const fullPath = `/${[catSlug, topSlug, c.slug].filter(Boolean).join("/")}`;
        return {
          id: String(c._id),
          name: displayName,
          rawName: c.name?.trim(),
          slug: c.slug,
          fullPath,
          level: 3,
          type: "category3",
          typeLabel: "Category 3"
        };
      }),
      ...subSubTopics.map((c: any) => {
        const catName = c.category?.name?.trim() || "";
        const topName = c.topic?.name?.trim() || "";
        const subName = c.subTopic?.name?.trim() || "";
        const displayName = [catName, topName, subName, c.name?.trim()].filter(Boolean).join(" > ");
        return {
          id: String(c._id),
          name: displayName,
          rawName: c.name?.trim(),
          slug: c.slug,
          level: 4,
          type: "category4",
          typeLabel: "Category 4"
        };
      }),
      ...subSubSubTopics.map((c: any) => {
        const catName = c.category?.name?.trim() || "";
        const topName = c.topic?.name?.trim() || "";
        const subName = c.subTopic?.name?.trim() || "";
        const subSubName = c.subSubTopic?.name?.trim() || "";
        const displayName = [catName, topName, subName, subSubName, c.name?.trim()].filter(Boolean).join(" > ");
        return {
          id: String(c._id),
          name: displayName,
          rawName: c.name?.trim(),
          slug: c.slug,
          level: 5,
          type: "category5",
          typeLabel: "Category 5"
        };
      }),
      ...catalogueCats.map((c: any) => ({
        id: String(c._id),
        name: c.name?.trim(),
        slug: c.slug,
        fullPath: `/catalogue/${c.slug}`,
        level: 6,
        type: "catalogue",
        typeLabel: "Mobile Category"
      })),
      ...addonCats.map((c: any) => ({
        id: String(c._id),
        name: c.name?.trim(),
        slug: c.slug,
        fullPath: `/addon/${c.slug}`,
        level: 7,
        type: "addon",
        typeLabel: "Addon Category"
      }))
    ];

    // Total category counts across all levels
    const [c1Count, c2Count, c3Count, c4Count, c5Count, catCount, addCount] = await Promise.all([
      ContentCategories ? ContentCategories.countDocuments({ isActive: true }) : 0,
      Topics ? Topics.countDocuments({ isActive: true }) : 0,
      SubTopics ? SubTopics.countDocuments({ isActive: true }) : 0,
      SubSubTopics ? SubSubTopics.countDocuments({ isActive: true }) : 0,
      SubSubSubTopics ? SubSubSubTopics.countDocuments({ isActive: true }) : 0,
      CatalogueCategories ? CatalogueCategories.countDocuments({ isActive: true }) : 0,
      AddonCategories ? AddonCategories.countDocuments({ isActive: true }) : 0
    ]);

    const totalCategoriesCount = c1Count + c2Count + c3Count + c4Count + c5Count + catCount + addCount;

    return NextResponse.json({
      success: true,
      categories: formattedList,
      totalCount: totalCategoriesCount,
      summary: {
        category1: c1Count,
        category2: c2Count,
        category3: c3Count,
        category4: c4Count,
        category5: c5Count,
        catalogue: catCount,
        addon: addCount
      }
    });
  } catch (error: any) {
    console.error("[ERR Category Search API]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
