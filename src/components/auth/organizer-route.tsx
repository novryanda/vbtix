"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { useEffect } from "react"

import { LoadingScreen } from "~/components/ui/loading-screen"

export function OrganizerRoute({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        if (!session) {
            router.push("/login")
            return
        }

        // Check if user is an organizer or admin
        if (
            session.user.role !== UserRole.ORGANIZER &&
            session.user.role !== UserRole.ADMIN
        ) {
            router.push("/")
        }
    }, [session, status, router])

    if (status === "loading") {
        return <LoadingScreen />
    }

    if (!session) {
        return null
    }

    if (
        session.user.role !== UserRole.ORGANIZER &&
        session.user.role !== UserRole.ADMIN
    ) {
        return null
    }

    return <>{children}</>
}
