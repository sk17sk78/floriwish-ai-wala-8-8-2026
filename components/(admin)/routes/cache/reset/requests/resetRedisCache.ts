import { XApiKey } from "@/common/constants/apiKey";

export const resetRedisCache = () => {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      const response: Response = await fetch(`/api/admin/reset-cache/redis`, {
        method: "GET",
        headers: { "x-api-key": XApiKey }
      });

      if (response.ok) {
        const responseData = await response.json();
        resolve(Boolean(responseData));
      } else {
        reject(false);
      }
    } catch (error: any) {
      reject(false);
    }
  });
};
