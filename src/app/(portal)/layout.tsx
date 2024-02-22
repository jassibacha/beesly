import "@/styles/globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "../providers";

export const metadata = {
  title: "Booking Portal",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* <NavBar /> */}
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
