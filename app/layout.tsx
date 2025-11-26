import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f8f8f8",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://glc-template.vercel.app"),
  title: {
    default: "Intextive Generator",
    template: "%s | Intextive Generator",
  },
  description:
    "Transform your PDF documents with AI-powered processing. Upload a PDF and receive intelligent, formatted output tailored to your needs.",
  keywords: [
    "pdf processing",
    "document conversion",
    "ai processing",
    "document transformation",
    "pdf generator",
  ],
  authors: [{ name: "Intextive" }],
  alternates: {
    canonical: "https://glc-template.vercel.app",
  },
  openGraph: {
    title: "Intextive Generator",
    description:
      "Transform your PDF documents with AI-powered processing. Upload and receive intelligent output.",
    url: "https://glc-template.vercel.app",
    siteName: "Intextive Generator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@intextive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const style = {
    "--font-family-sans": "var(--font-dm-sans)",
    "--font-family-display": "var(--font-dm-sans)",
  } as CSSProperties;

  return (
    <html lang="en" className="[color-scheme:light]">
      <body
        className={`${dmSans.variable} antialiased bg-[var(--surface-background)] text-bluewhale`}
        style={style}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
