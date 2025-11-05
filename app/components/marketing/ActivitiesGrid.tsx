"use client";

import Image from "next/image";
import Link from "next/link";

import activities from "@/content/activities.json";
import { Button } from "@/components/primitives/Button";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon } from "@/components/primitives/Icon";

export const ActivitiesGrid: React.FC = () => {
  return (
    <section id="activities" className="container-max py-24">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 text-center">
        <Reveal className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon whitespace-nowrap">
            Curated Activities
          </span>
          <h2 className="text-[2.25rem] font-semibold tracking-[-0.015em] text-bluewhale whitespace-nowrap">
            [Title of section goes here]
          </h2>
          <p className="text-base leading-relaxed text-bluewhale/70 whitespace-nowrap">
            [Subtitle for section goes here]
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {activities.map((activity, index) => (
          <Reveal key={activity.id} delay={0.1 + index * 0.05}>
            <Card className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-bluewhale/10 bg-white shadow-m transition-shadow duration-220 hover:shadow-l">
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={activity.thumbnail}
                  alt={activity.title}
                  fill
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bluewhale/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 right-5 glass-content flex items-center gap-1 text-sm font-medium text-white drop-shadow-lg">
                  <Icon name="calendar" size={18} />
                  <span>{activity.duration}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-[var(--radius-pill)] bg-bluewhale/12 backdrop-blur-sm px-3 py-1 text-xs font-medium text-bluewhale border border-bluewhale/15 inline-flex items-center gap-1.5">
                    <Icon name="certificate" size={14} />
                    <span>{activity.credits}</span>
                  </div>
                  <div className="rounded-[var(--radius-pill)] bg-bluewhale/12 backdrop-blur-sm px-3 py-1 text-xs font-medium text-bluewhale border border-bluewhale/15 inline-flex items-center gap-1.5">
                    <Icon name="clock" size={14} />
                    <span>{activity.hours}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[1.5rem] font-semibold text-bluewhale">
                    {activity.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-bluewhale/70">
                    {activity.subtitle}
                  </p>
                </div>
                <div className="mt-auto flex justify-end">
                  <Button variant="tertiary" size="sm" asChild className="text-sm">
                    <Link href={activity.href}>
                      Explore program
                      <Icon name="arrowRight" size={18} className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

