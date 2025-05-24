import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";
import { formatDate } from "~/lib/utils";
import { ApprovalStatus, VerificationStatus } from "@prisma/client";
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
 * Handle user organizer verification (create organizer record when approved)
 */
async function handleUserOrganizerVerification(
  userId: string,
  verified: boolean,
  notes?: string,
  adminId?: string,
  userVerificationApproval?: any,
) {
  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  if (verified) {
    // Create organizer record when approved
    let verificationData = {};

    try {
      // Parse verification data from approval notes
      if (userVerificationApproval?.notes) {
        const parsedNotes = JSON.parse(userVerificationApproval.notes);
        verificationData = parsedNotes.verificationData || {};
      }
    } catch (error) {
      console.error("Error parsing verification data:", error);
    }

    // Create organizer record
    const organizer = await organizerService.createOrganizer({
      user: { connect: { id: userId } },
      orgName: user.name || "Organizer",
      verified: true, // Set as verified since admin approved
    });

    // Create organizer verification record with the submitted data
    await prisma.organizerVerification.create({
      data: {
        organizerId: organizer.id,
        ...verificationData,
        status: "APPROVED",
        submittedAt: userVerificationApproval?.submittedAt || new Date(),
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    // Update the approval record
    await prisma.approval.update({
      where: { id: userVerificationApproval.id },
      data: {
        status: "APPROVED",
        notes:
          notes ||
          "Organizer verification approved and organizer record created",
        reviewerId: adminId,
        reviewedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "User verification approved and organizer record created",
      organizer,
    };
  } else {
    // Reject the verification request
    await prisma.approval.update({
      where: { id: userVerificationApproval.id },
      data: {
        status: "REJECTED",
        notes: notes || "Organizer verification rejected",
        reviewerId: adminId,
        reviewedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "User verification rejected",
    };
  }
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

  // Check if this is a user verification request (no organizer record yet)
  const userVerificationApproval = await prisma.approval.findFirst({
    where: {
      entityType: "USER_ORGANIZER_VERIFICATION",
      entityId: id,
      status: "PENDING",
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  if (userVerificationApproval) {
    // This is a user verification request
    return await handleUserOrganizerVerification(
      id,
      verified,
      notes,
      adminId,
      userVerificationApproval,
    );
  }

  // This is a regular organizer verification
  const existingOrganizer = await organizerService.findById(id);
  if (!existingOrganizer) {
    // Try to find by userId instead (for backward compatibility)
    const organizerByUserId = await organizerService.findByUserId(id);
    if (!organizerByUserId) {
      throw new Error("Organizer not found");
    }
    // Use the organizer ID for verification
    await organizerService.verifyOrganizer(organizerByUserId.id, verified);
  } else {
    // Memperbarui status verifikasi pada organizer
    await organizerService.verifyOrganizer(id, verified);
  }

  // Get all approvals for debugging
  const allApprovals = await prisma.approval.findMany({
    where: {
      entityType: "ORGANIZER",
      entityId: id,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  console.log(
    "Admin - All approvals before update:",
    allApprovals.map((a) => ({
      id: a.id,
      status: a.status,
      submittedAt: a.submittedAt,
      reviewedAt: a.reviewedAt,
    })),
  );

  // Find any pending approval and update it
  const pendingApproval = await prisma.approval.findFirst({
    where: {
      entityType: "ORGANIZER",
      entityId: id,
      status: "PENDING",
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  if (pendingApproval) {
    // Update the existing pending approval
    console.log(
      `Updating existing approval ${pendingApproval.id} to ${verified ? "APPROVED" : "REJECTED"}`,
    );
    await prisma.approval.update({
      where: { id: pendingApproval.id },
      data: {
        status: verified ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
        notes,
        reviewerId: adminId,
        reviewedAt: new Date(),
      },
    });
  } else {
    // Create a new approval record
    console.log(`Creating new approval for organizer ${id}`);
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
  }

  // Get all approvals after update for debugging
  const updatedApprovals = await prisma.approval.findMany({
    where: {
      entityType: "ORGANIZER",
      entityId: id,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  console.log(
    "Admin - All approvals after update:",
    updatedApprovals.map((a) => ({
      id: a.id,
      status: a.status,
      submittedAt: a.submittedAt,
      reviewedAt: a.reviewedAt,
    })),
  );

  // Update verification status in OrganizerVerification if it exists
  if (existingOrganizer.verification) {
    await prisma.organizerVerification.update({
      where: { organizerId: id },
      data: {
        status: verified
          ? VerificationStatus.APPROVED
          : VerificationStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: !verified ? notes : undefined,
      },
    });
  }

  // Get the updated organizer with verification details
  const refreshedOrganizer = await organizerService.findById(id);

  if (!refreshedOrganizer) {
    throw new Error("Failed to retrieve updated organizer");
  }

  return {
    ...refreshedOrganizer,
    formattedCreatedAt: formatDate(refreshedOrganizer.createdAt),
    formattedUpdatedAt: formatDate(refreshedOrganizer.updatedAt),
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
