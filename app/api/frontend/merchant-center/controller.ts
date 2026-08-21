import { DOMAIN } from "@/common/constants/domain";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { MerchantCenterProductsType } from "@/common/types/merchantCenter";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

const { Contents } = models;

const GMC_CACHE_KEY = "google_merchant_center_products_feed_v2";

/**
 * Maps internal category & product names to official Google Product Taxonomy IDs
 * 166: Home & Garden > Plants > Flowers
 * 5420: Food, Beverages & Tobacco > Food Items > Bakery > Cakes
 * 5421: Home & Garden > Decor > Seasonal & Holiday Decorations > Gift Baskets
 * 188: Apparel & Accessories > Jewelry
 */
function getGoogleCategory(categoryName: string, productName: string): string {
    const combined = `${categoryName || ""} ${productName || ""}`.toLowerCase();
    
    if (combined.includes("kalire") || combined.includes("jeweller") || combined.includes("varmala") || combined.includes("jaimala")) {
        return "188"; // Jewelry / Wedding accessories
    }
    if (combined.includes("cake") || combined.includes("bakery") || combined.includes("pastry") || combined.includes("bento")) {
        return "5420"; // Bakery & Cakes
    }
    if (combined.includes("balloon") || combined.includes("decor") || combined.includes("gift") || combined.includes("combo") || combined.includes("hamper") || combined.includes("teddy")) {
        return "5421"; // Decorations & Gift Baskets
    }
    if (combined.includes("flower") || combined.includes("bouquet") || combined.includes("rose") || combined.includes("orchid") || combined.includes("lily") || combined.includes("plant")) {
        return "166"; // Plants & Flowers
    }
    return "166"; // Default standard
}

function cleanText(text: string | undefined | null, maxLength = 150): string {
    if (!text) return "";
    return text
        .replace(/<[^>]*>?/gm, " ") // remove HTML tags
        .replace(/[\t\r\n]+/g, " ")  // replace tabs and linebreaks
        .replace(/\s+/g, " ")        // collapse multiple spaces
        .trim()
        .slice(0, maxLength);
}

export const getMerchantCenterData = async (): Promise<MerchantCenterProductsType[]> => {
    try {
        const canonicalDomain = DOMAIN && !DOMAIN.includes("localhost") ? DOMAIN.replace(/\/+$/, "") : "https://floriwish.com";

        // 1. Try Redis cache first (instant response for GMC crawlers)
        const cachedData = await getFromRedis<MerchantCenterProductsType[]>({
            key: GMC_CACHE_KEY
        });

        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
            return cachedData;
        }

        await connectDB();

        // 2. Fetch active products using aggregation pipeline
        const products = await Contents.aggregate([
            { $match: { isActive: true, type: { $in: ["product", "service"] } } },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: "images",
                    localField: "media.primary",
                    foreignField: "_id",
                    as: "primaryImage",
                    pipeline: [{ $project: { url: 1, _id: 0 } }]
                }
            },
            {
                $lookup: {
                    from: "contentcategories",
                    localField: "category.primary",
                    foreignField: "_id",
                    as: "primaryCategory",
                    pipeline: [{ $project: { name: 1, _id: 0 } }]
                }
            },
            {
                $project: {
                    sku: 1,
                    name: 1,
                    slug: 1,
                    seoDescription: "$seoMeta.description",
                    price: "$price.base.price",
                    mrp: "$price.base.mrp",
                    imageUrl: { $arrayElemAt: ["$primaryImage.url", 0] },
                    categoryName: { $arrayElemAt: ["$primaryCategory.name", 0] }
                }
            }
        ]);

        if (!products || products.length === 0) {
            return [];
        }

        const data: MerchantCenterProductsType[] = products.map((p: any) => {
            const categoryName = p.categoryName || "";
            const rawImageUrl = p.imageUrl || "";
            const imageUrl = rawImageUrl
                ? convertToCloudFrontUrl(rawImageUrl.startsWith("http") ? rawImageUrl : `${canonicalDomain}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`)
                : `${canonicalDomain}/placeholders/product.webp`;

            const rawPrice = Number(p.price || p.mrp || 0);
            const priceFormatted = `${rawPrice.toFixed(2)} INR`;

            const skuId = String(p.sku || p._id || p.slug);
            const title = cleanText(p.name, 150);
            const description = cleanText(p.seoDescription || p.name || "Floriwish online flower, cake and gift delivery", 5000);
            const productLink = `${canonicalDomain}/product/${p.slug.replace(/^\/+/, "")}`;

            return {
                id: skuId,
                title: title,
                description: description,
                link: productLink,
                image_link: imageUrl,
                price: priceFormatted,
                availability: "in_stock",
                brand: "Floriwish",
                condition: "new",
                identifier_exists: "no",
                google_product_category: getGoogleCategory(categoryName, p.name),
                shipping: "IN::Standard:0.00 INR",
                store_code: "MAIN"
            };
        });

        // 3. Save to Redis with 6 hours TTL
        await setToRedis({
            key: GMC_CACHE_KEY,
            value: data,
            ttl: 21600 // 6 hours
        });

        return data;

    } catch (error: any) {
        console.error("Error generating GMC data:", error);
        return [];
    }
};
