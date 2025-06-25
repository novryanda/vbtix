import { prisma } from "~/server/db";
import { Banner } from "@prisma/client";

export interface GetBannersOptions {
  page: number;
  limit: number;
  active?: boolean;
}

export interface GetBannersResult {
  banners: Banner[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
export async function getBanners(options: GetBannersOptions): Promise<GetBannersResult> {
  const { page, limit, active } = options;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (active !== undefined) {
    where.isActive = active;
  }

  // Get total count
  const total = await prisma.banner.count({ where });

  // Get banners
  const banners = await prisma.banner.findMany({
    where,
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "desc" }
    ],
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    banners,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

/**
 * Get banner by ID
 */
export async function getBannerById(bannerId: string): Promise<Banner | null> {
  return await prisma.banner.findUnique({
    where: { id: bannerId },
  });
}

/**
 * Get active banners for public display
 */
export async function getActiveBanners(): Promise<Banner[]> {
  const now = new Date();
  
  return await prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [
        {
          AND: [
            { startDate: null },
            { endDate: null }
          ]
        },
        {
          AND: [
            { startDate: { lte: now } },
            { endDate: { gte: now } }
          ]
        },
        {
          AND: [
            { startDate: { lte: now } },
            { endDate: null }
          ]
        },
        {
          AND: [
            { startDate: null },
            { endDate: { gte: now } }
          ]
        }
      ]
    },
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "desc" }
    ],
  });
}

/**
 * Create a new banner
 */
export async function createBanner(data: CreateBannerData): Promise<Banner> {
  // Get the next display order if not provided
  let displayOrder = data.displayOrder;
  if (displayOrder === undefined) {
    const lastBanner = await prisma.banner.findFirst({
      orderBy: { displayOrder: "desc" },
    });
    displayOrder = (lastBanner?.displayOrder || 0) + 1;
  }

  return await prisma.banner.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
      linkUrl: data.linkUrl,
      isActive: data.isActive || false,
      displayOrder,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
  });
}

/**
 * Update banner
 */
export async function updateBanner(bannerId: string, data: UpdateBannerData): Promise<Banner> {
  const updateData: any = {
    updatedBy: data.updatedBy,
    updatedAt: new Date(),
  };

  // Only include fields that are provided
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imagePublicId !== undefined) updateData.imagePublicId = data.imagePublicId;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;

  return await prisma.banner.update({
    where: { id: bannerId },
    data: updateData,
  });
}

/**
 * Delete banner
 */
export async function deleteBanner(bannerId: string): Promise<void> {
  await prisma.banner.delete({
    where: { id: bannerId },
  });
}

/**
 * Update banner status
 */
export async function updateBannerStatus(
  bannerId: string,
  isActive: boolean,
  updatedBy: string
): Promise<Banner> {
  return await prisma.banner.update({
    where: { id: bannerId },
    data: {
      isActive,
      updatedBy,
      updatedAt: new Date(),
    },
  });
}

/**
 * Reorder banners
 */
export async function reorderBanners(bannerIds: string[], updatedBy: string): Promise<Banner[]> {
  // Use transaction to ensure consistency
  return await prisma.$transaction(async (tx) => {
    const updatedBanners: Banner[] = [];

    for (let i = 0; i < bannerIds.length; i++) {
      const bannerId = bannerIds[i];
      const displayOrder = i + 1;

      const banner = await tx.banner.update({
        where: { id: bannerId },
        data: {
          displayOrder,
          updatedBy,
          updatedAt: new Date(),
        },
      });

      updatedBanners.push(banner);
    }

    return updatedBanners;
  });
}

/**
 * Get banner statistics
 */
export async function getBannerStats() {
  const [total, active, inactive] = await Promise.all([
    prisma.banner.count(),
    prisma.banner.count({ where: { isActive: true } }),
    prisma.banner.count({ where: { isActive: false } }),
  ]);

  return {
    total,
    active,
    inactive,
  };
}
