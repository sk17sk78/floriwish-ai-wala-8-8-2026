"use client";

// decorators
import { BASE_HOME_BG_COLOR } from "../Home/static/pallette";

// constants
import {
  DOMAIN,
} from "@/common/constants/environmentVariables";

// utils
import { memo } from "react";

// hooks
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import CategoryBannerSection from "@/components/(frontend)/category/components/banner/CategoryBannerSection";
import CategoryBottomContentSection from "@/components/(frontend)/category/components/textContent/CategoryBottomContentSection";
import CategoryContents from "@/components/pages/(frontend)/category/components/CategoryContents";
import CategoryContentCountSort from "@/components/(frontend)/category/components/CategoryContentCountSort";
import CategoryFAQSection from "@/components/(frontend)/category/components/faq/CategoryFAQSection";
import CategoryQuickLinkSection from "@/components/(frontend)/category/components/quickLink/CategoryQuickLinksSection";
import CategoryRelatedCategorySection from "@/components/(frontend)/category/components/relatedCategory/CategoryRelatedCategorySection";
import CategoryReviewSection from "@/components/(frontend)/category/components/review/CategoryReviewSection";
import CategoryTitle from "@/components/(frontend)/category/components/CategoryTitle";
import CategoryTopContentSection from "@/components/(frontend)/category/components/textContent/CategoryTopContentSection";
import { SchemaOrgScripts } from "@/common/utils/schema/SchemaOrgScripts";

// types
import { type BreadcrumbsType } from "@/common/types/types";
import { type CategoryPageSort } from "@/components/(frontend)/category/types/sort";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type SchemaDataType } from "@/common/types/seoTypes";

function CategoryPage({
  breadcrumbs,
  category,
}: {
  breadcrumbs: BreadcrumbsType[];
  category: ContentCategoryDocument;
}) {
  // hooks
  const {
    isReady,
    sort: {
      data: { sortBy: selectedSortBy },
      method: { onChangeSortBy: onChangeSelectedSortBy },
    },
  } = useAppStates();

  // states
  const [changedSortBy, setChangedSortBy] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<CategoryPageSort>("popularity");

  // variables
  const schemaData: { url: string; data: SchemaDataType } = useMemo(
    () => ({
      url: `${DOMAIN}/${category.slug}`,
      data: {
        Category: {
          name: category.name || category?.info?.heading || "",
          breadcrumbs: [
            { label: "Homepage", url: "/" },
            ...breadcrumbs.map(({ label, link }) => ({ label, url: link })),
          ],
          faqs: category?.seo?.faqs?.length
            ? category.seo.faqs.map(
                (seo: { question: string; answer: string }) => ({
                  q: seo.question,
                  a: seo.answer,
                }),
              )
            : [],
          product: {
            name: category?.info?.heading || category?.name || "name",
            description: category?.seo?.meta?.description || "",
            highPrice: category._page?.maxPrice || 4999,
            lowPrice: category._page?.minPrice || 999,
            ratingCount: category._page?.ratingCount || 1699,
            ratingValue: category._page?.averageRating || 4.8,
            reviewCount: Math.ceil((category._page?.ratingCount || 1699) * 0.2),
            offerCount: category._page?.contentCount || 73,
          },
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // event handlers
  const handleChangeSortBy = useCallback(
    (sortBy: string) => {
      if (!changedSortBy) {
        setChangedSortBy(true);
      }

      setSortBy(sortBy as CategoryPageSort);
      onChangeSelectedSortBy({
        slug: category.slug,
        sortBy: sortBy as CategoryPageSort,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [changedSortBy],
  );

  // side effects
  useEffect(() => {
    if (isReady && selectedSortBy) {
      const [selectedSortBySlug, selectedSortBySort] =
        selectedSortBy.split(":");

      if (
        selectedSortBySlug === category.slug &&
        selectedSortBySort !== sortBy
      ) {
        if (!changedSortBy) {
          setChangedSortBy(true);
        }

        setSortBy(selectedSortBySort as CategoryPageSort);
      } else {
        onChangeSelectedSortBy({ slug: category.slug, sortBy: sortBy });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, selectedSortBy]);

  return (
    <>
      <SchemaOrgScripts
        data={schemaData.data}
        pageType="Category"
        url={schemaData.url}
      />
      <CategoryBannerSection banner={category.media?.banner} />
      <CategoryTitle
        title={category.info.heading || ""}
        rating={category._page?.averageRating || 0}
        ratingCount={category._page?.ratingCount || 0}
        extraPadding={category.media && category.media.banner ? true : false}
        count={category._page?.contentCount}
      />
      <CategoryTopContentSection topContent={category?.info?.topContent} />
      <CategoryRelatedCategorySection
        relatedCategories={category.relatedCategories}
      />
      <CategoryQuickLinkSection
        quickLinks={category.media?.quickLinks}
        scrollable={category.media?.scrollableQuickLinks}
      />
      <CategoryContentCountSort
        count={category._page?.contentCount}
        sortBy={sortBy}
        onChangeSortBy={handleChangeSortBy}
        rating={category._page?.averageRating}
        ratingCount={category._page?.ratingCount}
      />
      <div
        className={`bg-transparent mt-6 p-0 sm:p-3 overflow-hidden`}
      >
        <CategoryContents
          slug={category.slug}
          categoryId={String(category._id)}
          defaultCityId={category._page?.defaultCityId}
          changedSortBy={changedSortBy}
          sortBy={sortBy}
          canLoadMore={
            ((category._page?.contentCount || 0) >
              (category?._page?.contents?.length || 0)) ||
            ((category?._page?.contents?.length || 0) >= 12)
          }
          initialContents={
            (category?._page?.contents || []) as ContentDocument[]
          }
          onChangeSortBy={setSortBy}
        />
      </div>
      <CategoryReviewSection
        categoryId={String(category._id)}
        reviews={category?.personalizedReviews}
      />
      <CategoryBottomContentSection
        bottomContent={category?.info?.bottomContent}
      />
      <CategoryFAQSection faqs={category?.seo?.faqs} />
      {/* <CategoryMobileFilterSort
        sortBy={sortBy}
        onChangeSortBy={handleChangeSortBy}
      /> */}
      <div
        className={`${BASE_HOME_BG_COLOR} w-full sm:hidden h-20 -mt-14 z-[90]`}
      />
    </>
  );
}

export default memo(CategoryPage);
