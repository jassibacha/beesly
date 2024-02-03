// "use client";

import "@/styles/globals.css";

import { Toaster } from "@/components/ui/toaster";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Beesly.io",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
      <Toaster />
    </>
  );
}
