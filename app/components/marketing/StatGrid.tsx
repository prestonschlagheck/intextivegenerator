"use client";

import stats from "@/content/stats.json";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon, type IconName } from "@/components/primitives/Icon";
import { CountUp } from "@/components/primitives/CountUp";

export const StatGrid: React.FC = () => {
  return (
    <section id="key-statistics" className="container-max py-24">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 text-center">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon">
            Impact Benchmarks
          </span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-[2.5rem] font-semibold tracking-[-0.015em] text-bluewhale lg:whitespace-nowrap">
            [Title of section goes here]
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="text-lg leading-relaxed text-bluewhale/70">
            [Subtitle for section goes here]
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.id} delay={0.16 + index * 0.06}>
            <Card className="flex h-full flex-col rounded-[20px] border border-bluewhale/10 bg-white p-6 shadow-m">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lagoon/15 text-lagoon">
                <Icon name={stat.icon as IconName} size={22} />
              </div>
              <div className="mt-6 flex-1 space-y-2">
                <p className="text-4xl font-semibold tracking-tight text-bluewhale">
                  <CountUp
                    target={Number(String(stat.value).replace(/[^\d.]/g, ""))}
                    durationMs={2000}
                    decimals={String(stat.value).includes(".") ? 1 : 0}
                    suffix={(String(stat.value).match(/[%+\/].*$/)?.[0] ?? "").replace(/^[\d.]+/, "")}
                  />
                </p>
                <p className="text-base font-medium text-bluewhale">{stat.label}</p>
                <p className="text-sm leading-relaxed text-bluewhale/70">{stat.description}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

