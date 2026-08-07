import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

// Environment variables
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const distributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;

// Feature flag to enable/disable CloudFront invalidation
const CLOUDFRONT_ENABLED = process.env.ENABLE_CLOUDFRONT_INVALIDATION === "true";

// Validate CloudFront configuration
const isCloudFrontConfigured = (): boolean => {
  if (!CLOUDFRONT_ENABLED) {
    return false;
  }

  if (!distributionId || distributionId.trim() === "") {
    return false;
  }

  if (!region || !accessKeyId || !secretAccessKey) {
    return false;
  }

  // Validate distribution ID format (should start with E and be alphanumeric)
  if (!/^E[A-Z0-9]+$/i.test(distributionId)) {
    return false;
  }

  return true;
};

// Initialize CloudFront client only if properly configured
let cloudFrontClient: CloudFrontClient | null = null;

if (isCloudFrontConfigured()) {
  try {
    cloudFrontClient = new CloudFrontClient({
      region: region!,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!
      }
    });
  } catch (error) {
    cloudFrontClient = null;
  }
}

/**
 * Invalidate CloudFront cache for specified paths
 * @param paths - Array of paths to invalidate (e.g., ["/product/slug", "/*"])
 * @returns Response object or null if CloudFront is not configured
 */
export const invalidateCloudFrontCache = async (paths: string[]) => {
  // Early return if CloudFront is not enabled
  if (!CLOUDFRONT_ENABLED) {
    return null;
  }

  // Early return if not configured
  if (!cloudFrontClient || !distributionId) {
    return null;
  }

  // Validate paths
  if (!paths || paths.length === 0) {
    return null;
  }

  try {
    // Ensure all paths start with /
    const normalizedPaths = paths.map(path => 
      path.startsWith("/") ? path : `/${path}`
    );

    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: normalizedPaths.length,
          Items: normalizedPaths
        },
        CallerReference: `invalidation-${Date.now()}-${Math.random().toString(36).substring(7)}`
      }
    });

    const response = await cloudFrontClient.send(command);
    return response;
  } catch (error: any) {
    // Handle specific AWS errors
    if (error.name === "NoSuchDistribution") {
    } else if (error.name === "InvalidArgument") {
    } else if (error.name === "AccessDenied") {
    } else {
    }

    // Don't throw - return null to allow app to continue
    return null;
  }
};

/**
 * Invalidate CloudFront cache for image paths
 * @param imagePaths - Array of image paths (with or without leading /)
 * @returns Response object or null
 */
export const invalidateImageCache = async (imagePaths: string[]) => {
  if (!imagePaths || imagePaths.length === 0) {
    return null;
  }

  const pathsToInvalidate = imagePaths.map(path => 
    path.startsWith("/") ? path : `/${path}`
  );
  
  return invalidateCloudFrontCache(pathsToInvalidate);
};

/**
 * Check if CloudFront is properly configured and enabled
 * @returns boolean indicating if CloudFront can be used
 */
export const isCloudFrontAvailable = (): boolean => {
  return CLOUDFRONT_ENABLED && cloudFrontClient !== null && !!distributionId;
};