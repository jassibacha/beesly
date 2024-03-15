import "@/styles/globals.css";

import Header from "@/components/admin/Header";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "../providers";
export const metadata = {
  title: "Admin | Beesly.io",
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
      {/* <div className="flex-col md:flex"> */}
      {/* md:flex so md is our mobile breakpoint we need to build */}
      <Header />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
