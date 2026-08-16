import { del, delMany, set, get } from "@/db/redis/methods";
import { revalidateTag } from "next/cache";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { getHomepageLayoutsFromDB } from "@/app/api/frontend/homepage/controllers";

export interface IRevalidateModuleParams {
  module:
    | "product"
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "blog"
    | "city"
    | "banner"
    | "categoryBanner"
    | "homepage"
    | "header"
    | "footer"
    | "catalogueCategories"
    | "coupon"
    | "addon"
    | "search"
    | "setting"
    | "dynamicPage"
    | "servicePage";
  slug?: string;
  categorySlug?: string;
  topicSlug?: string;
  subTopicSlug?: string;
  subSubTopicSlug?: string;
  subSubSubTopicSlug?: string;
}

export const revalidateSingleModule = async (
  params: IRevalidateModuleParams
): Promise<{ success: boolean; message: string; clearedKeysCount: number }> => {
  const {
    module,
    slug,
    categorySlug,
    topicSlug,
    subTopicSlug,
    subSubTopicSlug,
    subSubSubTopicSlug
  } = params;

  let clearedKeysCount = 0;
  const exactKeysToClear: string[] = [];
  const prefixesToClear: string[] = [];
  const nextTagsToRevalidate: string[] = [];

  switch (module) {
    case "product": {
      if (slug) {
        exactKeysToClear.push(
          `content_page_${slug}`,
          `content_page_meta_${slug}`,
          `content_page_reference_${slug}`,
          `content_page_addons_${slug}`,
          `content_page_availability_${slug}`,
          `content_page_coupons_${slug}`,
          `content_page_customization_${slug}`,
          `content_page_image_${slug}`,
          `v2_content_page_${slug}`,
          `product_${slug}`,
          "search_active_products_catalog",
          "search",
          "sitemap_products",
          "google_merchant_center_products_feed_v1"
        );
        prefixesToClear.push(`content_page_${slug}`, `v2_content_page_${slug}`, "search_contents_", "search-contents-");
        nextTagsToRevalidate.push(`content_page_${slug}`, `product_${slug}`);
      } else {
        prefixesToClear.push("content_page_", "product_", "search_contents_", "search-contents-");
        exactKeysToClear.push("sitemap_products", "google_merchant_center_products_feed_v1", "search_active_products_catalog", "search");
      }
      break;
    }

    case "category1": {
      if (slug) {
        exactKeysToClear.push(
          `content_category_page_${slug}`,
          `content_category_page_v4_${slug}`,
          `content_category_page_meta_${slug}`,
          `content_category_page_contents_${slug}`,
          `v2_content_category_${slug}`,
          `category_banners_${slug}`,
          "sitemap_categories"
        );
        prefixesToClear.push(`content_category_page_${slug}`, `v2_content_category_${slug}`);
        nextTagsToRevalidate.push(`content_category_page_${slug}`, `category_${slug}`);
      } else {
        prefixesToClear.push("content_category_page_", "v2_content_category_");
        exactKeysToClear.push("sitemap_categories", "category_banners_active_all");
      }
      break;
    }

    case "category2": {
      const fullPath = [categorySlug, topicSlug].filter(Boolean).join("_");
      if (fullPath) {
        exactKeysToClear.push(
          `topic_page_${fullPath}`,
          `topic_page_meta_${fullPath}`,
          `topic_page_contents_${fullPath}`,
          "sitemap_topics"
        );
        prefixesToClear.push(`topic_page_${fullPath}`);
        nextTagsToRevalidate.push(`topic_page_${fullPath}`);
      } else {
        prefixesToClear.push("topic_page_");
        exactKeysToClear.push("sitemap_topics");
      }
      break;
    }

    case "category3": {
      const fullPath = [categorySlug, topicSlug, subTopicSlug].filter(Boolean).join("_");
      if (fullPath) {
        exactKeysToClear.push(
          `sub_topic_page_${fullPath}`,
          `sub_topic_page_meta_${fullPath}`,
          `sub_topic_page_contents_${fullPath}`,
          "sitemap_sub_topics"
        );
        prefixesToClear.push(`sub_topic_page_${fullPath}`);
        nextTagsToRevalidate.push(`sub_topic_page_${fullPath}`);
      } else {
        prefixesToClear.push("sub_topic_page_");
        exactKeysToClear.push("sitemap_sub_topics");
      }
      break;
    }

    case "category4": {
      const fullPath = [categorySlug, topicSlug, subTopicSlug, subSubTopicSlug].filter(Boolean).join("_");
      if (fullPath) {
        exactKeysToClear.push(
          `sub_sub_topic_page_${fullPath}`,
          `sub_sub_topic_page_meta_${fullPath}`,
          `sub_sub_topic_page_contents_${fullPath}`
        );
        prefixesToClear.push(`sub_sub_topic_page_${fullPath}`);
        nextTagsToRevalidate.push(`sub_sub_topic_page_${fullPath}`);
      } else {
        prefixesToClear.push("sub_sub_topic_page_");
      }
      break;
    }

    case "category5": {
      const fullPath = [categorySlug, topicSlug, subTopicSlug, subSubTopicSlug, subSubSubTopicSlug].filter(Boolean).join("_");
      if (fullPath) {
        exactKeysToClear.push(
          `sub_sub_sub_topic_page_${fullPath}`,
          `sub_sub_sub_topic_page_meta_${fullPath}`,
          `sub_sub_sub_topic_page_contents_${fullPath}`
        );
        prefixesToClear.push(`sub_sub_sub_topic_page_${fullPath}`);
        nextTagsToRevalidate.push(`sub_sub_sub_topic_page_${fullPath}`);
      } else {
        prefixesToClear.push("sub_sub_sub_topic_page_");
      }
      break;
    }

    case "blog": {
      if (slug) {
        exactKeysToClear.push(
          `blog_${slug}`,
          `blog_meta_${slug}`,
          `blog_article_page_${slug}`,
          `blog_article_page_meta_${slug}`,
          "blogs_active_all",
          "sitemap_blogs"
        );
        prefixesToClear.push(`blog_${slug}`, `blog_article_page_${slug}`);
        nextTagsToRevalidate.push(`blog_${slug}`);
      } else {
        prefixesToClear.push("blog_", "blog_article_page_");
        exactKeysToClear.push("blogs_active_all", "blog_authors_all", "blog_categories_all", "sitemap_blogs");
      }
      break;
    }

    case "city": {
      if (slug) {
        exactKeysToClear.push(`city_${slug}`, "location_presets", "cities_active_all");
      } else {
        prefixesToClear.push("city_");
        exactKeysToClear.push("location_presets", "cities_active_all");
      }
      break;
    }

    case "banner":
    case "categoryBanner": {
      prefixesToClear.push("category_banners_", "global_category_banners_");
      exactKeysToClear.push("category_banners_active_all", "homepage");
      break;
    }

    case "homepage": {
      exactKeysToClear.push("homepage", "homepage_meta");
      prefixesToClear.push("homepage_layout_");
      nextTagsToRevalidate.push("homepage");
      break;
    }

    case "header": {
      exactKeysToClear.push("header", "catalogue_categories");
      nextTagsToRevalidate.push("header");
      break;
    }

    case "footer": {
      exactKeysToClear.push("footer");
      nextTagsToRevalidate.push("footer");
      break;
    }

    case "catalogueCategories": {
      exactKeysToClear.push("catalogue_categories", "header");
      nextTagsToRevalidate.push("catalogue_categories");
      break;
    }

    case "coupon": {
      exactKeysToClear.push("coupons_active_all");
      prefixesToClear.push("content_page_coupons_");
      break;
    }

    case "addon": {
      exactKeysToClear.push("addons_active_all");
      prefixesToClear.push("content_page_addons_");
      break;
    }

    case "search": {
      exactKeysToClear.push("search_initial_load", "search_ai_tag", "search_content_category", "search_trending_keyword", "search_active_products_catalog", "search");
      prefixesToClear.push("search_", "search-contents-", "search_contents_");
      break;
    }

    case "setting": {
      exactKeysToClear.push("setting", "header", "footer", "homepage_meta");
      break;
    }

    case "dynamicPage":
    case "servicePage": {
      if (slug) {
        exactKeysToClear.push(`dynamic_page_${slug}`, `dynamic_page_meta_${slug}`, `service_page_${slug}`, "sitemap_dynamic_pages", "sitemap_services");
        prefixesToClear.push(`dynamic_page_${slug}`);
      } else {
        prefixesToClear.push("dynamic_page_");
        exactKeysToClear.push("sitemap_dynamic_pages", "sitemap_services");
      }
      break;
    }
  }

  // 1. Clear exact keys
  if (exactKeysToClear.length > 0) {
    await del({ keys: exactKeysToClear });
    clearedKeysCount += exactKeysToClear.length;
  }

  // 2. Clear prefixes
  for (const prefix of prefixesToClear) {
    await delMany({ prefix });
  }

  // 3. Revalidate Next.js cache tags
  for (const tag of nextTagsToRevalidate) {
    try {
      revalidateTag(tag);
    } catch {}
  }

  // 4. Re-warm module if needed
  try {
    await connectDB();
    const { HomepageLayouts, CatalogueCategories, GlobalCategoryBanners, Cities, Coupons, Addons } = models;

    if (module === "homepage") {
      const layouts = await getHomepageLayoutsFromDB();
      if (layouts && layouts.length > 0) {
        await set({ key: "homepage", value: layouts });
      }
    } else if (module === "header" || module === "catalogueCategories") {
      if (CatalogueCategories) {
        const catalogueList = await CatalogueCategories.find({ isActive: true }).lean();
        await set({ key: "catalogue_categories", value: catalogueList, ttl: 86400 });
      }
    } else if (module === "categoryBanner" || module === "banner") {
      if (GlobalCategoryBanners) {
        const banners = await GlobalCategoryBanners.find({ isActive: true }).lean();
        await set({ key: "category_banners_active_all", value: banners, ttl: 86400 });
      }
    } else if (module === "city" && Cities) {
      const cities = await Cities.find({ isActive: true }).select("name slug state pincodes").lean();
      await set({ key: "location_presets", value: cities, ttl: 86400 });
      await set({ key: "cities_active_all", value: cities, ttl: 86400 });
    } else if (module === "coupon" && Coupons) {
      const coupons = await Coupons.find({ isActive: true }).lean();
      await set({ key: "coupons_active_all", value: coupons, ttl: 86400 });
    } else if (module === "addon" && Addons) {
      const addons = await Addons.find({ isActive: true }).lean();
      await set({ key: "addons_active_all", value: addons, ttl: 86400 });
    }
  } catch (err) {
    console.warn("Module re-warm warning", err);
  }

  return {
    success: true,
    message: `Cache for ${module}${slug ? ` (${slug})` : ""} refreshed successfully.`,
    clearedKeysCount
  };
};
