import { organizerService } from "~/server/services/organizer.service";
import { formatDate } from "~/lib/utils";
import type { UpdateOrganizerSettingsSchema } from "~/lib/validations/organizer.schema";

/**
 * Get settings for an organizer
 */
export async function handleGetOrganizerSettings(params: { userId: string }) {
  const { userId } = params;

  if (!userId) throw new Error("User ID is required");

  // Find organizer by user ID
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("Organizer not found");
  }

  // Format dates for frontend
  return {
    ...organizer,
    formattedCreatedAt: formatDate(organizer.createdAt),
    formattedUpdatedAt: formatDate(organizer.updatedAt),
  };
}

/**
 * Update settings for an organizer
 */
export async function handleUpdateOrganizerSettings(params: {
  userId: string;
  settingsData: UpdateOrganizerSettingsSchema;
}) {
  const { userId, settingsData } = params;

  if (!userId) throw new Error("User ID is required");

  // Find organizer by user ID
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("Organizer not found");
  }

  // Extract bank account data if provided
  const { bankAccount, ...organizerData } = settingsData;

  // Update organizer data
  const updatedOrganizer = await organizerService.updateOrganizer(
    organizer.id,
    organizerData,
  );

  // Update bank account if provided
  if (bankAccount) {
    await organizerService.updateBankAccount(organizer.id, bankAccount);
  }

  // Get the updated organizer with bank account
  const refreshedOrganizer = await organizerService.findById(organizer.id);

  if (!refreshedOrganizer) {
    throw new Error("Failed to retrieve updated organizer data");
  }

  // Format dates for frontend
  return {
    ...refreshedOrganizer,
    formattedCreatedAt: formatDate(refreshedOrganizer.createdAt),
    formattedUpdatedAt: formatDate(refreshedOrganizer.updatedAt),
  };
}
