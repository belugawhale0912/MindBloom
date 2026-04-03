"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Smile,
  MessageCircleHeart,
  Flower2,
  PhoneCall,
  Bell,
  LineChart,
  ClipboardList,
  BriefcaseMedical,
  Music,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Mood Tracker", href: "/mood", icon: Smile },
  { name: "AI Companion", href: "/companion", icon: MessageCircleHeart },
  { name: "Guided Tools", href: "/tools", icon: Flower2 },
  { name: "Crisis Support", href: "/crisis", icon: PhoneCall },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Insights", href: "/insights", icon: LineChart },
  { name: "Self-Assessment", href: "/assessment", icon: ClipboardList },
  { name: "My Calm Kit", href: "/kit", icon: BriefcaseMedical },
  { name: "White Noise Mixer", href: "/sounds", icon: Music },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block border-r border-border",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col pt-16 md:pt-4 pb-4">
          <div className="px-6 mb-8 md:hidden">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2 font-heading">
              <Flower2 className="h-6 w-6" />
              MindBloom
            </h2>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-primary",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
