import { s3 } from "@/lib/aws";

type FileCommonProps = { folderName: string };
type FileAddVariantProps = { type: "add"; fileType: "image"; buffer: Buffer; extension: string; fileName: string; };
type FileDeleteVariantProps = { type: "delete"; fileName: string; };
type FileDeleteManyVariantProps = { type: "delete-many"; fileNames: string[]; };
type FileProps = FileCommonProps & (FileAddVariantProps | FileDeleteVariantProps | FileDeleteManyVariantProps);
type FolderProps = { type: "add" | "delete"; folderName: string; };

// CloudFront configuration
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || "";
const USE_CLOUDFRONT = process.env.USE_CLOUDFRONT_FOR_IMAGES === "true";
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "floriwish-media-bucket";

/**
 * Get the appropriate URL for an uploaded file
 * Uses CloudFront CDN if enabled, otherwise falls back to direct S3 URL
 */
const getFileUrl = (folderName: string, fileName: string): string => {
  if (USE_CLOUDFRONT && CLOUDFRONT_URL) {
    // Use CloudFront CDN for faster delivery
    const cloudfrontUrl = `${CLOUDFRONT_URL}/${folderName}/${fileName}`;
    return cloudfrontUrl;
  } else {
    // Fallback to direct S3 URL
    const s3Url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${folderName}/${fileName}`;
    return s3Url;
  }
};

const addFile = async ({ folderName, fileType, fileName, buffer, extension }: { folderName: string; fileType: "image"; fileName: string; buffer: Buffer; extension: string; }): Promise<string> => {
  try {
    await s3.file.add({ directoryName: folderName, fileType, fileName, buffer, extension });
    
    // Return CloudFront URL if enabled, otherwise S3 URL
    return getFileUrl(folderName, fileName);
  } catch (error: any) {
    return "";
  }
};

const deleteFile = async ({ folderName, fileName }: { folderName: string; fileName: string; }): Promise<boolean> => {
  try {
    await s3.file.delete({ directoryName: folderName, fileName });
    return true;
  } catch (error: any) {
    return false;
  }
};

const deleteFiles = async ({ folderName, fileNames }: { folderName: string; fileNames: string[]; }): Promise<boolean> => {
  try {
    await s3.file.deleteMany({ directoryName: folderName, fileNames });
    return true;
  } catch (error: any) {
    return false;
  }
};

export const fileOperation = async (props: FileProps): Promise<boolean | string> => {
  const { type, folderName } = props;
  if (type === "add") {
    const { fileName, fileType, buffer, extension } = props;
    return await addFile({ folderName, fileType, fileName, buffer, extension });
  } else if (type === "delete") {
    const { fileName } = props;
    return await deleteFile({ folderName, fileName });
  } else if (type === "delete-many") {
    const { fileNames } = props;
    return await deleteFiles({ folderName, fileNames });
  } else {
    return false;
  }
};

const addFolder = async ({ folderName }: { folderName: string; }): Promise<boolean> => {
  try {
    await s3.directory.add({ directoryName: folderName });
    return true;
  } catch (error: any) {
    return false;
  }
};

const deleteFolder = async ({ folderName }: { folderName: string; }): Promise<boolean> => {
  try {
    await s3.directory.delete({ directoryName: folderName });
    return true;
  } catch (error: any) {
    return false;
  }
};

export const folderOperation = async (props: FolderProps): Promise<boolean> => {
  const { type, folderName } = props;
  if (type === "add") return await addFolder({ folderName });
  else if (type === "delete") return await deleteFolder({ folderName });
  else return false;
};

const mediaOperation = {
  file: fileOperation,
  folder: folderOperation
};

export default mediaOperation;
