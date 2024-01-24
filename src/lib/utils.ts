import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single class string.
 *
 * @param inputs - The class values to be combined.
 * @returns The combined class string.
 */
export function cn(...inputs: ClassValue[]) {
  // Merge the class values using the clsx library
  return twMerge(clsx(inputs));
}

// <div className={cn(
//   'text-base font-medium',
//   isActive && 'bg-blue-500 text-white',
//   !isActive && 'bg-gray-200 text-gray-800'
// )}>
