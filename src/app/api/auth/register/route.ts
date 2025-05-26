import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerOrganizer } from "~/server/services/auth.service";

// Schema validasi untuk request pendaftaran organizer
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  orgName: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  legalName: z.string().optional(),
  phone: z.string().optional(),
  npwp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log("📨 Registration API called");

    // Parse request body
    const body = await req.json();
    console.log("📋 Request body received:", { ...body, password: "[HIDDEN]" });

    // Validasi input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      console.log("❌ Validation failed:", result.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
        },
        { status: 400 },
      );
    }

    const { name, email, password, orgName, legalName, phone, npwp } =
      result.data;

    console.log("✅ Validation passed, calling registerOrganizer...");

    // Daftarkan organizer baru
    const registrationResult = await registerOrganizer(email, password, name, {
      orgName,
      legalName,
      phone,
      npwp,
    });

    console.log("🎉 Registration successful:", {
      userId: registrationResult.user.id,
      organizerId: registrationResult.organizer.id,
      userRole: registrationResult.user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Pendaftaran organizer berhasil. Silakan cek email Anda untuk verifikasi.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle error yang diketahui
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Handle error yang tidak diketahui
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 },
    );
  }
}
