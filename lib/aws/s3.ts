// import {
//   S3Client,
//   DeleteObjectCommand,
//   PutObjectCommand,
//   DeleteObjectsCommand
// } from "@aws-sdk/client-s3";

// // env
// const region = process.env.AWS_REGION || "";
// const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
// const bucketName = process.env.AWS_S3_BUCKET_NAME || "";

// const s3Client = new S3Client({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey
//   }
// });

// export const addDirectoryToS3 = async ({
//   directoryName
// }: {
//   directoryName: string;
// }) => {
//   const params = {
//     Bucket: bucketName,
//     Key: `${directoryName}/`
//   };

//   const command = new PutObjectCommand(params);

//   await s3Client.send(command);
// };

// export const deleteDirectoryFromS3 = async ({
//   directoryName
// }: {
//   directoryName: string;
// }) => {
//   const params = {
//     Bucket: bucketName,
//     Key: `${directoryName}/`
//   };

//   const command = new DeleteObjectCommand(params);

//   await s3Client.send(command);
// };

// export const addFileToS3 = async ({
//   directoryName,
//   fileType,
//   fileName,
//   buffer,
//   extension
// }: {
//   directoryName: string;
//   fileType: "image";
//   fileName: string;
//   buffer: Buffer;
//   extension: string;
// }) => {
//   const params = {
//     Bucket: bucketName,
//     Key: `${directoryName}/${fileName}`,
//     Body: buffer,
//     ContentType: `${fileType}/${extension}`
//   };

//   const command = new PutObjectCommand(params);

//   await s3Client.send(command);
// };

// export const deleteFileFromS3 = async ({
//   directoryName,
//   fileName
// }: {
//   directoryName: string;
//   fileName: string;
// }) => {
//   const params = {
//     Bucket: bucketName,
//     Key: `${directoryName}/${fileName}`
//   };

//   const command = new DeleteObjectCommand(params);

//   await s3Client.send(command);
// };

// export const deleteFilesFromS3 = async ({
//   directoryName,
//   fileNames
// }: {
//   directoryName: string;
//   fileNames: string[];
// }) => {
//   const params = {
//     Bucket: bucketName,
//     Delete: {
//       Objects: fileNames.map((fileName) => ({
//         Key: `${directoryName}/${fileName}`
//       }))
//     }
//   };

//   const command = new DeleteObjectsCommand(params);

//   await s3Client.send(command);
// };


import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import sharp from "sharp";

/* ------------------ ENV ------------------ */
const region = process.env.AWS_REGION!;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const bucketName = process.env.AWS_S3_BUCKET_NAME!;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

/* -------------------------------------------------
   CREATE EMPTY DIRECTORY (just puts an empty key)
------------------------------------------------- */
export const addDirectoryToS3 = async ({
  directoryName
}: {
  directoryName: string;
}) => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: `${directoryName}/`,
      Body: "" // empty object to simulate directory (npm run build erro fix )
    }
  });

  await upload.done();
};
{/* update code of s3 uploading  by  keshav  */ }
/* -------------------------------------------------
   DELETE DIRECTORY
------------------------------------------------- */
export const deleteDirectoryFromS3 = async ({
  directoryName
}: {
  directoryName: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `${directoryName}/`
  });

  await s3Client.send(command);
};

/* -------------------------------------------------
   OPTIMIZE AND UPLOAD FILE WITH COMPRESSION
------------------------------------------------- */
export const addFileToS3 = async ({
  directoryName,
  fileType,
  fileName,
  buffer,
  extension
}: {
  directoryName: string;
  fileType: "image";
  fileName: string;
  buffer: Buffer;
  extension: string;
}) => {
  let optimizedBuffer = buffer;
  let contentType = `${fileType}/${extension}`;

  // Optimize images for better performance
  if (fileType === "image") {
    try {
      const sharpInstance = sharp(buffer);
      const metadata = await sharpInstance.metadata();

      // Convert to WebP for better compression (fallback to original format)
      if (extension === "webp" || extension === "jpg" || extension === "jpeg" || extension === "png") {
        optimizedBuffer = await sharpInstance
          .webp({
            quality: 85,
            effort: 4
          })
          .toBuffer();
        contentType = "image/webp";
        fileName = fileName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }

      // Resize large images
      if (metadata.width && metadata.width > 1920) {
        optimizedBuffer = await sharp(optimizedBuffer)
          .resize(1920, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .toBuffer();
      }
    } catch (error) {
      // Fallback to original buffer if optimization fails
    }
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: `${directoryName}/${fileName}`,
      Body: optimizedBuffer,
      ContentType: contentType,
      // Add caching headers for better performance
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        'original-size': buffer.length.toString(),
        'optimized-size': optimizedBuffer.length.toString()
      }
    }
  });

  await upload.done();

  return {
    fileName,
    originalSize: buffer.length,
    optimizedSize: optimizedBuffer.length,
    compressionRatio: ((buffer.length - optimizedBuffer.length) / buffer.length * 100).toFixed(2)
  };
};

/* -------------------------------------------------
   DELETE SINGLE FILE
------------------------------------------------- */
export const deleteFileFromS3 = async ({
  directoryName,
  fileName
}: {
  directoryName: string;
  fileName: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `${directoryName}/${fileName}`
  });

  await s3Client.send(command);
};

/* -------------------------------------------------
   DELETE MULTIPLE FILES
------------------------------------------------- */
export const deleteFilesFromS3 = async ({
  directoryName,
  fileNames
}: {
  directoryName: string;
  fileNames: string[];
}) => {
  const command = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: {
      Objects: fileNames.map((file) => ({
        Key: `${directoryName}/${file}`
      }))
    }
  });

  await s3Client.send(command);
};

/* -------------------------------------------------
   BATCH UPLOAD WITH OPTIMIZATION
------------------------------------------------- */
export const addMultipleFilesToS3 = async ({
  directoryName,
  files
}: {
  directoryName: string;
  files: Array<{
    fileName: string;
    buffer: Buffer;
    extension: string;
    fileType: "image";
  }>;
}) => {
  const uploadPromises = files.map(file =>
    addFileToS3({
      directoryName,
      fileType: file.fileType,
      fileName: file.fileName,
      buffer: file.buffer,
      extension: file.extension
    })
  );

  return Promise.all(uploadPromises);
};

/* -------------------------------------------------
   GENERATE OPTIMIZED IMAGE VARIANTS
------------------------------------------------- */
export const addImageWithVariants = async ({
  directoryName,
  fileName,
  buffer,
  extension
}: {
  directoryName: string;
  fileName: string;
  buffer: Buffer;
  extension: string;
}) => {
  const variants = [
    { suffix: '_thumb', width: 300, quality: 80 },
    { suffix: '_medium', width: 800, quality: 85 },
    { suffix: '_large', width: 1920, quality: 90 }
  ];

  const uploadPromises = variants.map(async (variant) => {
    try {
      const optimizedBuffer = await sharp(buffer)
        .resize(variant.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: variant.quality })
        .toBuffer();

      const variantFileName = fileName.replace(/\.[^.]+$/, `${variant.suffix}.webp`);

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: `${directoryName}/${variantFileName}`,
          Body: optimizedBuffer,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable"
        }
      });

      await upload.done();
      return { variant: variant.suffix, fileName: variantFileName };
    } catch (error) {
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean);
};