"use client";

import { usePathname } from "next/navigation";
import { Flower2, Bell, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 text-primary font-heading font-bold text-xl mr-8">
          <Flower2 className="h-6 w-6" />
          <span>MindBloom</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <Link href="/crisis">
          <Button
            variant="destructive"
            className="rounded-full font-medium shadow-sm hover:shadow active:scale-95 transition-all text-xs md:text-sm h-8 md:h-10"
          >
            Crisis Help
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hidden md:flex text-muted-foreground hover:bg-secondary"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-secondary text-primary flex items-center justify-center font-bold shadow-sm ring-2 ring-background cursor-pointer">
          <User className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </header>
  );
}
