"use client";

import Image from "next/image";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon, type IconName } from "@/components/primitives/Icon";
import { CountUp } from "@/components/primitives/CountUp";

const metrics = [
  {
    id: "retention",
    label: "Leadership retention",
    value: "95%",
    delta: "+6.2% YoY",
    icon: "trendUp",
    description: "Leaders who complete two or more programs remain engaged with new initiatives.",
  },
  {
    id: "alignment",
    label: "Strategy alignment",
    value: "88%",
    delta: "+12 pts",
    icon: "chartBar",
    description: "Institutions reporting full alignment across strategic pillars after program completion.",
  },
  {
    id: "launch",
    label: "Launch-to-impact",
    value: "14 weeks",
    delta: "-4 weeks",
    icon: "map",
    description: "Average time to deploy new initiatives with measurable learner outcomes.",
  },
];

export const KeyStats: React.FC = () => {
  return (
    <section className="container-max py-24">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <Reveal className="h-full">
          <Card className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-bluewhale/10 bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon">
                Key Statistics
              </span>
              <h2 className="text-[2.25rem] font-semibold tracking-[-0.015em] text-bluewhale lg:whitespace-nowrap">
                A data-rich lens on leadership transformation.
              </h2>
              <p className="text-base leading-relaxed text-bluewhale/70">
                Our analysts continuously monitor engagement, implementation velocity, and equity impact to ensure that every initiative advances the consortium&apos;s shared goals.
              </p>
            </div>

            <div className="relative mt-10 basis-[75%] overflow-hidden rounded-[22px] border border-bluewhale/10">
              <Image
                src="/Images/Logos/Placeholders/Placeholder 2.png"
                alt="Key statistics visual"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </Card>
        </Reveal>

        <div className="grid grid-rows-3 gap-8">
          {metrics.map((metric, index) => (
            <Reveal key={metric.id} delay={0.08 * index}>
              <Card className="flex flex-col gap-4 rounded-[22px] border border-bluewhale/10 bg-white p-6 shadow-m h-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-bluewhale/60 mb-2">
                      {metric.label}
                    </p>
                    <p className="text-4xl font-semibold text-bluewhale">
                      <CountUp
                        target={Number(String(metric.value).replace(/[^\d.]/g, ""))}
                        durationMs={2000}
                        decimals={String(metric.value).includes(".") ? 1 : 0}
                        suffix={(String(metric.value).match(/[^\d.].*$/)?.[0] ?? "")}
                      />
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lagoon/15 text-lagoon shrink-0">
                    <Icon name={metric.icon as IconName} size={22} />
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-bluewhale/70">{metric.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

