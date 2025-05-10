// src/types/next-auth.d.ts
import { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: UserRole;
    }

    interface Session {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: UserRole;
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
    }
}