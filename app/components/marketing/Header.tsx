"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
  const headerRef = React.useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside (mobile only)
  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Only apply on mobile
      if (window.innerWidth >= 1024) return;
      
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Small delay to prevent immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 z-50 w-full left-0 right-0">
      <div className="container-max">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex flex-col border relative will-change-auto",
            "transition-all duration-300 ease-in-out",
            // Mobile: fit to top with bottom rounding only, add extra right padding for arrow spacing
            "mt-0 rounded-b-[28px] -mx-[clamp(var(--gutter-mobile),5vw,var(--gutter-desktop))] pl-[clamp(var(--gutter-mobile),5vw,var(--gutter-desktop))] pr-8",
            // Desktop: match container-max width, with margin and proper padding
            "lg:mt-6 lg:rounded-[28px] lg:mx-0 lg:px-6 lg:flex-row lg:h-[88px] lg:items-center lg:justify-between lg:overflow-hidden",
            isOverHero
              ? "glass-light glass-grain bg-white/20 backdrop-blur-xl border-white/20"
              : "glass-light glass-grain bg-bluewhale/15 backdrop-blur-xl border-bluewhale/30"
          )}
          style={{ 
            paddingTop: '0rem', 
            paddingBottom: '0rem'
          }}
        >
        {/* Mobile Navigation - appears at top when menu is open */}
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ 
                height: "auto",
                transition: {
                  duration: 0.35,
                  ease: [0.25, 0.1, 0.25, 1]
                }
              }}
              exit={{ 
                height: 0,
                transition: {
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1]
                }
              }}
              className="overflow-hidden lg:hidden"
            >
              <nav 
                className="flex flex-col gap-3 text-center"
                style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
                aria-label="Mobile primary"
              >
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.25,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.04 * idx
                      }
                    }}
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.15,
                        ease: [0.25, 0.1, 0.25, 1]
                      }
                    }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "text-base font-semibold transition-colors duration-300",
                        isOverHero ? "text-white" : "text-bluewhale"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo and Navigation Row */}
        <div className={cn(
          "flex items-center justify-between w-full flex-shrink-0",
          "h-[88px] lg:h-auto"
        )}>
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
              "inline-flex h-10 w-10 items-center justify-center bg-transparent transition-colors duration-300 lg:hidden shrink-0",
              isOverHero ? "text-white hover:text-white/80" : "text-bluewhale hover:text-bluewhale/80"
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
        </div>
      </motion.div>
      </div>
    </header>
  );
};

