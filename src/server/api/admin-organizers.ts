import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";
import { formatDate } from "~/lib/utils";
import { ApprovalStatus } from "@prisma/client";
import { prisma } from "~/server/db";

/**
 * Mendapatkan daftar organizer dengan pagination dan filter
 */
export async function handleGetOrganizers(params: {
  page?: number;
  limit?: number;
  search?: string;
  verified?: boolean;
}) {
  console.log("handleGetOrganizers params:", params);

  // Set default values for pagination
  const page = params.page || 1;
  const limit = params.limit || 10;

  // Memanggil service
  const { organizers, total } = await organizerService.findAll({
    page,
    limit,
    search: params.search,
    verified: params.verified,
  });

  // Transformasi data jika diperlukan
  const processedOrganizers = organizers.map((organizer) => ({
    ...organizer,
    formattedCreatedAt: formatDate(organizer.createdAt),
    eventsCount: organizer.events.length,
  }));

  // Menghitung metadata pagination
  const totalPages = Math.ceil(total / limit);

  return {
    organizers: processedOrganizers,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Mendapatkan detail organizer berdasarkan ID
 */
export async function handleGetOrganizerById(id: string) {
  if (!id) throw new Error("Organizer ID is required");

  // Memanggil service
  const organizer = await organizerService.findById(id);
  if (!organizer) throw new Error("Organizer not found");

  // Mendapatkan statistik event menggunakan eventService
  const { events, total } = await eventService.findAll({
    organizerId: id,
    limit: 5,
  });

  return {
    ...organizer,
    formattedCreatedAt: formatDate(organizer.createdAt),
    formattedUpdatedAt: formatDate(organizer.updatedAt),
    events: events.map((event) => ({
      ...event,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate),
    })),
    eventsCount: total,
  };
}

/**
 * Memverifikasi atau menolak verifikasi organizer
 */
export async function handleVerifyOrganizer(
  id: string,
  verified: boolean,
  notes?: string,
  adminId?: string,
) {
  if (!id) throw new Error("Organizer ID is required");

  // Verifikasi organizer ada
  const existingOrganizer = await organizerService.findById(id);
  if (!existingOrganizer) throw new Error("Organizer not found");

  // Memperbarui status verifikasi
  const updatedOrganizer = await organizerService.verifyOrganizer(id, verified);

  // Membuat catatan approval menggunakan approval service
  await prisma.approval.create({
    data: {
      entityType: "ORGANIZER",
      entityId: id,
      status: verified ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      notes,
      reviewerId: adminId,
      reviewedAt: new Date(),
    },
  });

  return {
    ...updatedOrganizer,
    formattedCreatedAt: formatDate(updatedOrganizer.createdAt),
    formattedUpdatedAt: formatDate(updatedOrganizer.updatedAt),
  };
}

/**
 * Menghapus organizer
 */
export async function handleDeleteOrganizer(id: string) {
  if (!id) throw new Error("Organizer ID is required");

  // Verifikasi organizer ada
  const existingOrganizer = await organizerService.findById(id);
  if (!existingOrganizer) throw new Error("Organizer not found");

  // Menghapus organizer
  return await organizerService.deleteOrganizer(id);
}

/**
 * Mendapatkan statistik organizer
 */
export async function handleGetOrganizerStatistics() {
  // Mendapatkan jumlah total organizer
  const totalOrganizers = await prisma.organizer.count();

  // Mendapatkan jumlah organizer terverifikasi
  const verifiedOrganizers = await prisma.organizer.count({
    where: { verified: true },
  });

  // Mendapatkan jumlah organizer yang menunggu verifikasi
  const pendingOrganizers = await prisma.organizer.count({
    where: { verified: false },
  });

  // Mendapatkan organizer terbaru
  const recentOrganizers = await prisma.organizer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return {
    totalOrganizers,
    verifiedOrganizers,
    pendingOrganizers,
    verificationRate:
      totalOrganizers > 0 ? (verifiedOrganizers / totalOrganizers) * 100 : 0,
    recentOrganizers: recentOrganizers.map((organizer) => ({
      ...organizer,
      formattedCreatedAt: formatDate(organizer.createdAt),
    })),
  };
}
