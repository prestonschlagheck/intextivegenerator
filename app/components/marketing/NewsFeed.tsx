"use client";

import Image from "next/image";

import news from "@/content/news.json";
import { Card } from "@/components/primitives/Card";
import { Reveal } from "@/components/primitives/Reveal";
import { Icon } from "@/components/primitives/Icon";
import { formatDate } from "@/lib/utils";

export const NewsFeed: React.FC = () => {
  const posts = [...news].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <section id="news" className="container-max py-24">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 text-center">
        <Reveal className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-lagoon whitespace-nowrap">
            Latest News & Updates
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
        {posts.map((post, index) => (
          <Reveal key={post.id} delay={0.08 * index}>
            <Card className="flex h-full flex-col overflow-hidden rounded-[24px] border border-bluewhale/10 bg-white shadow-m">
              <div className="relative h-48">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bluewhale/35 via-transparent to-transparent" />
                {post.pinned && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-persian/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    <Icon name="pushPin" size={16} />
                    Pinned
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-bluewhale/50">
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[1.5rem] font-semibold text-bluewhale">{post.title}</h3>
                  <p className="text-sm font-medium text-bluewhale/60">{post.author}</p>
                  <p className="text-sm leading-relaxed text-bluewhale/70">{post.preview}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <div key={tag} className="rounded-[var(--radius-pill)] bg-bluewhale/12 backdrop-blur-sm px-3 py-1 text-xs font-medium text-bluewhale border border-bluewhale/15">
                      #{tag}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* TODO(supabase): Replace static JSON with Supabase news feed once API is available. */}
    </section>
  );
};

