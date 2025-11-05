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
    default: "GLC Learning Center",
    template: "%s | GLC Learning Center",
  },
  description:
    "A premium learning innovation hub delivering strategic programs, curated insights, and global partnerships for education leaders.",
  keywords: [
    "learning",
    "leadership",
    "education",
    "global consortium",
    "professional development",
  ],
  authors: [{ name: "Global Learning Consortium" }],
  alternates: {
    canonical: "https://glc-template.vercel.app",
  },
  openGraph: {
    title: "GLC Learning Center",
    description:
      "Premium programming, curated insights, and strategic partnerships tailored for tomorrow's learners.",
    url: "https://glc-template.vercel.app",
    siteName: "GLC Learning Center",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@globallearning",
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
