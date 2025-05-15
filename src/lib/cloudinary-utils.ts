// ~/lib/cloudinary-utils.ts
import cloudinary from "./cloudinary";

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

/**
 * Upload an image to Cloudinary from the server
 * @param {File | Buffer} file - The file to upload (Buffer for server-side)
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<UploadResult>} - The upload result with image URL and details
 */
export async function uploadImage(
  file: Buffer,
  folder = "vbtix",
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result)
            return reject(error || new Error("Upload failed"));
          resolve(result as UploadResult);
        },
      )
      .end(file);
  });
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Generate a Cloudinary URL with transformations
 * @param {string} publicId - The public_id of the image
 * @param {object} options - Transformation options
 * @returns {string} - Transformed image URL
 */
export function getImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  } = {},
): string {
  if (!publicId) return "";

  return cloudinary.url(publicId, {
    secure: true,
    width: options.width,
    height: options.height,
    crop: options.crop || "fill",
    quality: options.quality || "auto",
    fetch_format: "auto",
  });
}
