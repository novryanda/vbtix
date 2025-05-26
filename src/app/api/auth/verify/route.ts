import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmail } from "~/server/services/auth.service";

// Schema validasi untuk request verifikasi
const verifySchema = z.object({
  token: z.string().min(1, "Token verifikasi diperlukan"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validasi input
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
        },
        { status: 400 },
      );
    }

    const { token } = result.data;

    // Verifikasi email
    await verifyEmail(token);

    return NextResponse.json(
      {
        success: true,
        message: "Email berhasil diverifikasi. Silakan login.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying email:", error);

    // Handle error yang diketahui
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Handle error yang tidak diketahui
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat verifikasi email" },
      { status: 500 },
    );
  }
}
