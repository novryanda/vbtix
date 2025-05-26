import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db/client";
import { UserRole } from "@prisma/client";

// Schema validasi untuk melengkapi pendaftaran organizer
const completeRegistrationSchema = z.object({
  orgName: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  legalName: z.string().optional(),
  phone: z.string().optional(),
  npwp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Cek autentikasi
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Cek apakah user adalah buyer (belum menjadi organizer)
    if (session.user.role !== UserRole.BUYER) {
      return NextResponse.json(
        {
          success: false,
          error: "User is not eligible for organizer registration",
        },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await req.json();

    // Validasi input
    const result = completeRegistrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
        },
        { status: 400 },
      );
    }

    const { orgName, legalName, phone, npwp } = result.data;

    // Cek apakah user sudah memiliki organizer record
    const existingOrganizer = await prisma.organizer.findUnique({
      where: { userId: session.user.id },
    });

    if (existingOrganizer) {
      return NextResponse.json(
        { success: false, error: "User already has an organizer record" },
        { status: 400 },
      );
    }

    // Update user dan buat organizer record dalam satu transaksi
    const result_transaction = await prisma.$transaction(async (tx) => {
      // Update user role menjadi ORGANIZER
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          role: UserRole.ORGANIZER,
          phone: phone || undefined,
        },
      });

      // Buat organizer record
      const organizer = await tx.organizer.create({
        data: {
          userId: session.user.id,
          orgName,
          legalName: legalName || undefined,
          npwp: npwp || undefined,
          verified: false, // Organizer perlu verifikasi admin
        },
      });

      return { user: updatedUser, organizer };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran organizer berhasil dilengkapi",
        data: {
          userId: result_transaction.user.id,
          organizerId: result_transaction.organizer.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error completing organizer registration:", error);

    // Handle error yang diketahui
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Handle error yang tidak diketahui
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat melengkapi pendaftaran",
      },
      { status: 500 },
    );
  }
}
