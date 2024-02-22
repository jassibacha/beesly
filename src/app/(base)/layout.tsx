// "use client";

import "@/styles/globals.css";

import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/landing/LandingHeader";

export const metadata = {
  title: "Beesly.io",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Toaster />
    </>
  );
}
