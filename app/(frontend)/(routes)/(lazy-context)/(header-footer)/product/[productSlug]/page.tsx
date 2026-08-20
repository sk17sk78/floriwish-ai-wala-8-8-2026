// constants
import { QUICK_BUILD } from "@/config/quickBuild";
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";

// vercel
export const dynamic =
  RENDERING_STRATEGY === "SSR" ? "force-dynamic" : undefined;
export const revalidate = 60;

// requests
import { fetchContents } from "@/request/content/contents";
import { fetchContentPageData } from "@/request/content/contentPageData";

// utils
import { createMetadata } from "@/common/utils/createMetadata";
import { notFound } from "next/navigation";
import { cache } from "react";

// components
import BodyWrapper from "@/components/(frontend)/components/wrapper/BodyWrapper";
import BreadcrumbsWrapper from "@/components/(_common)/Breadcrumbs/ContentCategoryBreadcrumbs";
import ContentPage from "@/components/pages/(frontend)/Content/ContentPage";

// types
import { type BreadcrumbsType } from "@/common/types/types";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type Metadata, type ResolvingMetadata } from "next";
import { type SEOMetaDocument } from "@/common/types/documentation/nestedDocuments/seoMeta";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// controllers
import { getProductSlugs, getFullProductData } from "@/app/api/frontend/content-page/controllers";

const getProduct = cache(async (slug: string) => {
  try {
    const data = await getFullProductData(slug);
    if (data) {
      return data as ContentDocument;
    }
    console.error(`❌ getFullProductData returned null for ${slug}`);
  } catch (error) {
    console.error(`❌ Error in getProduct cache wrapper for ${slug}:`, error);
    return null;
  }
  return null;
});

export async function generateStaticParams() {
  if (RENDERING_STRATEGY === "ISR") {
    try {
      const products = await getProductSlugs();

      if (!products) return [];

      const productSlugs: { productSlug: string }[] = products
        .slice(0, QUICK_BUILD ? 1 : products.length)
        .map(({ slug }) => ({
          productSlug: slug
        }));

      return productSlugs;
    } catch (error) {
      return [];
    }
  }

  return [];
}

export async function generateMetadata(
  {
    params
  }: {
    params: Promise<{ productSlug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const slug = (await params).productSlug;
    const product = await getProduct(slug);

    if (product) {
      const path = `${FRONTEND_LINKS.PRODUCT_PAGE.substring(1)}/${slug}`;
      const meta = product.seoMeta as SEOMetaDocument;
      
      // Safe image handling with null checks
      const primaryImage = product.media?.primary as ImageDocument;
      const galleryImages = product.media?.gallery as ImageDocument[];
      
      // Build images array safely
      const images: string[] = [];
      
      // Add primary image if exists
      if (primaryImage && primaryImage.url) {
        images.push(primaryImage.url);
      }
      
      // Add gallery images if exist
      if (Array.isArray(galleryImages)) {
        galleryImages.forEach(img => {
          if (img && img.url) {
            images.push(img.url);
          }
        });
      }

      return await createMetadata({
        path,
        meta,
        images,
        parent
      });
    }
  } catch (error) {
    return {} as Metadata;
  }

  return {} as Metadata;
}

export default async function ProductPageRoute({
  params: { productSlug }
}: {
  params: { productSlug: string };
}) {
  const product = await getProduct(productSlug);

  // @ts-ignore
  if (!product || product?.error) return notFound();

  const breadcrumbsData: BreadcrumbsType[] = [
    {
      label: (
        (product as ContentDocument).category.primary as ContentCategoryDocument
      ).name,
      link: `/${((product as ContentDocument).category.primary as ContentCategoryDocument).slug}`
    },
    { label: (product as ContentDocument).name, link: `${FRONTEND_LINKS.PRODUCT_PAGE}/${productSlug}` }
  ];

  const cleanProduct = JSON.parse(JSON.stringify(product)) as ContentDocument;

  return (
    <BodyWrapper>
      <BreadcrumbsWrapper
        breadcrumbs={breadcrumbsData}
        hideInMobile
        className={`relative grid grid-rows-[repeat(8,auto)] sm:grid-rows-[repeat(7,auto)] auto-rows-min grid-cols-1 sm:gap-x-5 gap-y-0`}
      >
        <ContentPage
          isProduct
          content={cleanProduct}
        />
      </BreadcrumbsWrapper>
    </BodyWrapper>
  );
}
