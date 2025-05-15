import { env } from "~/env";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a single file to Cloudinary using server-side API
 * @param file The file to upload
 * @returns Promise with the upload result containing URL and public ID
 */
export async function uploadToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  // Upload via our server-side API endpoint
  const response = await fetch("/api/upload", {
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
}

/**
 * Uploads multiple files to Cloudinary in parallel
 * @param files Array of files to upload
 * @param onProgress Optional callback for progress updates
 * @returns Promise with array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<CloudinaryUploadResult[]> {
  const total = files.length;
  let completed = 0;

  // Create an array of promises for each file upload
  const uploadPromises = files.map(async (file) => {
    try {
      const result = await uploadToCloudinary(file);

      // Update progress
      completed++;
      onProgress?.(completed, total);

      return result;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  });

  // Wait for all uploads to complete
  return Promise.all(uploadPromises);
}
