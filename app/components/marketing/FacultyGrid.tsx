"use client";

import Image from "next/image";

import faculty from "@/content/faculty.json";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";

export const FacultyGrid: React.FC = () => {
  return (
    <section id="faculty" className="container-max py-24">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 text-center">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon whitespace-nowrap">
            Faculty & Steering Committee
          </span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-[2.25rem] font-semibold tracking-[-0.015em] text-bluewhale whitespace-nowrap">
            [Title of section goes here]
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="text-base leading-relaxed text-bluewhale/70 whitespace-nowrap">
            [Subtitle for section goes here]
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {faculty.map((member, index) => (
          <Reveal key={member.id} delay={0.06 * index}>
            <Card className="flex h-full flex-col items-center gap-6 rounded-[24px] border border-bluewhale/10 bg-white p-8 text-center shadow-m">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-m">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  fill
                  sizes="(min-width: 1024px) 160px, 25vw"
                  className="object-cover"
                  style={{ transform: 'scale(1.23)' }}
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-bluewhale">{member.name}</h3>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-bluewhale/50">
                  {member.role}
                </p>
                <p className="text-sm text-bluewhale/70">{member.affiliation}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

