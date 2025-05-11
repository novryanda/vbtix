import { eventService } from "~/server/services/event.service";
import { organizerService } from "~/server/services/organizer.service";
import { approvalService } from "~/server/services/approval.service";
import { EventStatus, ApprovalStatus } from "@prisma/client";

/**
 * Mendapatkan daftar event dengan pagination
 */
export async function handleGetEvents(params) {
  const { page = 1, limit = 10, status, organizerId, search } = params;
  
  // Validasi parameter
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  
  // Memanggil service
  const { events, total } = await eventService.findAll({
    page: validPage,
    limit: validLimit,
    status,
    organizerId,
    search
  });
  
  // Transformasi data jika diperlukan
  const processedEvents = events.map(event => ({
    ...event,
    formattedDate: formatDate(event.startDate)
  }));
  
  // Menghitung metadata pagination
  const totalPages = Math.ceil(total / validLimit);
  
  return {
    events: processedEvents,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages
    }
  };
}

/**
 * Membuat event baru
 */
export async function handleCreateEvent(data, userId) {
  // Validasi tambahan jika diperlukan
  
  // Cek apakah user adalah organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }
  
  // Menyiapkan data event
  const eventData = {
    ...data,
    organizerId: organizer.id,
    status: EventStatus.DRAFT
  };
  
  // Memanggil service untuk membuat event
  const event = await eventService.createEvent(eventData);
  
  return event;
}

/**
 * Mendapatkan detail event berdasarkan ID
 */
export async function handleGetEventById(id) {
  if (!id) throw new Error("Event ID is required");
  
  const event = await eventService.findById(id);
  if (!event) throw new Error("Event not found");
  
  return {
    ...event,
    formattedDate: formatDate(event.startDate)
  };
}

/**
 * Memperbarui event
 */
export async function handleUpdateEvent(id, data) {
  if (!id) throw new Error("Event ID is required");
  
  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");
  
  return await eventService.updateEvent(id, data);
}

/**
 * Menghapus event
 */
export async function handleDeleteEvent(id) {
  if (!id) throw new Error("Event ID is required");
  
  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");
  
  return await eventService.deleteEvent(id);
}

/**
 * Mengatur event sebagai featured
 */
export async function handleSetEventFeatured(id, featured) {
  if (!id) throw new Error("Event ID is required");
  
  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");
  
  return await eventService.setFeatured(id, featured);
}

/**
 * Mendapatkan statistik event
 */
export async function handleGetEventStatistics(id) {
  if (!id) throw new Error("Event ID is required");
  
  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");
  
  return await eventService.getStatistics(id);
}

/**
 * Menyetujui atau menolak event
 */
export async function handleReviewEvent(id, status, feedback, adminUserId) {
  if (!id) throw new Error("Event ID is required");
  if (!adminUserId) throw new Error("Admin user ID is required");
  
  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");
  
  // Perbarui status event
  await eventService.reviewEvent(id, status, feedback);
  
  // Tambahkan ke riwayat approval
  if (status === ApprovalStatus.APPROVED) {
    return await approvalService.approveItem(id, "EVENT", adminUserId, feedback);
  } else if (status === ApprovalStatus.REJECTED) {
    return await approvalService.rejectItem(id, "EVENT", adminUserId, feedback);
  } else {
    throw new Error("Invalid approval status");
  }
}

/**
 * Format date helper function
 */
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
