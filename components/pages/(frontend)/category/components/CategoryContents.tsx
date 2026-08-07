"use client";

// constants
import { API_CATEGORIES_MORE_PRODUCTS } from "@/common/apiHandlers/(frontend)/apiLinks";
import { XApiKey } from "@/common/constants/apiKey";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { getContentPrice } from "@/components/(frontend)/category/utils/getContentPrice";
import { transformProductToListItem } from "@/common/utils/product/transformProduct";

// components
import CategoryContent from "@/components/(frontend)/category/components/CategoryContent";
import { Loader2 } from "lucide-react";

// types
import { type CategoryPageSort } from "@/components/(frontend)/category/types/sort";
import { type ContentDocument } from "@/common/types/documentation/contents/content";

const BATCH_SIZE = 32;

function CategoryContents({
  slug,
  categoryId,
  defaultCityId,
  changedSortBy,
  sortBy,
  canLoadMore,
  initialContents,
  onChangeSortBy
}: {
  slug: string;
  categoryId: string;
  defaultCityId?: string;
  changedSortBy: boolean;
  sortBy: CategoryPageSort;
  canLoadMore: boolean;
  initialContents: ContentDocument[];
  onChangeSortBy: (sortBy: CategoryPageSort) => void;
}) {
  // hooks
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    isReady,
    location: {
      data: { selectedCity }
    }
  } = useAppStates();

  // states
  const [cityId, setCityId] = useState<string | undefined>(defaultCityId);
  const [contents, setContents] = useState<ContentDocument[]>([]);
  const [offset, setOffset] = useState<number>(1); // 0 = initial SSR batch
  const [hasMore, setHasMore] = useState<boolean>(canLoadMore);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const isFetchingRef = useRef<boolean>(false);
  const hasMoreRef = useRef<boolean>(canLoadMore);

  useEffect(() => {
    setHasMore(canLoadMore);
    hasMoreRef.current = canLoadMore;
  }, [canLoadMore]);

  // Transform initial contents on mount or when they change
  useEffect(() => {
    if (initialContents && initialContents.length > 0) {
      if (initialContents[0]._listItemData) {
        setContents(initialContents);
      } else {
        setContents(initialContents.map(transformProductToListItem));
      }
    } else {
      setContents([]);
    }
  }, [initialContents]);

  // utils
  const handleSort = useCallback(({
    contents,
    sortBy
  }: {
    contents: ContentDocument[];
    sortBy: CategoryPageSort;
  }): ContentDocument[] => {
    switch (sortBy) {
      case "popularity":
        return [...contents].sort(
          (a, b) =>
            (b._listItemData?.ratingValue || 0) *
              (b._listItemData?.ratingCount || 1) -
            (a._listItemData?.ratingValue || 0) *
              (a._listItemData?.ratingCount || 1)
        );

      case "latest":
        return [...contents].sort(
          (a, b) =>
            new Date(b._listItemData!.createdDate).getTime() -
            new Date(a._listItemData!.createdDate).getTime()
        );

      case "high-to-low":
        return [...contents].sort(
          (a, b) =>
            (b._listItemData?.price || 0) - (a._listItemData?.price || 0)
        );

      case "low-to-high":
        return [...contents].sort(
          (a, b) =>
            (a._listItemData?.price || 0) - (b._listItemData?.price || 0)
        );

      default:
        return contents;
    }
  }, []);

  // Fetch next batch of products
  const fetchMoreProducts = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsFetching(true);
    try {
      const apiUrl = API_CATEGORIES_MORE_PRODUCTS({
        categoryId,
        offset,
        sort: sortBy as any,
        cityId: cityId
      });

      const response = await fetch(apiUrl, {
        headers: { "x-api-key": XApiKey }
      });
      const data = await response.json();

      if (data && Array.isArray(data) && data.length > 0) {
        const newContents = data.map(transformProductToListItem);

        setContents((prev) => [...prev, ...newContents]);
        setOffset((prev) => prev + 1);

        if (data.length < BATCH_SIZE) {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch {
      // Silently fail
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
    }
  }, [categoryId, offset, sortBy, cityId]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const loadMoreDiv = loadMoreRef.current;
    if (!loadMoreDiv || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fetchMoreProducts();
          }
        });
      },
      { rootMargin: "400px 0px", threshold: 0.01 }
    );

    observer.observe(loadMoreDiv);

    return () => observer.disconnect();
  }, [hasMore, fetchMoreProducts]);

  // Handle city change — update prices
  useEffect(() => {
    if (isReady && contents.length > 0) {
      if (selectedCity?._id && String(selectedCity._id) !== String(cityId)) {
        setCityId(String(selectedCity._id));
        setContents((prev) => 
          prev.map((content) => {
            if (!content._listItemData) return content;
            
            const updatedContent = { ...content } as ContentDocument;

            const { price, mrp } = getContentPrice({
              price: content.price!,
              city: selectedCity
            });

            updatedContent._listItemData = {
              ...updatedContent._listItemData,
              price: price,
              discount: Math.round(((mrp - price) / mrp) * 100)
            } as any;

            return updatedContent;
          })
        );
      }
    }
  }, [isReady, selectedCity, cityId, contents.length]);

  // Handle sort change — reset and re-sort current contents
  useEffect(() => {
    if (changedSortBy) {
      setContents(prev => prev.length > 0 ? handleSort({ contents: prev, sortBy }) : prev);
    }
  }, [sortBy, changedSortBy, handleSort]);

  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 sm:gap-y-6 sm:gap-x-3 items-start justify-center`}
      >
        {contents.map(({ _id, _listItemData }, i) => (
          _listItemData ? (
            <CategoryContent
              key={String(_id)}
              index={i}
              content={_listItemData}
              price={_listItemData.price}
              discount={_listItemData.discount}
            />
          ) : null
        ))}
      </div>

      {/* Infinite scroll trigger + loading indicator */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center h-16 w-full my-4"
        >
          {isFetching && (
            <div className="flex items-center gap-2 text-charcoal-3/60 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more products...</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default memo(CategoryContents);
