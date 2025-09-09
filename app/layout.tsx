import type { Metadata } from "next";
import { Manrope, JetBrains_Mono, Inter } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site-config";
import RootProviders from "@/providers";
import AnnouncementBar from "@/components/announcement-bar";
import Header from "@/components/layouts/header";

const fontSans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fontHeading = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: siteConfig.name,
  icons: {
    icon: "/images/lou1s.png",
    shortcut: "/images/lou1s.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable,
          "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        )}
      >
        <RootProviders>
          <div className="w-full flex flex-col mb-2 gap-2 fixed top-0 left-0 right-0 z-50">
            <div className="w-full max-w-[90rem] mx-auto px-2 lg:px-0">
              <AnnouncementBar />
              <Header />
            </div>
          </div>
          <div className="relative flex-1 w-full max-w-[90rem] mx-auto px-2 lg:px-0 mt-24 border">
            {children}
          </div>
        </RootProviders>
      </body>
    </html>
  );
}
