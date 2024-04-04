import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
// import { ClerkProvider } from "@clerk/nextjs";
// import { Toaster } from "@/components/ui/toaster";
// import NavBar from "@/components/NavBar";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Beesly.io",
  description: "In Development",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} grainy antialiased`}>
        <ClerkProvider>
          <TRPCReactProvider>
            {/* ThemeProvider is set per layout later */}
            <Providers>
              {children}
              <SpeedInsights />
              <Analytics />
            </Providers>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
