/**
 * Konfigurasi metadata dan informasi situs
 * File ini berisi konfigurasi umum untuk seluruh situs seperti nama, deskripsi, URL, dan metadata lainnya
 */

export const siteConfig = {
  name: "VBTix",
  description: "Platform tiket konser dan event terpercaya di Indonesia",
  url: "https://vbtix.id",
  ogImage: "https://vbtix.id/og-image.jpg",
  links: {
    twitter: "https://twitter.com/vbtix",
    instagram: "https://instagram.com/vbtix",
    facebook: "https://facebook.com/vbtix",
  },
  contact: {
    email: "info@vbtix.id",
    phone: "+62 812 3456 7890",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
  },
  company: {
    name: "PT Visi Bersama Teknologi",
    legalName: "PT Visi Bersama Teknologi",
    registrationNumber: "123456789012345",
    taxId: "12.345.678.9-012.345",
  },
};

/**
 * Konfigurasi metadata untuk SEO
 */
export const metadataConfig = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "tiket konser",
    "tiket event",
    "konser musik",
    "event",
    "festival musik",
    "Indonesia",
  ],
  authors: [
    {
      name: siteConfig.company.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.company.name,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@vbtix",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};
