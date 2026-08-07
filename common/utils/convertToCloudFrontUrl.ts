/**
 * Convert S3 URLs to CloudFront URLs for faster image delivery
 * 
 * This utility converts direct S3 bucket URLs to CloudFront CDN URLs
 * for better performance and faster image loading.
 * 
 * SAFETY: If CloudFront fails, it automatically falls back to S3 URLs
 */
// keshav update it 20 feb 2026 
// Cache environment variables to avoid repeated lookups
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || process.env.NEXT_PUBLIC_CLOUDFRONT_URL || "https://d22rebqllszdz8.cloudfront.net";
const USE_CLOUDFRONT = process.env.USE_CLOUDFRONT_FOR_IMAGES === "true" || process.env.NEXT_PUBLIC_USE_CLOUDFRONT === "true";

const S3_PATTERNS = [
  /floriwish-media-bucket\.s3\.ap-south-1\.amazonaws\.com/gi,
  /floriwish-media-bucket\.s3\.amazonaws\.com/gi,
  /s3\.ap-south-1\.amazonaws\.com\/floriwish-media-bucket/gi,
  /s3\.amazonaws\.com\/floriwish-media-bucket/gi,
];

// Fallback pattern for any other region
const GENERIC_S3_PATTERN = /[a-z0-9.-]+\.s3\.[a-z0-9-]+\.amazonaws\.com/gi;
const GENERIC_S3_PATH_PATTERN = /s3\.[a-z0-9-]+\.amazonaws\.com\/[a-z0-9.-]+/gi;

/**
 * Check if we should use CloudFront
 */
const shouldUseCloudFront = (): boolean => {
  return USE_CLOUDFRONT;
};

/**
 * Convert a single S3 URL to CloudFront URL with fallback safety
 */
export const convertToCloudFrontUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  
  if (!shouldUseCloudFront()) return url;
  if (url.includes("cloudfront.net")) return url;

  let cloudfrontUrl = url;

  try {
    // 1. Check for specific bucket patterns first
    for (const pattern of S3_PATTERNS) {
      if (pattern.test(url)) {
        pattern.lastIndex = 0;
        cloudfrontUrl = url.replace(pattern, CLOUDFRONT_URL.replace(/^https?:\/\//, ""));
        // Remove the protocol if it got double-added
        cloudfrontUrl = cloudfrontUrl.replace(/https?:\/\/https?:\/\//, "https://");
        return cloudfrontUrl;
      }
    }

    // 2. Aggressive replacement for buckethosting
    if (url.includes("floriwish-media-bucket") && url.includes("amazonaws.com")) {
       cloudfrontUrl = url.replace(/https?:\/\/[^/]+\/floriwish-media-bucket\//, `${CLOUDFRONT_URL}/`);
       cloudfrontUrl = cloudfrontUrl.replace(/https?:\/\/floriwish-media-bucket\.[^/]+\//, `${CLOUDFRONT_URL}/`);
       return cloudfrontUrl;
    }

    // 3. Generic S3 replacement as last resort
    if (url.includes("s3") && url.includes("amazonaws.com")) {
      cloudfrontUrl = url.replace(GENERIC_S3_PATTERN, CLOUDFRONT_URL.replace(/^https?:\/\//, ""));
      cloudfrontUrl = cloudfrontUrl.replace(GENERIC_S3_PATH_PATTERN, CLOUDFRONT_URL.replace(/^https?:\/\//, ""));
    }
    // 4. If it's a relative path, we generally want to keep it local
    // unless we're absolutely sure it should be on CloudFront.
    // Prepending CloudFront URL to all relative paths breaks local public assets.
    /* 
    if (url.startsWith("/")) {
      return `${CLOUDFRONT_URL}${url}`;
    }
    */
  } catch (error) {
    console.error("CloudFront conversion error:", error);
  }

  return cloudfrontUrl;
};

/**
 * Get the original S3 URL from a CloudFront URL (for fallback)
 * @param url - CloudFront or S3 URL
 * @returns Original S3 URL
 */
export const getS3Url = (url: string | undefined | null): string => {
  if (!url) return "";
  
  // If already S3 URL, return as is
  if (url.includes("s3") && url.includes("amazonaws.com")) {
    return url;
  }
  
  // Convert CloudFront URL back to S3 URL
  if (url.includes("cloudfront.net")) {
    return url.replace(
      /https:\/\/[^.]+\.cloudfront\.net\//,
      "https://floriwish-media-bucket.s3.ap-south-1.amazonaws.com/"
    );
  }
  
  return url;
};

/**
 * Convert multiple S3 URLs to CloudFront URLs
 * @param urls - Array of S3 URLs to convert
 * @returns Array of CloudFront URLs
 */
export const convertMultipleToCloudFrontUrls = (urls: (string | undefined | null)[]): string[] => {
  return urls.map(url => convertToCloudFrontUrl(url));
};

/**
 * Convert image object with URL to use CloudFront
 * @param image - Image object with url property
 * @returns Image object with CloudFront URL
 */
export const convertImageToCloudFront = <T extends { url?: string }>(image: T | undefined | null): T | null => {
  if (!image || !image.url) return null;
  
  return {
    ...image,
    url: convertToCloudFrontUrl(image.url)
  };
};

/**
 * Convert array of image objects to use CloudFront
 * @param images - Array of image objects
 * @returns Array of image objects with CloudFront URLs
 */
export const convertImagesToCloudFront = <T extends { url?: string }>(images: T[]): T[] => {
  return images.map(image => ({
    ...image,
    url: convertToCloudFrontUrl(image.url)
  }));
};

/**
 * Check if CloudFront is enabled
 * @returns boolean indicating if CloudFront should be used
 */
export const isCloudFrontEnabled = (): boolean => {
  return shouldUseCloudFront();
};

/**
 * Get CloudFront URL base
 * @returns CloudFront base URL
 */
export const getCloudFrontBaseUrl = (): string => {
  return CLOUDFRONT_URL;
};


