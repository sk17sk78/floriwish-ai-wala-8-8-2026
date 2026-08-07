// config
import { QUICK_BUILD } from "@/config/quickBuild";
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";

// vercel
export const dynamic =
  RENDERING_STRATEGY === "SSR" ? "force-dynamic" : undefined;

// controllers (Slugs and Meta)
import { getContentCategoryPageSlugs, getMeta } from "@/app/api/frontend/content-category-page/controllers";

// utils
import { createMetadata } from "@/common/utils/createMetadata";
import { notFound } from "next/navigation";

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

export async function generateStaticParams() {
  if (RENDERING_STRATEGY === "ISR") {
    try {
      const contentCategories = await getContentCategoryPageSlugs();

      if (!contentCategories) return [];

      const contentCategorySlugs: { categorySlug: string }[] = contentCategories
        .slice(0, QUICK_BUILD ? 1 : contentCategories.length)
        .map(({ slug }) => ({
          categorySlug: slug
        }));
      return contentCategorySlugs;
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
    params: Promise<{ categorySlug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const slug = (await params).categorySlug;

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
    return {} as Metadata;
  }

  return {} as Metadata;
}

// controllers
import { getCategoryData } from "@/app/api/frontend/v2/frontend/content-category/[slug]/controller";

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

export default async function page({
  params: { categorySlug }
}: {
  params: { categorySlug: string };
}) {
  let contentCategory = await fetchContentCategory(categorySlug);

  if (!contentCategory) {
    return notFound();
  }

  const breadcrumbsData: BreadcrumbsType[] = [
    {
      label: (contentCategory as ContentCategoryDocument)?.name || "",
      link: `/${categorySlug}`
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
