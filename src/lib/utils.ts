import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// <div className={cn(
//   'text-base font-medium',
//   isActive && 'bg-blue-500 text-white',
//   !isActive && 'bg-gray-200 text-gray-800'
// )}>
