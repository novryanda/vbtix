import { organizerService } from "~/server/services/organizer.service";
import { formatDate } from "~/lib/utils";
import { userService } from "~/server/services/user.service";
import { ApprovalStatus } from "@prisma/client";

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

  // Memanggil service
  const { organizers, total } = await organizerService.findAll({
    page: params.page,
    limit: params.limit,
    search: params.search,
    verified: params.verified
  });

  // Transformasi data jika diperlukan
  const processedOrganizers = organizers.map(organizer => ({
    ...organizer,
    formattedCreatedAt: formatDate(organizer.createdAt),
    eventsCount: organizer.events.length
  }));

  // Menghitung metadata pagination
  const totalPages = Math.ceil(total / params.limit);

  return {
    organizers: processedOrganizers,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages
    }
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

  // Mendapatkan statistik event
  const { events, total } = await organizerService.findOrganizerEvents(id, { limit: 5 });

  return {
    ...organizer,
    formattedCreatedAt: formatDate(organizer.createdAt),
    formattedUpdatedAt: formatDate(organizer.updatedAt),
    events: events.map(event => ({
      ...event,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate)
    })),
    eventsCount: total
  };
}

/**
 * Memverifikasi atau menolak verifikasi organizer
 */
export async function handleVerifyOrganizer(id: string, verified: boolean, notes?: string, adminId?: string) {
  if (!id) throw new Error("Organizer ID is required");

  // Verifikasi organizer ada
  const existingOrganizer = await organizerService.findById(id);
  if (!existingOrganizer) throw new Error("Organizer not found");

  // Memperbarui status verifikasi
  const updatedOrganizer = await organizerService.verifyOrganizer(id, verified);

  // Membuat catatan approval
  await organizerService.createApprovalRecord({
    entityType: 'ORGANIZER',
    entityId: id,
    status: verified ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
    notes,
    reviewerId: adminId
  });

  return {
    ...updatedOrganizer,
    formattedCreatedAt: formatDate(updatedOrganizer.createdAt),
    formattedUpdatedAt: formatDate(updatedOrganizer.updatedAt)
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
  const totalOrganizers = await organizerService.countOrganizers();
  
  // Mendapatkan jumlah organizer terverifikasi
  const verifiedOrganizers = await organizerService.countOrganizers({ verified: true });
  
  // Mendapatkan jumlah organizer yang menunggu verifikasi
  const pendingOrganizers = await organizerService.countOrganizers({ verified: false });
  
  // Mendapatkan organizer terbaru
  const recentOrganizers = await organizerService.getRecentOrganizers(5);

  return {
    totalOrganizers,
    verifiedOrganizers,
    pendingOrganizers,
    verificationRate: totalOrganizers > 0 ? (verifiedOrganizers / totalOrganizers) * 100 : 0,
    recentOrganizers: recentOrganizers.map(organizer => ({
      ...organizer,
      formattedCreatedAt: formatDate(organizer.createdAt)
    }))
  };
}
