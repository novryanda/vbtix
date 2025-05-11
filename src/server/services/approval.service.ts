import { prisma } from "~/server/db";
import { ApprovalStatus, Prisma } from "@prisma/client";

export const approvalService = {
    // Mencari approval yang pending
    async findPendingApprovals(type: string) {
        return await prisma.approval.findMany({
            where: {
                entityType: type,
                status: ApprovalStatus.PENDING,
            },
            orderBy: { createdAt: "desc" },
        });
    },

    // Menyetujui item (event, organizer)
    async approveItem(id: string, type: string, userId: string, feedback?: string) {
        return await prisma.approval.update({
            where: { id },
            data: {
                status: ApprovalStatus.APPROVED,
                reviewerId: userId,
                notes: feedback,
                reviewedAt: new Date(),
            },
        });
    },

    // Menolak item (event, organizer)
    async rejectItem(id: string, type: string, userId: string, feedback?: string) {
        return await prisma.approval.update({
            where: { id },
            data: {
                status: ApprovalStatus.REJECTED,
                reviewerId: userId,
                notes: feedback,
                reviewedAt: new Date(),
            },
        });
    },

    // Menambahkan feedback pada approval
    async addFeedback(id: string, feedback: string) {
        return await prisma.approval.update({
            where: { id },
            data: {
                notes: feedback,
            },
        });
    },
};
