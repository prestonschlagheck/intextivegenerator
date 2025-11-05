"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { label: "Admin Login", href: "#", isLogin: true },
  { label: "Privacy", href: "#" },
  { label: "Accessibility", href: "#" },
  { label: "Contact", href: "mailto:hello@glc.org" },
];

export const Footer: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  return (
    <footer className="bg-bluewhale text-white">
      <div className="container-max flex flex-col items-center gap-6 py-6">
        <div className="flex justify-center">
          <Image
            src="/Images/Logos/GLCLogo.png"
            alt="GLC logo"
            width={173}
            height={173}
            className="h-[173px] w-[173px] object-contain brightness-0 invert"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="#hero" className="text-white/80 transition hover:text-white">
            Learning Center
          </Link>
          <Link href="#key-statistics" className="text-white/60 transition hover:text-white">
            Key Statistics
          </Link>
          <Link href="#activities" className="text-white/60 transition hover:text-white">
            Activities
          </Link>
          <Link href="#resources" className="text-white/60 transition hover:text-white">
            Resources
          </Link>
          <Link href="#faculty" className="text-white/60 transition hover:text-white">
            Expert Faculty
          </Link>
          <Link href="#events" className="text-white/60 transition hover:text-white">
            Conferences
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.isLogin ? (e) => { e.preventDefault(); onOpenLogin(); } : undefined}
              className={cn(
                "text-white/60 transition hover:text-white",
                item.isLogin && "underline underline-offset-4"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="text-center text-xs text-white/50">
          Copyright 2025 GLC, all rights reserved.
        </div>
      </div>
    </footer>
  );
};

