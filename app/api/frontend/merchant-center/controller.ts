import { DOMAIN } from "@/common/constants/domain";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { MerchantCenterProductsType } from "@/common/types/merchantCenter";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { Contents } = models;

/**
 * Maps internal category names to Google Product Categories
 * 166: Flowers & Plants > Flowers
 * 5420: Food, Beverages & Tobacco > Food Items > Bakery > Cakes
 * 5421: Home & Garden > Decor > Seasonal & Holiday Decorations > Gift Baskets
 */
function getGoogleCategory(categoryName: string): string {
    const name = (categoryName || "").toLowerCase();
    if (name.includes("flower") || name.includes("bouquet") || name.includes("rose") || name.includes("plant")) return "166";
    if (name.includes("cake") || name.includes("bakery")) return "5420";
    if (name.includes("gift") || name.includes("combo") || name.includes("hamper")) return "5421";
    return "166"; // Default
}

export const getMerchantCenterData = async (): Promise<MerchantCenterProductsType[]> => {
    try {
        await connectDB();

        const products = await Contents.find({
            isActive: true,
            type: "product"
        })
            .select([
                "sku",
                "name",
                "seoMeta.description",
                "slug",
                "price.base.mrp",
                "price.base.price",
                "updatedAt",
                "category.primary"
            ])
            .populate([
                { path: "media.primary", select: "url" },
                { path: "category.primary", select: "name" }
            ])
            .sort({ name: 1 });

        if (!products) {
            return [];
        }

        const data: MerchantCenterProductsType[] = products.map((p: any) => {
            const categoryName = p.category?.primary?.name || "";
            
            return {
                id: p.sku, // Use full SKU for consistency
                title: (p.name || "").replace(/\t/g, ' ').replace(/\n/g, ' ').trim(),
                description: (p.seoMeta?.description || p.name || "Product Description").replace(/\t/g, ' ').replace(/\n/g, ' ').trim(),
                link: `${DOMAIN}${FRONTEND_LINKS.PRODUCT_PAGE}/${p.slug}`,
                image_link: (p.media.primary as ImageDocument)?.url || "",
                price: `${(p.price as ContentPriceDocument)?.base.price || 0}.00 INR`,
                availability: "in stock",
                brand: "Floriwish",
                condition: "new",
                identifier_exists: "no",
                google_product_category: getGoogleCategory(categoryName),
                shipping: "IN::Standard:0.00 INR",
                store_code: "MAIN" // Placeholder store code to help with local inventory matching
            };
        });

        return data;

    } catch (error: any) {
        console.error("Error generating GMC data:", error);
        return [];
    }
};
