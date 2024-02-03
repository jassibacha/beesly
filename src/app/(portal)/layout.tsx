import "@/styles/globals.css";

import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Booking Portal",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <NavBar /> */}
      {children}
      <Toaster />
    </>
  );
}
