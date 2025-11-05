"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import heroData from "@/content/hero.json";
import { Button } from "@/components/primitives/Button";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon } from "@/components/primitives/Icon";
import { CountUp } from "@/components/primitives/CountUp";

export const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string, offset = 80) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleResourcesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const event = new CustomEvent("openResourceCenter");
    window.dispatchEvent(event);
    setTimeout(() => {
      scrollToSection("resources", 80);
    }, 100);
  };

  const handleActivitiesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection("activities", 80);
  };

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-hero-gradient pb-32 pt-44 text-white"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-bluewhale via-bluewhale/90 to-midnight opacity-90" />
        <div className="absolute -top-64 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lagoon/25 blur-3xl" />
        <div className="absolute bottom-0 right-16 h-[380px] w-[380px] rounded-full bg-persian/20 blur-3xl" />
      </div>

      <div className="container-max relative flex flex-col gap-16 lg:flex-row lg:items-stretch">
        <div className="flex max-w-xl flex-col gap-8 lg:self-stretch">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white">
              {heroData.overline}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.02em] text-white lg:text-[3.5rem]">
              {heroData.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lg leading-relaxed text-white">
              {heroData.subtitle}
            </p>
          </Reveal>
          {/* Bottom group anchored to align with right-hand card bottom */}
          <div className="mt-auto flex flex-col gap-6">
            <Reveal delay={0.18}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href={heroData.primaryAction.href} onClick={handleResourcesClick}>{heroData.primaryAction.label}</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href={heroData.secondaryAction.href} onClick={handleActivitiesClick}>{heroData.secondaryAction.label}</Link>
                </Button>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-3 items-end">
              {heroData.statHighlights.map((stat, index) => (
                <Reveal key={stat.id} delay={0.2 + index * 0.06}>
                  <div className="glass-light glass-grain glass-interactive group flex h-full flex-col gap-2 rounded-[28px] p-4 text-white">
                    <div className="glass-content text-white/90">
                      <span className="text-xs font-medium uppercase tracking-[0.2em]">
                        {stat.label}
                      </span>
                    </div>
                    <p className="glass-content mt-auto text-2xl font-semibold tracking-tight text-white">
                      <CountUp
                        target={Number(String(stat.value).toString().replace(/[^\d.]/g, ""))}
                        durationMs={2000}
                        decimals={String(stat.value).includes(".") ? 1 : 0}
                        suffix={stat.suffix ? String(stat.suffix) : String(String(stat.value).match(/[%+]/) ?? "")}
                      />
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 items-stretch justify-center lg:self-stretch">
          <div className="glass-light glass-grain glass-interactive group relative flex w-full max-w-xl flex-col overflow-hidden rounded-[28px] p-4 text-white transition-shadow duration-220">
            <div className="relative h-80 flex-shrink-0 overflow-hidden rounded-[16px]">
              <Image
                src={heroData.media.src}
                alt={heroData.media.alt}
                width={960}
                height={720}
                priority
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bluewhale/40 via-transparent to-transparent" />
            </div>
            <div className="glass-content relative z-10 flex flex-1 flex-col gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="rounded-[var(--radius-pill)] bg-bluewhale/12 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/15 inline-flex items-center gap-1.5">
                  <Icon name="certificate" size={14} />
                  <span>X credits</span>
                </div>
                <div className="rounded-[var(--radius-pill)] bg-bluewhale/12 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/15 inline-flex items-center gap-1.5">
                  <Icon name="clock" size={14} />
                  <span>X hours</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[1.5rem] font-semibold text-white">
                  Featured Image or Program
                </h3>
                <p className="text-sm leading-relaxed text-white">
                  Featured image or program description
                </p>
              </div>
              <div className="mt-auto flex justify-end">
                <Button variant="tertiary" size="sm" asChild className="text-sm bg-white/20 text-white hover:bg-white/30 border-white/30">
                  <Link href="#activities">
                    Explore program
                    <Icon name="arrowRight" size={18} className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

