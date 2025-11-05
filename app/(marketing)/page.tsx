"use client";

import * as React from "react";

import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { StatGrid } from "./components/StatGrid";
import { ActivitiesGrid } from "./components/ActivitiesGrid";
import { KeyStats } from "./components/KeyStats";
import { NewsFeed } from "./components/NewsFeed";
import { FacultyGrid } from "./components/FacultyGrid";
import { ResourceCenter } from "./components/ResourceCenter";
import { EventsCalendar } from "./components/EventsCalendar";
import { Footer } from "./components/Footer";
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

