"use client";

// import { ClerkProvider, useUser } from "@clerk/nextjs";
import ContextProvider from "@/context/ContextProvider";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

// ThemeProvider for dark/light mode
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// We can write analytics stuff into here

// NOTE: Clerk Provider needed to be moved back to the RootLayout, and it needed to be before tRPC,
// This is because we're passing Clerk auth & user data into tRPC context.

export function Providers({ children }: { children: React.ReactNode }) {
  return <ContextProvider>{children}</ContextProvider>;
}
