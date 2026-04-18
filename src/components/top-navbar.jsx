"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

const pageTitles = {
  "/": "Dashboard",
  "/mood": "Mood Tracker",
  "/companion": "AI Companion",
  "/tools": "Guided Tools",
  "/crisis": "Crisis Support",
  "/reminders": "Reminders",
  "/insights": "Insights",
  "/assessment": "Self-Assessment",
  "/kit": "My Calm Kit",
  "/sounds": "White Noise Mixer",
  "/settings": "Settings",
};

export function TopNavbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "MindBloom";
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    // Listen for watcher updates to show notification dot
    const handleWatcherUpdate = (e) => {
      // Mock logic: If a reminder was just matched, show the dot
      // In a real app, this would check a notification queue
      if (e.detail.status === "Active" && Math.random() > 0.8) {
        setHasNotifications(true);
      }
    };

    window.addEventListener('mindbloom:watcher-update', handleWatcherUpdate);
    return () => window.removeEventListener('mindbloom:watcher-update', handleWatcherUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between border-b border-border/80 bg-background/95 px-4 md:px-8 backdrop-blur-xl transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-heading tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <Link href="/crisis">
          <Button
            variant="destructive"
            className="rounded-full font-bold shadow-lg shadow-destructive/20 hover:shadow-destructive/30 active:scale-95 transition-all text-xs md:text-sm h-8 md:h-11 px-4 md:px-6"
          >
            Crisis Help
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hidden md:flex text-muted-foreground hover:bg-secondary relative h-10 w-10"
          onClick={() => setHasNotifications(false)}
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
          )}
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}

