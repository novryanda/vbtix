import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Menggabungkan class names dengan clsx dan tailwind-merge
 * Berguna untuk conditional styling dengan Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Membuat slug dari string
 * Contoh: "Hello World" -> "hello-world"
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

/**
 * Format tanggal ke format yang lebih mudah dibaca
 * Contoh: "2023-01-01" -> "1 Januari 2023"
 */
export function formatDate(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "d MMMM yyyy", { locale: id });
}

/**
 * Format tanggal dan waktu ke format yang lebih mudah dibaca
 * Contoh: "2023-01-01T12:00:00" -> "1 Januari 2023, 12:00"
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "d MMMM yyyy, HH:mm", { locale: id });
}

/**
 * Format harga ke format Rupiah
 * Contoh: 100000 -> "Rp 100.000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format currency to a specific locale and currency
 * Example: 100000 -> "$100,000.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
