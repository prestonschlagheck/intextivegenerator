import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#f8f8f8",
};

export const metadata: Metadata = {
  title: "GLC Learning Center",
  description:
    "A premium learning innovation hub delivering strategic programs, curated insights, and global partnerships for education leaders.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

