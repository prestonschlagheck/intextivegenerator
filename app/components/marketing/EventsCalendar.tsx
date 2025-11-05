"use client";

import Image from "next/image";
import Link from "next/link";

import events from "@/content/events.json";
import { Badge } from "@/components/primitives/Badge";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon } from "@/components/primitives/Icon";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export const EventsCalendar: React.FC = () => {
  return (
    <section id="events" className="container-max py-24">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 text-center">
        <Reveal className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon whitespace-nowrap">
            Upcoming Conferences
          </span>
          <h2 className="text-[2.25rem] font-semibold tracking-[-0.015em] text-bluewhale whitespace-nowrap">
            Connect with peers shaping the future of learning.
          </h2>
          <p className="text-base leading-relaxed text-bluewhale/70 whitespace-nowrap">
            Join executive briefings, immersive forums, and curated residencies to exchange best practices with learning leaders worldwide.
          </p>
        </Reveal>
      </div>

      <Card className="mt-14 overflow-hidden rounded-[28px] border border-bluewhale/12 bg-white shadow-xl">
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left text-sm text-bluewhale/80">
            <thead>
              <tr className="bg-gradient-to-r from-lagoon/20 via-persian/15 to-lagoon/20 text-xs uppercase tracking-[0.18em] text-bluewhale/80 border-b-2 border-lagoon/30">
                <th className="px-6 py-4 font-semibold text-left w-[300px]">Conference</th>
                <th className="px-6 py-4 font-semibold text-center w-[130px]">Date</th>
                <th className="px-6 py-4 font-semibold text-center w-[150px]">Location</th>
                <th className="px-6 py-4 font-semibold text-center w-[110px]">Type</th>
                <th className="px-6 py-4 font-semibold text-center w-[100px]">Link</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event.id}
                  className={cn(
                    "transition-colors duration-150",
                    index % 2 === 0
                      ? "bg-white hover:bg-alabaster/60"
                      : "bg-alabaster/40 hover:bg-alabaster/80"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-6">
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-bluewhale/10">
                        <Image
                          src={index % 2 === 0 ? "/Images/Logos/Placeholders/Placeholder.png" : "/Images/Logos/Placeholders/Placeholder 2.png"}
                          alt={event.conference}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <span className="text-base font-semibold text-bluewhale">{event.conference}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-center">{formatDate(event.date)}</td>
                  <td className="px-6 py-5 text-center">{event.location}</td>
                  <td className="px-6 py-5 text-center">
                    <Badge tone="neutral" className="bg-white text-bluewhale border border-bluewhale/15 mx-auto">
                      {event.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={event.link} className="inline-flex items-center gap-2 font-semibold text-persian hover:text-lagoon transition-colors justify-center">
                      Details
                      <Icon name="arrowSquareOut" size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-6 md:hidden">
          {events.map((event) => (
            <div key={event.id} className="rounded-[22px] border border-bluewhale/12 bg-white/90 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-bluewhale">
                  {event.conference}
                </h3>
                <Badge tone="neutral" className="bg-white text-bluewhale">
                  {event.type}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-bluewhale/70">
                <Icon name="calendar" size={18} />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="mt-2 text-sm text-bluewhale/70">{event.location}</div>
              <Link
                href={event.link}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-persian"
              >
                View details
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

