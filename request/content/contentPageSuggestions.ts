// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ResponseDataType } from "@/common/types/apiTypes";
import { DOMAIN } from "@/common/constants/environmentVariables";
import { XApiKey } from "@/common/constants/apiKey";

export const fetchContentPageSuggestions = (
  slug: string
) => {
  return new Promise<ResponseDataType<ContentDocument>>(
    async (resolve, reject) => {
      try {
        const response: Response = await fetch(
          `${DOMAIN}/api/frontend/content-page/${slug}/suggestions`,
          {
            method: "GET",
            headers: { "x-api-key": XApiKey },
            cache: "no-store" // We want suggestions to be fresh and not block initial page cache
          }
        );
        const responseData: ResponseDataType<ContentDocument> =
          await response.json();

        if (response.ok) {
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
      }
    }
  );
};
