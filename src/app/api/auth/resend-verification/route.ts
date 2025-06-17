import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "~/server/db/client";
import { randomBytes } from "crypto";

// Schema validasi untuk request resend verification
const resendVerificationSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validasi input
    const result = resendVerificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
        },
        { status: 400 },
      );
    }

    const { email } = result.data;

    // Cek apakah user dengan email tersebut ada
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email tidak terdaftar" },
        { status: 404 },
      );
    }

    // Cek apakah email sudah diverifikasi
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email sudah diverifikasi" },
        { status: 400 },
      );
    }

    // Hapus token verifikasi lama jika ada
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Buat token verifikasi baru
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token berlaku 24 jam

    // Simpan token verifikasi baru
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    });

    // Kirim email verifikasi
    try {
      const { emailService } = await import("~/lib/email-service");
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'https://vbticket.com'}/verify/${verificationToken}`;

      await emailService.sendAccountVerification({
        to: email,
        userName: user.name || "User",
        verificationUrl,
      });

      console.log("✅ Resend verification email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Failed to send resend verification email:", emailError);
      return NextResponse.json(
        { success: false, error: "Gagal mengirim email verifikasi" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error resending verification email:", error);

    // Handle error yang diketahui
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
