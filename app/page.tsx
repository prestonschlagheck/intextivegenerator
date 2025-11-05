"use client";

import * as React from "react";

import { Header } from "@/app/components/marketing/Header";
import { Hero } from "@/app/components/marketing/Hero";
import { StatGrid } from "@/app/components/marketing/StatGrid";
import { ActivitiesGrid } from "@/app/components/marketing/ActivitiesGrid";
import { KeyStats } from "@/app/components/marketing/KeyStats";
import { NewsFeed } from "@/app/components/marketing/NewsFeed";
import { FacultyGrid } from "@/app/components/marketing/FacultyGrid";
import { ResourceCenter } from "@/app/components/marketing/ResourceCenter";
import { EventsCalendar } from "@/app/components/marketing/EventsCalendar";
import { Footer } from "@/app/components/marketing/Footer";
import { LoginModal } from "@/app/admin/components/LoginModal";
import { useAuthStore } from "@/lib/store/useAuthStore";

const MarketingPage: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenLogin = React.useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-alabaster">
        <Header />
        <main className="flex flex-col gap-0">
          <Hero />
          <StatGrid />
          <ActivitiesGrid />
          <KeyStats />
          <NewsFeed />
          <ResourceCenter />
          <FacultyGrid />
          <EventsCalendar />
        </main>
        <Footer onOpenLogin={handleOpenLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster">
      <Header />
      <main className="flex flex-col gap-0">
        <Hero />
        <StatGrid />
        <ActivitiesGrid />
        <KeyStats />
        <NewsFeed />
        <ResourceCenter />
        <FacultyGrid />
        <EventsCalendar />
      </main>
      <Footer onOpenLogin={handleOpenLogin} />

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      {isAuthenticated && (
        <div className="fixed bottom-5 right-5 hidden rounded-[var(--radius-pill)] border border-persian/30 bg-white/90 px-4 py-2 text-sm font-medium text-persian shadow-m sm:flex">
          Logged in as admin@example.com
        </div>
      )}
    </div>
  );
};

export default MarketingPage;
