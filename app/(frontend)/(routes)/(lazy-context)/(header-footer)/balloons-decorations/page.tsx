// config
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";

// requests
import { fetchContentCategoryPageData } from "@/request/categories/contentCategoryPageData";
import { fetchContentCategoryPageMeta } from "@/request/categories/contentCategoryPageMeta";

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
    const slug = "balloons-decorations";

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
    // Fallback metadata for balloons-decorations
    return {
        title: "Balloons Decorations Services | Fresh Decoration - Floriwish",
        description: "Transform your events with our professional balloon decoration services. Same-day booking available."
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
  const categorySlug = "balloons-decorations";
  let contentCategory = await fetchContentCategory(categorySlug);

  if (!contentCategory) {
    return notFound();
  }

  const breadcrumbsData: BreadcrumbsType[] = [
    {
      label: (contentCategory as ContentCategoryDocument)?.name || "Balloons Decorations",
      link: `/balloons-decorations`
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
