// constants
import { DOMAIN } from "@/common/constants/environmentVariables";
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";
import { LOCATION_REFRESH_INTERVAL } from "@/common/constants/revalidateIntervals";
import { XApiKey } from "@/common/constants/apiKey";

// types
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type ResponseDataType } from "@/common/types/apiTypes";

// In-memory client cache to prevent redundant duplicate API calls
let cachedLocationData: ResponseDataType<CityDocument[]> | null = null;
let locationDataPromise: Promise<ResponseDataType<CityDocument[]>> | null = null;

export const fetchLocationData = (renderingStrategy?: "SSR" | "ISR") => {
  // Return cached result immediately on client side
  if (typeof window !== "undefined" && cachedLocationData) {
    return Promise.resolve(cachedLocationData);
  }

  // Deduplicate concurrent in-flight requests
  if (typeof window !== "undefined" && locationDataPromise) {
    return locationDataPromise;
  }

  const promise = new Promise<ResponseDataType<CityDocument[]>>(
    async (resolve, reject) => {
      try {
        const renderingStrategyData = renderingStrategy
          ? renderingStrategy === "SSR"
            ? { ssr: true }
            : { isr: true, revalidate: LOCATION_REFRESH_INTERVAL }
          : RENDERING_STRATEGY === "SSR"
            ? { ssr: true }
            : { isr: true, revalidate: LOCATION_REFRESH_INTERVAL };

        const response: Response = await fetch(
          `${DOMAIN}/api/frontend/location`,
          {
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
          }
        );
        const responseData: ResponseDataType<CityDocument[]> =
          await response.json();

        if (response.ok) {
          if (typeof window !== "undefined") {
            cachedLocationData = responseData;
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
          locationDataPromise = null;
        }
      }
    }
  );

  if (typeof window !== "undefined") {
    locationDataPromise = promise;
  }

  return promise;
};
