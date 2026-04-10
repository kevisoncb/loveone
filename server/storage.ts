import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

// Ensure required environment variables are set
if (!ENV.S3_BUCKET_NAME || !ENV.S3_REGION) {
  throw new Error("S3 configuration is missing: set S3_BUCKET_NAME and S3_REGION");
}

const s3Client = new S3Client({
  region: ENV.S3_REGION,
  // Credentials will be automatically sourced from environment variables
  // (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
});

const BUCKET_NAME = ENV.S3_BUCKET_NAME;

/**
 * Generates a presigned URL for uploading a file directly to S3.
 * @param {string} fileType - The MIME type of the file (e.g., "image/jpeg").
 * @param {string} userId - The ID of the user uploading the file to create a user-specific path.
 * @returns {Promise<{ uploadUrl: string, key: string }>} - The presigned URL for the upload and the unique key for the object in S3.
 */
export async function getPresignedUploadUrl(fileType: string, userId: string) {
  const key = `tributes/${userId}/${nanoid()}.${fileType.split("/")[1] || "bin"}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return { uploadUrl, key };
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    throw new Error("Could not create a presigned URL for upload.");
  }
}

/**
 * Returns the public URL for an object stored in S3.
 * @param {string} key - The unique key of the object in S3.
 * @returns {string} - The public, readable URL of the object.
 */
export function getPublicUrl(key: string): string {
    // Assuming the bucket has public access enabled or is served via CloudFront
    return `https://${BUCKET_NAME}.s3.${ENV.S3_REGION}.amazonaws.com/${key}`;
}
