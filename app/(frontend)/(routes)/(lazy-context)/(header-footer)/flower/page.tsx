// config
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";

// ISR: cache karo — SSR: har request pe fresh
export const dynamic =
  RENDERING_STRATEGY === "SSR" ? "force-dynamic" : undefined;

// requests
import { fetchContentCategoryPageData } from "@/request/categories/contentCategoryPageData";
import { fetchContentCategoryPageMeta } from "@/request/categories/contentCategoryPageMeta";

// utils
import { createMetadata } from "@/common/utils/createMetadata";
import { notFound } from "next/navigation";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

// components
import BodyWrapper from "@/components/(frontend)/components/wrapper/BodyWrapper";
import BreadcrumbsWrapper from "@/components/(_common)/Breadcrumbs/ContentCategoryBreadcrumbs";
import CategoryPage from "@/components/pages/(frontend)/category/CategoryPage";

// types
import { type BannerImageDocument } from "@/common/types/documentation/nestedDocuments/bannerImage";
import { type BreadcrumbsType } from "@/common/types/types";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type Metadata, type ResolvingMetadata } from "next";
import { type SEOMetaDocument } from "@/common/types/documentation/nestedDocuments/seoMeta";
import { type ContentDocument } from "@/common/types/documentation/contents/content";

const RELATED_SLUGS = [
  "red-rose",
  "pink-rose",
  "yellow-rose",
  "carnations-flower",
  "lily-flower",
  "gerberas-flower",
  "orchids-flower",
  "white-rose"
];

// controllers
import { getMeta } from "@/app/api/frontend/content-category-page/controllers";
import { getCategoryData } from "@/app/api/frontend/v2/frontend/content-category/[slug]/controller";

export async function generateMetadata(
  {
    params
  }: {
    params: Promise<{}>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const slug = "flower";

    const data = await getMeta({ slug });

    if (data) {
      const path = slug;
      const meta = data.seo?.meta as SEOMetaDocument;
      const images = [
        ...((
          data.media?.banner?.images as BannerImageDocument[]
        )?.flatMap(({ desktop, mobile }) => [
          (desktop as ImageDocument).url,
          (mobile as ImageDocument).url
        ]) || []),
        (data.media?.icon as ImageDocument).url
      ];

      return await createMetadata({
        path,
        meta,
        images,
        parent
      });
    }
  } catch (error) {
    // Fallback metadata for flowers
    return {
        title: "Online Flower Delivery | Fresh Flower Bouquets - Floriwish",
        description: "Order fresh flower bouquets online from Floriwish. Same-day and midnight delivery of roses, lilies, orchids and more."
    } as Metadata;
  }

  return {} as Metadata;
}

async function fetchContentCategory(slug: string) {
  try {
    const data = await getCategoryData(slug);

    if (data) {
      return data as ContentCategoryDocument;
    }
  } catch (error) {
    return null;
  }

  return null;
}

export default async function page() {
  const categorySlug = "flower";

  // Check if flower category is explicitly deactivated in the database
  // try-catch: build time pe SSL drop ho sakta hai, crash nahi hona chahiye
  try {
    await connectDB();
    const dbCategory = await models.ContentCategories.findOne({ slug: categorySlug }).select("isActive");
    if (dbCategory && dbCategory.isActive === false) {
      return notFound();
    }
  } catch (err) {
    // DB connection failed at build time — continue with data fetch
    console.warn("[flower] DB isActive check failed, continuing:", err);
  }

  let contentCategory = await fetchContentCategory(categorySlug);

  // If flowers category is missing or has no products, try aggregating from sub-categories
  if (!contentCategory || !contentCategory._page?.contents?.length) {
    
    // Fetch data for all related categories
    const responses = await Promise.all(
        RELATED_SLUGS.map(slug => fetchContentCategory(slug))
    );
    
    const validCategories = responses.filter(c => c !== null) as ContentCategoryDocument[];
    
    if (validCategories.length === 0 && !contentCategory) {
        return notFound();
    }

    // Use the first valid category as a base or create a virtual one
    const baseCategory = contentCategory || validCategories[0];
    
    // Aggregate products
    const allProducts: ContentDocument[] = [];
    const productIds = new Set<string>();
    
    validCategories.forEach(cat => {
        cat._page?.contents?.forEach(prod => {
            const pid = String(prod._id);
            if (!productIds.has(pid)) {
                productIds.add(pid);
                allProducts.push(prod);
            }
        });
    });

    // Sort aggregated products by popularity (matching controller logic)
    allProducts.sort((a, b) => 
        (b._listItemData?.ratingValue || 0) * (b._listItemData?.ratingCount || 1) -
        (a._listItemData?.ratingValue || 0) * (a._listItemData?.ratingCount || 1)
    );

    // Create a virtual contentCategory object
    contentCategory = {
        ...baseCategory,
        name: "Flowers",
        slug: "flower",
        _page: {
            ...baseCategory._page,
            contentCount: allProducts.length,
            contents: allProducts.slice(0, 32), // Initial batch
        }
    } as ContentCategoryDocument;
  }

  const breadcrumbsData: BreadcrumbsType[] = [
    {
      label: (contentCategory as ContentCategoryDocument)?.name || "Flowers",
      link: `/flower`
    }
  ];

  return (
    <BodyWrapper>
      <BreadcrumbsWrapper
        breadcrumbs={breadcrumbsData}
        className={`relative grid grid-rows-[repeat(8,auto)] sm:grid-rows-[repeat(7,auto)] auto-rows-min grid-cols-1 sm:gap-x-5 gap-y-0`}
      >
        <CategoryPage
          breadcrumbs={breadcrumbsData}
          category={contentCategory}
        />
      </BreadcrumbsWrapper>
    </BodyWrapper>
  );
}
