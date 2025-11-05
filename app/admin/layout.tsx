import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#f8f8f8",
};

export const metadata: Metadata = {
  title: "Content Operations Dashboard",
  description: "Manage your GLC learning center content and updates.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-alabaster/80 pb-24 pt-32">
      <div className="container-max flex flex-col gap-12">{children}</div>
    </div>
  );
}

