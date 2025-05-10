/**
 * Konfigurasi feature flags untuk aplikasi
 * File ini berisi konfigurasi untuk mengaktifkan atau menonaktifkan fitur-fitur tertentu
 * Berguna untuk pengembangan bertahap dan A/B testing
 */

/**
 * Feature flags untuk fitur-fitur aplikasi
 */
export const featureFlags = {
  // Fitur autentikasi
  auth: {
    googleAuth: true,
    appleAuth: false,
    emailVerification: true,
    twoFactorAuth: false,
  },

  // Fitur event
  events: {
    createEvent: true,
    editEvent: true,
    deleteEvent: true,
    eventCategories: true,
    eventTags: true,
    eventSearch: true,
    eventFilters: true,
    featuredEvents: true,
    upcomingEvents: true,
  },

  // Fitur tiket
  tickets: {
    multipleTicketTypes: true,
    reservedSeating: false,
    dynamicPricing: false,
    earlyBirdDiscount: true,
    promoCode: true,
    ticketTransfer: false,
    ticketResale: false,
  },

  // Fitur pembayaran
  payments: {
    midtrans: true,
    xendit: false,
    stripe: false,
    paypal: false,
    bankTransfer: true,
    virtualAccount: true,
    eWallet: true,
    creditCard: true,
    installment: false,
  },

  // Fitur e-ticket
  etickets: {
    qrCode: true,
    barcodeTicket: true,
    pdfTicket: true,
    walletPass: false,
    emailDelivery: true,
    whatsappDelivery: false,
  },

  // Fitur organizer
  organizer: {
    verification: true,
    dashboard: true,
    analytics: true,
    customization: false,
    multipleAdmins: false,
    bulkUpload: false,
  },

  // Fitur admin
  admin: {
    userManagement: true,
    contentManagement: true,
    systemSettings: true,
    auditLogs: true,
    reportGeneration: true,
  },

  // Fitur UI/UX
  ui: {
    darkMode: false,
    responsiveDesign: true,
    animations: true,
    accessibilityFeatures: true,
  },

  // Fitur notifikasi
  notifications: {
    email: true,
    inApp: true,
    push: false,
    sms: false,
    whatsapp: false,
  },
};

/**
 * Memeriksa apakah fitur tertentu diaktifkan
 */
export const isFeatureEnabled = (featurePath: string): boolean => {
  const paths = featurePath.split('.');
  let current: any = featureFlags;

  for (const path of paths) {
    if (current[path] === undefined) {
      return false;
    }
    current = current[path];
  }

  return !!current;
};
