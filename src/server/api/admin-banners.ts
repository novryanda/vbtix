import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerStatus,
  reorderBanners,
} from "~/server/services/banner.service";
import { deleteImage } from "~/lib/cloudinary-utils";

export interface GetBannersParams {
  page?: string;
  limit?: string;
  active?: boolean;
}

export interface CreateBannerData {
  title: string;
  description?: string;
  imageUrl: string;
  imagePublicId: string;
  linkUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
}

export interface UpdateBannerData {
  title?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  linkUrl?: string | null;
  isActive?: boolean;
  displayOrder?: number;
  startDate?: Date | null;
  endDate?: Date | null;
  updatedBy: string;
}

/**
 * Get banners with pagination and filters
 */
export async function handleGetBanners(params: GetBannersParams) {
  try {
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = params.limit ? parseInt(params.limit, 10) : 10;

    // Validate pagination parameters
    if (page < 1) {
      throw new Error("Page must be greater than 0");
    }
    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const result = await getBanners({
      page,
      limit,
      active: params.active,
    });

    return result;
  } catch (error) {
    console.error("Error in handleGetBanners:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to get banners");
  }
}

/**
 * Get banner by ID
 */
export async function handleGetBannerById(bannerId: string) {
  try {
    if (!bannerId) {
      throw new Error("Banner ID is required");
    }

    const banner = await getBannerById(bannerId);
    
    if (!banner) {
      throw new Error("Banner not found");
    }

    return banner;
  } catch (error) {
    console.error("Error in handleGetBannerById:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to get banner");
  }
}

/**
 * Create a new banner
 */
export async function handleCreateBanner(data: CreateBannerData) {
  try {
    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }
    if (!data.imageUrl?.trim()) {
      throw new Error("Image URL is required");
    }
    if (!data.imagePublicId?.trim()) {
      throw new Error("Image public ID is required");
    }
    if (!data.createdBy?.trim()) {
      throw new Error("Created by is required");
    }

    // Validate date range if both dates are provided
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new Error("End date must be after start date");
    }

    const banner = await createBanner(data);
    return banner;
  } catch (error) {
    console.error("Error in handleCreateBanner:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create banner");
  }
}

/**
 * Update banner
 */
export async function handleUpdateBanner(bannerId: string, data: UpdateBannerData) {
  try {
    if (!bannerId) {
      throw new Error("Banner ID is required");
    }
    if (!data.updatedBy?.trim()) {
      throw new Error("Updated by is required");
    }

    // Check if banner exists
    const existingBanner = await getBannerById(bannerId);
    if (!existingBanner) {
      throw new Error("Banner not found");
    }

    // Validate date range if both dates are provided
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new Error("End date must be after start date");
    }

    const banner = await updateBanner(bannerId, data);
    return banner;
  } catch (error) {
    console.error("Error in handleUpdateBanner:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update banner");
  }
}

/**
 * Delete banner
 */
export async function handleDeleteBanner(bannerId: string) {
  try {
    if (!bannerId) {
      throw new Error("Banner ID is required");
    }

    // Check if banner exists and get image public ID for cleanup
    const existingBanner = await getBannerById(bannerId);
    if (!existingBanner) {
      throw new Error("Banner not found");
    }

    // Delete banner from database
    await deleteBanner(bannerId);

    // Clean up image from Cloudinary
    if (existingBanner.imagePublicId) {
      try {
        await deleteImage(existingBanner.imagePublicId);
      } catch (imageError) {
        console.warn("Failed to delete image from Cloudinary:", imageError);
        // Don't throw error here as banner is already deleted from database
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in handleDeleteBanner:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete banner");
  }
}

/**
 * Update banner status (activate/deactivate)
 */
export async function handleUpdateBannerStatus(
  bannerId: string, 
  isActive: boolean, 
  updatedBy: string
) {
  try {
    if (!bannerId) {
      throw new Error("Banner ID is required");
    }
    if (!updatedBy?.trim()) {
      throw new Error("Updated by is required");
    }

    // Check if banner exists
    const existingBanner = await getBannerById(bannerId);
    if (!existingBanner) {
      throw new Error("Banner not found");
    }

    const banner = await updateBannerStatus(bannerId, isActive, updatedBy);
    return banner;
  } catch (error) {
    console.error("Error in handleUpdateBannerStatus:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update banner status");
  }
}

/**
 * Reorder banners
 */
export async function handleReorderBanners(bannerIds: string[], updatedBy: string) {
  try {
    if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
      throw new Error("Banner IDs array is required");
    }
    if (!updatedBy?.trim()) {
      throw new Error("Updated by is required");
    }

    // Validate all banner IDs are unique
    const uniqueIds = new Set(bannerIds);
    if (uniqueIds.size !== bannerIds.length) {
      throw new Error("Duplicate banner IDs found");
    }

    const banners = await reorderBanners(bannerIds, updatedBy);
    return banners;
  } catch (error) {
    console.error("Error in handleReorderBanners:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to reorder banners");
  }
}
