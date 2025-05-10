import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "~/server/services/auth.service";

// Schema validasi untuk request pendaftaran
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validasi input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Daftarkan pengguna baru
    await registerUser(email, password, name);

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle error yang diketahui
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Handle error yang tidak diketahui
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    );
  }
}