"use client";
import { INRSymbol } from "@/common/constants/symbols";
import { fromSlug } from "@/common/utils/slugOperations";
import {
  createKeywordRegex,
  SearchContentsType,
} from "@/components/(frontend)/components/header/page/components/content/components/search/SearchContentUI";
import { API_SEARCH_CONTENTS } from "@/common/apiHandlers/(frontend)/apiLinks";
import { XApiKey } from "@/common/constants/apiKey";
import MaxWidthWrapper from "@/components/(frontend)/global/_MaxWidthWrapper/MaxWidthWrapper";
import BoxTheme from "@/components/(frontend)/global/_Templates/BoxTheme/BoxTheme";
import FrontendCategoryListTitle from "@/components/pages/(frontend)/CategoryList/components/ListTitle/ListTitle";
import FrontendProductTilesUI from "@/components/(frontend)/global/_Templates/Tiles/ProductTiles/FrontendProductTilesUI";
import { BASE_HOME_BG_COLOR } from "@/components/pages/(frontend)/Home/static/pallette";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import CategoryContentCountSort from "@/components/(frontend)/category/components/CategoryContentCountSort";
import { type CategoryPageSort } from "@/components/(frontend)/category/types/sort";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SearchSkeleton from "@/components/(frontend)/search/SearchSkeleton";
import { useAppStates } from "@/hooks/useAppState/useAppState";

type SearchPageSortTypes = "high-to-low" | "low-to-high" | "rating";

export default function SearchPage() {
  const keys = useSearchParams();
  const rawKey = keys?.get("key") || "";
  const searchKey = fromSlug(rawKey);
  const regex = createKeywordRegex(searchKey);

  const {
    location: {
      data: { selectedCity },
    },
  } = useAppStates();

  const loadMoreRef = useRef(null);

  const [offset, setOffset] = useState<number>(1);
  const [currSort, setCurrSort] = useState<SearchPageSortTypes>("rating");
  const [filteredResults, setFilteredResults] = useState<SearchContentsType[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const filterAndSort = (
    items: SearchContentsType[],
    sort: SearchPageSortTypes,
  ): SearchContentsType[] => {
    return items.slice().sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "low-to-high")
        return (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0);
      return (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0);
    });
  };

  useEffect(() => {
    if (!searchKey) {
      setFilteredResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const cityId = selectedCity ? String(selectedCity._id) : "null";

    fetch(
      `${API_SEARCH_CONTENTS}?cityId=${cityId}&key=${encodeURIComponent(searchKey)}&limit=200`,
      {
        cache: "no-store",
        headers: { "x-api-key": XApiKey },
      },
    )
      .then(async (res) => await res.json())
      .then((data) => {
        const items: SearchContentsType[] = data.data || [];
        const sorted = filterAndSort(items, currSort);
        setFilteredResults(sorted);
        setOffset(1);
        setIsLoading(false);
      })
      .catch(() => {
        setFilteredResults([]);
        setIsLoading(false);
      });
  }, [searchKey, selectedCity, currSort]);

  useEffect(() => {
    const observeLoadMore = () => {
      const loadMoreDiv = loadMoreRef.current;
      if (!loadMoreDiv) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setOffset((prev) => prev + 1);
            }
          });
        },
        { threshold: 0.5 },
      );

      observer.observe(loadMoreDiv);
    };

    observeLoadMore();
  }, []);

  return (
    <>
      <MaxWidthWrapper className="py-5 sm:py-6">
        {/* TITLE ------------------------------------------ */}
        <FrontendCategoryListTitle
          useH1
          title={
            isLoading
              ? `Searching for "${searchKey}"...`
              : `Results for "${searchKey}" (${filteredResults.length || 0} found)`
          }
          onlyTitle
          totalRating={0}
          totalReviews={0}
        />

        {/* PRODUCTS ------------------------------------------ */}
        <CategoryContentCountSort
          count={filteredResults.length}
          sortBy={
            currSort === "rating"
              ? "popularity"
              : (currSort as CategoryPageSort)
          }
          onChangeSortBy={(val) => {
            const newSort = val === "popularity" ? "rating" : val;
            setCurrSort(newSort as SearchPageSortTypes);
          }}
        />

        <div className="max-sm:px-3.5 mt-6 min-h-[60vh]">
          <BoxTheme isContent>
            {isLoading ? (
              <SearchSkeleton />
            ) : filteredResults.length > 0 ? (
              <FrontendProductTilesUI
                inCategoryPage
                currSort={"popularity"}
                extraCurved={true}
                sync
                selectedCity={selectedCity}
                productList={
                  filteredResults.slice(0, offset * 24).map((item) => ({
                    _id: item.slug,
                    name: item.name,
                    slug: (item.slug || "")
                      .replace(/^\/product\//, "")
                      .replace(/^\/service\//, ""),
                    type: (item.slug || "").startsWith("/service/")
                      ? "service"
                      : "product",
                    media: { primary: { url: item.image } },
                    edible: item.edible
                      ? { isEdible: item.edible[0], type: item.edible[1] }
                      : undefined,
                    price: {
                      base: {
                        price: item.price || item.basePrice || 0,
                        mrp: item.mrp || item.basePrice || item.price || 0,
                      },
                      cities: [],
                    },
                    quality: {
                      rating: {
                        value: item.rating,
                        count: item.ratingCount || 0,
                      },
                    },
                    delivery: {
                      processingTime: { hours: item.procTime || 0 },
                      slots: [],
                    },
                    tag: item.tagInfo
                      ? {
                          promotionTag: {
                            name: item.tagInfo.name,
                            color: { hexCode: item.tagInfo.color },
                          },
                        }
                      : undefined,
                  })) as any[]
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-charcoal-3/60">
                <span className="text-lg font-medium">
                  No results found for &quot;{searchKey}&quot;
                </span>
                <Link href="/" className="mt-4 text-sienna-1 underline">
                  Go back home
                </Link>
              </div>
            )}
          </BoxTheme>
        </div>

        <div
          ref={loadMoreRef}
          className={`flex text-transparent items-center rounded-lg justify-center gap-2 w-full mt-8 py-2 text-lg text-center transition-all duration-300`}
        >
          <Loader2
            strokeWidth={1.5}
            width={19}
            height={19}
            className="animate-spin"
          />
          <span>Loading more...</span>
        </div>

        <div
          className={`${BASE_HOME_BG_COLOR} w-full sm:hidden h-20 -mt-14 z-[90]`}
        />
      </MaxWidthWrapper>
    </>
  );
}
