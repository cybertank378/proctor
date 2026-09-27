// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility helper untuk menggabungkan class Tailwind secara kondisional dan aman dari konflik.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
