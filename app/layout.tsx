import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/fonts.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site-config";
import RootProviders from "@/providers";
import AnnouncementBar from "@/components/announcement-bar";
import Header from "@/components/layouts/header";
import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Instrument_Serif,
  Instrument_Sans,
  Urbanist,
  Bricolage_Grotesque,
} from "next/font/google";

// Geist Sans
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// JetBrains Mono
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Instrument Serif
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

// Instrument Sans
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Urbanist
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

// Bricolage Grotesque
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
          geistSans.variable,
          geistMono.variable,
          jetBrainsMono.variable,
          instrumentSerif.variable,
          instrumentSans.variable,
          urbanist.variable,
          bricolageGrotesque.variable,
          "antialiased",
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
