"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import resources from "@/content/resources.json";
import { Button } from "@/components/primitives/Button";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon } from "@/components/primitives/Icon";

export const ResourceCenter: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <section id="resources" className="container-max py-24">
      <div className="rounded-[28px] border border-bluewhale/12 bg-white/80 p-10 shadow-xl backdrop-blur-md">
        <Reveal className="space-y-6 text-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon whitespace-nowrap">
              Resource Center
            </span>
            <h2 className="text-[2.25rem] font-semibold tracking-[-0.015em] text-bluewhale whitespace-nowrap">
              [Title of section goes here]
            </h2>
            <p className="text-base leading-relaxed text-bluewhale/70 whitespace-nowrap">
              [Subtitle for section goes here]
            </p>
            {/* Bulleted list removed per request */}
          </div>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 shadow-m"
            >
              <span>View resources</span>
              <Icon name="caretDown" size={18} className={isExpanded ? "rotate-180" : ""} />
            </Button>
          </div>
        </Reveal>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="resources-expand"
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-visible pb-2"
          >
            <Reveal>
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {resources.map((resource) => (
                  <Card key={resource.id} className="flex h-full flex-col gap-4 rounded-[24px] border border-bluewhale/10 bg-white p-6 shadow-m">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold text-bluewhale">{resource.title}</h3>
                      <p className="text-sm leading-relaxed text-bluewhale/70">{resource.description}</p>
                    </div>
                    <Button variant="secondary" size="sm" asChild className="w-full">
                      <Link href={resource.href} target="_blank" rel="noopener noreferrer">
                        Explore
                        <Icon name="arrowSquareOut" size={18} />
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

