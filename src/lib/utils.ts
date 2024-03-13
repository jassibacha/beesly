import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Console Colors
export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// <div className={cn(
//   'text-base font-medium',
//   isActive && 'bg-blue-500 text-white',
//   !isActive && 'bg-gray-200 text-gray-800'
// )}>

export type BadgeVariant = "default" | "secondary" | "destructive" | "success";

export function getBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
}
