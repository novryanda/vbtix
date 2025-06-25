import { env } from "~/env";

/**
 * Standard response format for Cloudinary uploads (client-side)
 */
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Available upload endpoints for different image types
 */
export enum UploadEndpoint {
  GENERAL = "/api/upload",
  TICKET = "/api/upload/ticket-image",
  EVENT = "/api/upload/event-image",
  PROFILE = "/api/upload/profile-image",
  BANNER = "/api/upload/banner-image",
}

/**
 * Options for uploading images
 */
export interface UploadOptions {
  endpoint?: UploadEndpoint;
  folder?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Options for uploading multiple images
 */
export interface MultiUploadOptions {
  endpoint?: UploadEndpoint;
  folder?: string;
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Uploads a single file to Cloudinary using server-side API
 * @param file The file to upload
 * @param options Upload options including endpoint and callbacks
 * @returns Promise with the upload result containing URL and public ID
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResult> {
  const endpoint = options.endpoint || UploadEndpoint.GENERAL;
  const formData = new FormData();
  formData.append("file", file);

  // Add folder if specified
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  try {
    // Upload via our server-side API endpoint
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Upload error response:", errorData);
      throw new Error(`Failed to upload image: ${errorData}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Upload failed: Invalid response from server");
    }

    return {
      url: result.data.secure_url,
      publicId: result.data.public_id,
    };
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error);
    throw error;
  }
}

/**
 * Uploads multiple files to Cloudinary in parallel
 * @param files Array of files to upload
 * @param options Upload options including endpoint and callbacks
 * @returns Promise with array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: MultiUploadOptions = {},
): Promise<CloudinaryUploadResult[]> {
  const total = files.length;
  let completed = 0;

  // Create an array of promises for each file upload
  const uploadPromises = files.map(async (file) => {
    try {
      const result = await uploadToCloudinary(file, {
        endpoint: options.endpoint,
        folder: options.folder,
      });

      // Update progress
      completed++;
      options.onProgress?.(completed, total);

      return result;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  });

  // Wait for all uploads to complete
  return Promise.all(uploadPromises);
}
