import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset, resetPassword } from "~/server/services/auth.service";

// Schema validasi untuk request reset password
const requestResetSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

// Schema validasi untuk reset password
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token reset password diperlukan"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validasi input untuk request reset password
    const requestResult = requestResetSchema.safeParse(body);
    if (requestResult.success) {
      const { email } = requestResult.data;

      // Kirim email reset password
      await requestPasswordReset(email);

      return NextResponse.json(
        {
          success: true,
          message: "Instruksi reset password telah dikirim ke email Anda."
        },
        { status: 200 }
      );
    }

    // Jika bukan request reset, coba validasi sebagai reset password
    const resetResult = resetPasswordSchema.safeParse(body);
    if (resetResult.success) {
      const { token, password } = resetResult.data;

      // Reset password
      await resetPassword(token, password);

      return NextResponse.json(
        {
          success: true,
          message: "Password berhasil diubah. Silakan login dengan password baru."
        },
        { status: 200 }
      );
    }

    // Jika kedua validasi gagal
    return NextResponse.json(
      { success: false, error: "Data tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);

    // Handle error yang diketahui
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Handle error yang tidak diketahui
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat reset password" },
      { status: 500 }
    );
  }
}