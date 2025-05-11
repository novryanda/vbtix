"use client"

import { LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

export function SiteHeader() {
    const { data: session } = useSession();

    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
                <div className="flex items-center gap-1">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <h1 className="text-base font-medium">VBTix Admin Dashboard</h1>
                </div>

                {session?.user && (
                    <div className="flex items-center gap-2">
                        <span className="hidden text-sm text-muted-foreground md:inline-block">
                            {session.user.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="h-8 gap-1 px-2"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline-block">Logout</span>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    )
}
