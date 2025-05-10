import { UserRole } from "@prisma/client";

/**
 * Konfigurasi sidebar untuk dashboard admin
 */
export const adminSidebarConfig = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: "dashboard",
  },
  {
    title: "Events",
    href: "/dashboard/admin/events",
    icon: "calendar",
    submenu: [
      {
        title: "Semua Events",
        href: "/dashboard/admin/events",
      },
      {
        title: "Pending Approval",
        href: "/dashboard/admin/events/pending",
      },
    ],
  },
  {
    title: "Organizers",
    href: "/dashboard/admin/organizers",
    icon: "users",
  },
  {
    title: "Users",
    href: "/dashboard/admin/users",
    icon: "user",
  },
  {
    title: "Orders",
    href: "/dashboard/admin/orders",
    icon: "shopping-cart",
  },
  {
    title: "Reports",
    href: "/dashboard/admin/reports",
    icon: "bar-chart",
    submenu: [
      {
        title: "Sales",
        href: "/dashboard/admin/reports/sales",
      },
      {
        title: "Events",
        href: "/dashboard/admin/reports/events",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: "settings",
  },
];

/**
 * Konfigurasi sidebar untuk dashboard organizer
 */
export const organizerSidebarConfig = [
  {
    title: "Dashboard",
    href: "/dashboard/organizer",
    icon: "dashboard",
  },
  {
    title: "Events",
    href: "/dashboard/organizer/events",
    icon: "calendar",
    submenu: [
      {
        title: "Semua Events",
        href: "/dashboard/organizer/events",
      },
      {
        title: "Buat Event Baru",
        href: "/dashboard/organizer/events/new",
      },
    ],
  },
  {
    title: "Tickets",
    href: "/dashboard/organizer/tickets",
    icon: "ticket",
  },
  {
    title: "Sales",
    href: "/dashboard/organizer/sales",
    icon: "dollar-sign",
  },
  {
    title: "Settings",
    href: "/dashboard/organizer/settings",
    icon: "settings",
  },
];

/**
 * Konfigurasi sidebar untuk dashboard buyer
 */
export const buyerSidebarConfig = [
  {
    title: "Dashboard",
    href: "/dashboard/buyer",
    icon: "dashboard",
  },
  {
    title: "My Tickets",
    href: "/dashboard/buyer/tickets",
    icon: "ticket",
  },
  {
    title: "My Orders",
    href: "/dashboard/buyer/orders",
    icon: "shopping-cart",
  },
  {
    title: "Checkout",
    href: "/dashboard/buyer/checkout",
    icon: "credit-card",
  },
  {
    title: "Profile",
    href: "/dashboard/buyer/profile",
    icon: "user",
  },
];

/**
 * Mendapatkan konfigurasi sidebar berdasarkan peran pengguna
 */
export const getSidebarConfig = (role: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return adminSidebarConfig;
    case UserRole.ORGANIZER:
      return organizerSidebarConfig;
    case UserRole.BUYER:
    default:
      return buyerSidebarConfig;
  }
};

/**
 * Mendapatkan rute dashboard berdasarkan peran pengguna
 */
export const getDashboardRoute = (role: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.ORGANIZER:
      return "/organizer";
    case UserRole.BUYER:
    default:
      return "/buyer";
  }
};
