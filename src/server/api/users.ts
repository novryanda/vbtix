import { userService } from "~/server/services/user.service";
import { UserRole } from "@prisma/client";

/**
 * Generate a random password
 */

/**
 * Mendapatkan daftar user dengan pagination dan filter
 */
export async function handleGetUsers(params: {
    page?: number | string;
    limit?: number | string;
    role?: UserRole;
    search?: string;
    isActive?: boolean | string;
}) {
    console.log("handleGetUsers params:", params);

    // Validasi parameter
    const validPage = params.page ? Math.max(1, Number(params.page)) : 1;
    const validLimit = params.limit ? Math.min(100, Math.max(1, Number(params.limit))) : 10;

    // Parse isActive jika berupa string
    let activeFilter: boolean | undefined = undefined;
    if (params.isActive !== undefined) {
        if (typeof params.isActive === "string") {
            activeFilter = params.isActive.toLowerCase() === "true";
        } else {
            activeFilter = params.isActive;
        }
    }

    console.log("Processed params:", {
        page: validPage,
        limit: validLimit,
        role: params.role,
        search: params.search,
        isActive: activeFilter
    });

    // Memanggil service
    const { users, total } = await userService.findAll({
        page: validPage,
        limit: validLimit,
        role: params.role,
        search: params.search,
        isActive: activeFilter
    });

    console.log(`Found ${users.length} users out of ${total} total`);

    // Transformasi data (jika diperlukan)
    const processedUsers = users.map(user => ({
        ...user,
        isActive: user.emailVerified !== null,
        // Format tanggal jika diperlukan
        formattedCreatedAt: formatDate(user.createdAt)
    }));

    // Menghitung metadata pagination
    const totalPages = Math.ceil(total / validLimit);

    return {
        users: processedUsers,
        meta: {
            page: validPage,
            limit: validLimit,
            total,
            totalPages
        }
    };
}

/**
 * Mendapatkan detail user berdasarkan ID
 */
export async function handleGetUserById(id: string) {
    if (!id) throw new Error("User ID is required");

    const user = await userService.findById(id);
    if (!user) throw new Error("User not found");

    return {
        ...user,
        isActive: user.emailVerified !== null,
        formattedCreatedAt: formatDate(user.createdAt),
        formattedUpdatedAt: formatDate(user.updatedAt)
    };
}

/**
 * Membuat user baru
 */
export async function handleCreateUser(data: {
    name?: string;
    email: string;
    password?: string;
    phone?: string;
    role?: UserRole;
}) {
    // Validasi email unik
    const isEmailTaken = await userService.isEmailTaken(data.email);
    if (isEmailTaken) {
        throw new Error("Email is already taken");
    }

    // Generate password jika tidak disediakan
    const password = data.password || generateRandomPassword();

    // Buat user
    const user = await userService.createUser({
        name: data.name,
        email: data.email,
        password,
        phone: data.phone,
        role: data.role
    });

    // Kirim email dengan password jika password di-generate
    if (!data.password) {
        // Fungsi ini harus diimplementasikan terpisah
        // sendWelcomeEmail(user.email, password);
        console.log(`Generated password for ${user.email}: ${password}`);
    }

    return user;
}

/**
 * Memperbarui data user
 */
export async function handleUpdateUser(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
}) {
    if (!id) throw new Error("User ID is required");

    // Verifikasi user ada
    const existingUser = await userService.findById(id);
    if (!existingUser) throw new Error("User not found");

    // Validasi email unik jika email diubah
    if (data.email && data.email !== existingUser.email) {
        const isEmailTaken = await userService.isEmailTaken(data.email);
        if (isEmailTaken) {
            throw new Error("Email is already taken");
        }
    }

    // Update user
    const updatedUser = await userService.updateUser(id, data);

    return {
        ...updatedUser,
        isActive: updatedUser.emailVerified !== null,
        formattedUpdatedAt: formatDate(updatedUser.updatedAt)
    };
}

/**
 * Menghapus user
 */
export async function handleDeleteUser(id: string) {
    if (!id) throw new Error("User ID is required");

    // Verifikasi user ada
    const existingUser = await userService.findById(id);
    if (!existingUser) throw new Error("User not found");

    // Pemeriksaan bisnis tambahan jika diperlukan
    // Misalnya, tidak boleh menghapus admin terakhir, dll.
    if (existingUser.role === UserRole.ADMIN) {
        // Hitung admin yang tersisa
        const { users, total } = await userService.findAll({
            role: UserRole.ADMIN
        });

        if (total <= 1) {
            throw new Error("Cannot delete the last admin user");
        }
    }

    // Hapus user
    await userService.deleteUser(id);

    return { success: true, message: "User deleted successfully" };
}

/**
 * Mengubah role user
 */
export async function handleChangeUserRole(id: string, role: UserRole) {
    if (!id) throw new Error("User ID is required");
    if (!role) throw new Error("Role is required");

    // Verifikasi user ada
    const existingUser = await userService.findById(id);
    if (!existingUser) throw new Error("User not found");

    // Validasi bisnis tambahan jika diperlukan
    if (existingUser.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
        // Hitung admin yang tersisa
        const { users, total } = await userService.findAll({
            role: UserRole.ADMIN
        });

        if (total <= 1) {
            throw new Error("Cannot change role of the last admin user");
        }
    }

    // Ubah role
    const updatedUser = await userService.changeRole(id, role);

    return updatedUser;
}

/**
 * Mengaktifkan/menonaktifkan user
 */
export async function handleToggleUserStatus(id: string, isActive: boolean) {
    if (!id) throw new Error("User ID is required");
    if (isActive === undefined) throw new Error("Status is required");

    // Verifikasi user ada
    const existingUser = await userService.findById(id);
    if (!existingUser) throw new Error("User not found");

    // Validasi bisnis tambahan jika diperlukan
    if (!isActive && existingUser.role === UserRole.ADMIN) {
        // Hitung admin aktif yang tersisa
        const { users, total } = await userService.findAll({
            role: UserRole.ADMIN,
            isActive: true
        });

        if (total <= 1) {
            throw new Error("Cannot deactivate the last active admin user");
        }
    }

    // Toggle status
    const updatedUser = await userService.setActive(id, isActive);

    return updatedUser;
}

/**
 * Me-reset password user
 */
export async function handleResetUserPassword(id: string, options?: {
    sendEmail?: boolean;
    customPassword?: string;
}) {
    if (!id) throw new Error("User ID is required");

    // Verifikasi user ada
    const existingUser = await userService.findById(id);
    if (!existingUser) throw new Error("User not found");

    // Generate password baru atau gunakan custom password
    const newPassword = options?.customPassword || generateRandomPassword();

    // Reset password
    const result = await userService.resetPassword(id, newPassword);

    // Kirim email jika diminta
    if (options?.sendEmail !== false) {
        // Fungsi ini harus diimplementasikan terpisah
        // await sendPasswordResetEmail(existingUser.email, newPassword);
        console.log(`Password reset for ${existingUser.email}: ${newPassword}`);
    }

    return {
        id: result.id,
        email: result.email,
        password: newPassword, // Hanya dikembalikan jika diperlukan admin
        resetAt: result.updatedAt
    };
}

/**
 * Format date helper function
 */
function formatDate(date: Date | null | undefined) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}