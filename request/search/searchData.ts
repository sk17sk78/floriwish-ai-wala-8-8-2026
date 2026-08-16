// constants
import { DOMAIN } from "@/common/constants/environmentVariables";
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";
import { SEARCH_REFRESH_INTERVAL } from "@/common/constants/revalidateIntervals";

// types
import { type AITagDocument } from "@/common/types/documentation/presets/aiTag";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type ResponseDataType } from "@/common/types/apiTypes";
import { XApiKey } from "@/common/constants/apiKey";

type SearchDataPayload = ResponseDataType<{
  aiTags: AITagDocument[];
  categories: ContentCategoryDocument[];
  contents: ContentDocument[];
}>;

// In-memory client cache to prevent redundant duplicate API calls
let cachedSearchData: SearchDataPayload | null = null;
let searchDataPromise: Promise<SearchDataPayload> | null = null;

export const fetchSearchData = (renderingStrategy?: "SSR" | "ISR") => {
  // Return cached result immediately on client side
  if (typeof window !== "undefined" && cachedSearchData) {
    return Promise.resolve(cachedSearchData);
  }

  // Deduplicate concurrent in-flight requests
  if (typeof window !== "undefined" && searchDataPromise) {
    return searchDataPromise;
  }

  const promise = new Promise<SearchDataPayload>(async (resolve, reject) => {
    try {
      const renderingStrategyData = renderingStrategy
        ? renderingStrategy === "SSR"
          ? { ssr: true }
          : { isr: true, revalidate: SEARCH_REFRESH_INTERVAL }
        : RENDERING_STRATEGY === "SSR"
          ? { ssr: true }
          : { isr: true, revalidate: SEARCH_REFRESH_INTERVAL };

      const response: Response = await fetch(`${DOMAIN}/api/frontend/search`, {
        method: "GET",
        headers: { "x-api-key": XApiKey },
        ...(renderingStrategyData && renderingStrategyData.ssr
          ? { cache: "no-store" }
          : {}),
        ...(renderingStrategyData &&
        renderingStrategyData.isr &&
        renderingStrategyData.revalidate &&
        renderingStrategyData.revalidate > 0
          ? {
              next: {
                tags: ["cache"],
                revalidate: renderingStrategyData.revalidate
              }
            }
          : {})
      });
      const responseData: SearchDataPayload = await response.json();

      if (response.ok) {
        if (typeof window !== "undefined") {
          cachedSearchData = responseData;
        }
        resolve(responseData);
      } else {
        reject(responseData);
      }
    } catch (error: any) {
      reject({
        data: null,
        messages: [
          {
            type: "error",
            message: "Response Error"
          }
        ]
      });
    } finally {
      if (typeof window !== "undefined") {
        searchDataPromise = null;
      }
    }
  });

  if (typeof window !== "undefined") {
    searchDataPromise = promise;
  }

  return promise;
};
