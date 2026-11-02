import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { site } from "@/config/site";

// Self-hosted variable fonts (SIL Open Font License, via Fontsource): no network fetch at build or runtime.
const display = localFont({
  src: "./fonts/big-shoulders-latin-opsz-normal.woff2",
  variable: "--font-big-shoulders",
  weight: "100 900",
  display: "swap",
  fallback: ["Arial Narrow", "sans-serif"],
});

const sans = localFont({
  src: [
    { path: "./fonts/archivo-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/archivo-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
});

const serif = localFont({
  src: [
    { path: "./fonts/fraunces-latin-full-normal.woff2", style: "normal" },
    { path: "./fonts/fraunces-latin-full-italic.woff2", style: "italic" },
  ],
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Fitness World — Built by discipline",
    template: "%s | Fitness World",
  },
  description: site.description,
  keywords: ["gym", "personal training", "strength training", "body transformation", "nutrition", "fitness world"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Fitness World — Built by discipline",
    description: site.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${serif.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
