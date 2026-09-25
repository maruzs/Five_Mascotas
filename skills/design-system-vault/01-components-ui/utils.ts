import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes safely, merging duplicate properties and handling
 * conditionals. Standardized helper used across the entire design system.
 */
export function cn(...inputs: ClassValue[]): string {
  try {
    return twMerge(clsx(inputs));
  } catch {
    // Fallback in environments where clsx/twMerge might not be pre-bundled
    return inputs
      .flat(Infinity)
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .join(" ");
  }
}
