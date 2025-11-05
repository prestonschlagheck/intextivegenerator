"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Learning Center", href: "#hero" },
  { label: "Key Statistics", href: "#key-statistics" },
  { label: "Activities", href: "#activities" },
  { label: "Resources", href: "#resources" },
  { label: "Expert Faculty", href: "#faculty" },
  { label: "Conferences", href: "#events" },
];

export const Header: React.FC = () => {
  const [isOverHero, setIsOverHero] = React.useState(true);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => {
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        // Header is over hero if hero's bottom edge is below the header's bottom (accounting for header height + margin)
        setIsOverHero(heroRect.bottom > 120);
      }
    };
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto flex w-full justify-center">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mt-6 flex h-[88px] w-[min(100%,_1236px)] items-center justify-between rounded-[28px] border px-6 relative",
          "transition-all duration-300 ease-in-out",
          isOverHero
            ? "glass-light glass-grain bg-white/20 backdrop-blur-xl border-white/20"
            : "glass-light glass-grain bg-bluewhale/15 backdrop-blur-xl border-bluewhale/30"
        )}
        style={{ paddingTop: '0rem', paddingBottom: '0rem' }}
      >
        <Link href="#hero" className="flex items-center gap-3 shrink-0" aria-label="GLC Learning Center home">
          <Image
            src="/Images/Logos/GLCLogo.png"
            alt="GLC logo"
            width={140}
            height={140}
            className={cn(
              "h-[158px] w-[158px] object-contain transition-all duration-300",
              isOverHero && "brightness-0 invert"
            )}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                isOverHero
                  ? "text-white"
                  : "text-bluewhale"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden",
            isOverHero
              ? "border-white/30 text-white hover:bg-white/10"
              : "border-bluewhale/30 text-bluewhale hover:bg-bluewhale/10"
          )}
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            className={cn("h-6 w-6 transition-transform duration-200", isMenuOpen && "rotate-180")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {isMenuOpen && (
          <div
            className={cn(
              "absolute left-0 right-0 top-[calc(100%+8px)] mx-auto w-[min(100%,_360px)] rounded-[20px] border p-4 shadow-xl lg:hidden",
              isOverHero
                ? "bg-white/95 border-white/40 text-bluewhale"
                : "bg-bluewhale/95 border-bluewhale/40 text-white"
            )}
          >
            <nav className="flex flex-col gap-3" aria-label="Mobile primary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </motion.div>
    </header>
  );
};

