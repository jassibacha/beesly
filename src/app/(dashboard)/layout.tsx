import "@/styles/globals.css";

import Header from "@/components/dashboard/Header";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "../providers";
import { UserProvider } from "@/context/UserContext";
import { LocationProvider } from "@/context/LocationContext";
export const metadata = {
  title: "Dashboard | Beesly.io",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        <LocationProvider>
          {/* <div className="flex-col md:flex"> */}
          {/* md:flex so md is our mobile breakpoint we need to build */}
          <Header />
          {children}
          <Toaster />
        </LocationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
