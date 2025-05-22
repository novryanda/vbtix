// ~/lib/banner-helpers.ts

import { env } from "~/env";

/**
 * Generate a Cloudinary URL for a banner image
 * @param {string} text - The text to display on the banner
 * @param {object} options - Options for the banner
 * @returns {string} - The Cloudinary URL
 */
export function generateBannerUrl(
  text: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
  } = {},
): string {
  // Default values
  const width = options.width || 1200;
  const height = options.height || 400;
  const backgroundColor = options.backgroundColor || "blue";
  const textColor = options.textColor || "white";
  const fontSize = options.fontSize || 50;

  // Ensure cloud name is available
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn("Cloudinary cloud name not found in environment variables");
    // Fallback to placeholder.co if Cloudinary is not configured
    return `https://placehold.co/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}`;
  }

  // Always use placeholder.co for simplicity and reliability
  return `https://placehold.co/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

/**
 * Default banner data for the buyer homepage
 */
export const defaultBanners = [
  {
    id: 1,
    title: "Temukan Event Favorit Anda",
    description: "Jelajahi berbagai event menarik di seluruh Indonesia",
    link: "/events",
    backgroundColor: "blue",
  },
  {
    id: 2,
    title: "Konser Musik Terbesar",
    description: "Dapatkan tiket konser musik terbesar tahun ini",
    link: "/events?category=music",
    backgroundColor: "purple",
  },
  {
    id: 3,
    title: "Festival Budaya",
    description: "Nikmati keragaman budaya Indonesia melalui berbagai festival",
    link: "/events?category=culture",
    backgroundColor: "darkblue",
  },
];
