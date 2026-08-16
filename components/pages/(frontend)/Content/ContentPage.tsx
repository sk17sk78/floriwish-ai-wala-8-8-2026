"use client";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { memo } from "react";
import { scrollToSection } from "@/common/helpers/scrollToSection";

// hooks
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import ContentDetail from "@/components/(frontend)/content/detail/ContentDetail";
import ContentGallery from "@/components/(frontend)/content/gallery/ContentGallery";
import ContentGridWrapper from "@/components/(frontend)/content/ContentGridWrapper";
import ContentReviewSection from "@/components/(frontend)/content/review/ContentReviewSection";
import ContentSuggestion from "@/components/(frontend)/content/suggestion/ContentSuggestion";
import { SchemaOrgScripts } from "@/common/utils/schema/SchemaOrgScripts";

// requests
import { fetchContentPageSuggestions } from "@/request/content/contentPageSuggestions";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type SchemaDataType } from "@/common/types/seoTypes";
import { SCHEMA_REVIEWS } from "./constants/schemaReviews";
import { PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";
import { ColorDocument } from "@/common/types/documentation/presets/color";
import { ContentSuggestionDocument } from "@/common/types/documentation/nestedDocuments/contentSuggestion";
import { useEffect } from "react";

function ContentPage({
  content,
  isProduct,
  serviceImage
}: {
  content: ContentDocument;
  isProduct?: boolean;
  serviceImage?: ImageDocument;
}) {
  // hooks
  const { isMobile } = useAppStates();

  // states
  const [showSimilarContentDrawer, setShowSimilarContentDrawer] =
    useState<boolean>(false);

  const [customVariant, setCustomVariant] =
    useState<ContentCustomVariantDocument | null>(null);
  const [referenceVariant, setReferenceVariant] =
    useState<ContentDocument | null>(null);

  const [lazySuggestions, setLazySuggestions] = useState<ContentSuggestionDocument | null>(null);

  // vars
  const slug = useMemo(
    () => (referenceVariant ? referenceVariant.slug : content.slug),
    [referenceVariant, content.slug]
  );

  // fetch suggestions lazily
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await fetchContentPageSuggestions(slug);
        if (response.data) {
          setLazySuggestions(response.data._suggestions || null);
        }
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      }
    };
    loadSuggestions();
  }, [slug]);

  // variables
  const aiTagSuggestionId = useMemo(() => "___similar_products___", []);
  const handpickedSuggestionId = useMemo(() => "___handpicked_products___", []);
  const url = useMemo(
    () =>
      `${DOMAIN}${isProduct ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const schemaReview = useMemo(
    () =>
      (isProduct ? SCHEMA_REVIEWS.product : SCHEMA_REVIEWS.service)[
        Math.floor(Math.random() * 15)
      ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // memoizes
  const schemaData: SchemaDataType = useMemo(() => {
    const primaryCategory = content.category.primary as ContentCategoryDocument;
    const primaryImage = content.media?.primary as ImageDocument;
    const schemaContentData = {
      currency: "INR",
      price: `${content.price ? content.price.base.price : 0}`,
      rating: {
        count: content.quality?.rating?.count || 284,
        avgRating: content.quality?.rating?.value || 4.8
      },
      sku: content.sku,
      url,
      validUntil: "31 Dec 2400",
      reviews: [
        {
          name: schemaReview.author,
          saidReview: schemaReview.review,
          date: (content?.createdAt
            ? new Date(content.createdAt as string)
            : new Date()
          )
            .toISOString()
            .split("T")[0],
          rated: content.quality?.rating?.value || 5,
          maxRate: 5
        }
      ],
      description: content?.seoMeta?.description || ""
    };

    return {
      Content: {
        breadcrumbs: [
          { label: "Homepage", url: "/" },
          {
            label: primaryCategory.name,
            url: `/${primaryCategory.slug}`
          },
          {
            label: content.name,
            url: `${isProduct ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`
          }
        ],
        webpage: {
          name: content.name,
          alternateName: content.name,
          description: content?.seoMeta?.description || "",
          image: primaryImage?.url || "",
          url,
          productDetails: schemaContentData
        },
        content: {
          ...schemaContentData,
          image: primaryImage?.url || "",
          name: content.name
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentId = useMemo(
    () =>
      referenceVariant
        ? String(referenceVariant?._id)
        : String(content._id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referenceVariant]
  );

  const images = useMemo(
    () => {
      // Filter out null/undefined images for safety
      const imageList = customVariant?.image
        ? [customVariant.image as ImageDocument]
        : referenceVariant
          ? [
              referenceVariant.media?.primary as ImageDocument,
              ...(referenceVariant.media?.gallery as ImageDocument[] || [])
            ]
          : [
              content.media?.primary as ImageDocument,
              ...(content.media?.gallery as ImageDocument[] || [])
            ];
      
      // Filter out any null/undefined values
      return imageList.filter(img => img && img.url);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customVariant, referenceVariant]
  );

  const tag = useMemo(
    () =>
      referenceVariant
        ? referenceVariant.tag?.promotionTag
          ? {
              label: (
                referenceVariant.tag?.promotionTag as PromotionTagDocument
              ).name,
              color: (
                (referenceVariant.tag?.promotionTag as PromotionTagDocument)
                  .color as ColorDocument
              ).hexCode
            }
          : undefined
        : content.tag?.promotionTag
          ? {
              label: (content.tag?.promotionTag as PromotionTagDocument).name,
              color: (
                (content.tag?.promotionTag as PromotionTagDocument)
                  .color as ColorDocument
              ).hexCode
            }
          : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referenceVariant]
  );

  const similarContents = useMemo(() => {
    const aiTagsList = (
      referenceVariant && referenceVariant._suggestions?.aiTag?.length
        ? referenceVariant._suggestions.aiTag
        : content._suggestions?.aiTag?.length
          ? content._suggestions.aiTag
          : lazySuggestions?.aiTag?.length
            ? lazySuggestions.aiTag
            : []
    ) as ContentDocument[];

    const relatedAITagList = (
      referenceVariant && referenceVariant._suggestions?.relatedAITag?.length
        ? referenceVariant._suggestions.relatedAITag
        : content._suggestions?.relatedAITag?.length
          ? content._suggestions.relatedAITag
          : lazySuggestions?.relatedAITag?.length
            ? lazySuggestions.relatedAITag
            : []
    ) as ContentDocument[];

    const categoryList = (
      referenceVariant && referenceVariant._suggestions?.category?.length
        ? referenceVariant._suggestions.category
        : content._suggestions?.category?.length
          ? content._suggestions.category
          : lazySuggestions?.category?.length
            ? lazySuggestions.category
            : []
    ) as ContentDocument[];

    const merged: ContentDocument[] = [];
    const seenIds = new Set<string>();

    [...aiTagsList, ...relatedAITagList, ...categoryList].forEach((item) => {
      if (item && typeof item === "object" && item.slug) {
        const id = String((item as any)._id || item.slug);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          merged.push(item);
        }
      }
    });

    return merged;
  }, [referenceVariant, content._suggestions, lazySuggestions]);

  const rating = useMemo(
    () =>
      referenceVariant
        ? referenceVariant.quality?.rating
        : content.quality?.rating,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referenceVariant]
  );

  const review = useMemo(
    () =>
      referenceVariant
        ? referenceVariant.quality?.review
        : content.quality?.review,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referenceVariant]
  );

  const reviewImages = useMemo(
    () =>
      referenceVariant
        ? (referenceVariant.media?.review as ImageDocument[]) || []
        : (content.media?.review as ImageDocument[]) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referenceVariant]
  );

  const suggestions = useMemo(
    () =>
      referenceVariant && referenceVariant._suggestions
        ? referenceVariant._suggestions
        : lazySuggestions || content?._suggestions,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referenceVariant, lazySuggestions]
  );

  // router
  const router = useRouter();

  // category id, name & url
  const categoryId = useMemo(() => {
    const primary = content.category?.primary as any;
    if (primary && typeof primary === "object" && primary._id) {
      return String(primary._id);
    }
    if (typeof primary === "string") {
      return primary;
    }
    return "";
  }, [content.category]);

  const categoryName = useMemo(() => {
    const primaryCategory = content.category?.primary as ContentCategoryDocument | undefined;
    return primaryCategory?.name || "Category";
  }, [content.category]);

  const categoryUrl = useMemo(() => {
    const primaryCategory = content.category?.primary as ContentCategoryDocument | undefined;
    if (primaryCategory?.slug) return `/${primaryCategory.slug}`;
    if (typeof content.category?.primary === "string") return `/${content.category.primary}`;
    return "";
  }, [content.category]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    if (content.tag?.aiTags) {
      content.tag.aiTags.forEach((x) => {
        if (typeof x === "string" && x.trim()) set.add(x.trim());
      });
    }
    if (content.tag?.relatedAITags) {
      content.tag.relatedAITags.forEach((x) => {
        if (typeof x === "string" && x.trim()) set.add(x.trim());
      });
    }
    return Array.from(set);
  }, [content.tag]);

  // event handlers
  const handleClickViewSimilar = useCallback(() => {
    setShowSimilarContentDrawer(true);
  }, []);

  return (
    <>
      <ContentGridWrapper>
        <ContentGallery
          serviceImage={serviceImage}
          images={images}
          showSimilarContentDrawer={showSimilarContentDrawer}
          similarContents={similarContents}
          tag={tag}
          categoryId={categoryId}
          productSlug={slug}
          categoryName={categoryName}
          categoryUrl={categoryUrl}
          tags={tags}
          isProduct={isProduct}
          onClickViewSimilar={handleClickViewSimilar}
          onChangeShowSimilarContentDrawer={setShowSimilarContentDrawer}
        />
        <ContentDetail
          content={content}
          categoryUrl={categoryUrl}
          showViewSimilarButton={Boolean(categoryUrl || similarContents.length || (suggestions?.category?.length || 0) > 0)}
          onClickViewSimilar={handleClickViewSimilar}
          onChangeCustomVariant={setCustomVariant}
          onChangeReferenceVariant={setReferenceVariant}
        />
      </ContentGridWrapper>
      {review && (
        <ContentReviewSection
          contentId={contentId}
          title="All Reviews"
          review={review}
          images={reviewImages}
          rating={rating}
          totalRatings={rating?.count || review?.count}
          applyBoxTheme
        />
      )}
      {suggestions && (
        <ContentSuggestion
          aiTagSuggestionId={aiTagSuggestionId}
          handpickedSuggestionId={handpickedSuggestionId}
          suggestion={suggestions}
        />
      )}
      <SchemaOrgScripts
        pageType="Content"
        data={schemaData}
        url={url}
      />
    </>
  );
}

export default memo(ContentPage);
