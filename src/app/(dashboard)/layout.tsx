import "@/styles/globals.css";

import Header from "@/components/dashboard/Header";
import { Toaster } from "@/components/ui/toaster";
export const metadata = {
  title: "Dashboard | Beesly.io",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <div className="flex-col md:flex"> */}
      {/* md:flex so md is our mobile breakpoint we need to build */}
      <Header />
      {children}
      <Toaster />
    </>
  );
}
