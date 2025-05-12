"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import {
    BellIcon,
    CalendarIcon,
    CheckIcon,
    CreditCardIcon,
    LogOutIcon,
    PlusIcon,
    SearchIcon,
    SettingsIcon,
    UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { SidebarTrigger } from "~/components/ui/sidebar"

export function SiteHeader() {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
                <form className="hidden md:block">
                    <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search events..."
                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    asChild
                >
                    <Link href="/organizer/events/create">
                        <PlusIcon className="h-4 w-4" />
                        <span className="sr-only">Create Event</span>
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    asChild
                >
                    <Link href="/organizer/calendar">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="sr-only">Calendar</span>
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                        >
                            <BellIcon className="h-4 w-4" />
                            <Badge
                                variant="destructive"
                                className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0"
                            >
                                <span className="sr-only">4 Notifications</span>
                            </Badge>
                            <span className="sr-only">Notifications</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">New ticket sale</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Someone purchased a ticket for your event
                                    </span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">Event reminder</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Your event "Summer Concert" starts tomorrow
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center">
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                        >
                            <Avatar className="h-6 w-6">
                                <AvatarImage
                                    src={session?.user?.image || ""}
                                    alt={session?.user?.name || "User"}
                                />
                                <AvatarFallback>
                                    {session?.user?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("") || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="sr-only">User menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                <span>Billing</span>
                                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
