import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  
  // If the value is a placeholder text (not a valid date), return it as-is
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return value;
  }
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(date);
}

export function chunkArray<T>(list: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}

export type CTA = {
  label: string;
  href: string;
};

