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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  { name: "Zen Space", href: "/zen", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform bg-background/95 backdrop-blur-xl border-r border-border/80 shadow-sm transition-all duration-500 ease-in-out md:translate-x-0 md:static md:block",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          !isOpen && (isCollapsed ? "md:w-20" : "md:w-64")
        )}
      >
        <div className="h-full flex flex-col pt-16 md:pt-6 pb-6 relative">
          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-8 h-6 w-6 items-center justify-center rounded-full bg-background border border-border/80 shadow-md text-muted-foreground hover:text-primary hover:scale-110 transition-all z-50 focus:outline-none"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Logo Section */}
          <div className={cn(
            "px-6 mb-10 transition-all duration-500 flex items-center gap-3 overflow-hidden",
            isCollapsed && !isOpen ? "md:px-5 md:justify-center" : "px-6"
          )}>
            <div className="min-w-[32px] flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="mindbloom logo" 
                className={cn(
                  "transition-all duration-500 object-contain",
                  isCollapsed && !isOpen ? "h-10 w-10" : "h-9 w-9"
                )} 
              />
            </div>
            <h2 className={cn(
              "text-xl font-bold text-foreground font-heading tracking-tight transition-all duration-300 whitespace-nowrap",
              isCollapsed && !isOpen ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"
            )}>
              mindbloom
            </h2>
          </div>

          {/* Navigation Items */}
          <nav className={cn(
            "flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar",
            isCollapsed && !isOpen ? "md:px-2" : "px-4"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center rounded-2xl transition-all duration-300 group overflow-visible",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-primary",
                    isCollapsed && !isOpen
                      ? "md:w-12 md:h-12 md:justify-center md:mx-auto"
                      : "px-4 py-3 gap-3"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    isCollapsed && !isOpen ? "min-w-0" : "min-w-[20px]"
                  )}>
                    <Icon
                      className={cn(
                        "transition-all duration-300",
                        isCollapsed && !isOpen ? "h-6 w-6" : "h-5 w-5",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                  </div>

                  <span className={cn(
                    "font-medium text-sm transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isCollapsed && !isOpen ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"
                  )}>
                    {item.name}
                  </span>

                  {/* Tooltip (Collapsed Desktop Only) */}
                  {isCollapsed && (
                    <div className="absolute left-16 hidden md:group-hover:flex items-center z-[100] animate-in slide-in-from-left-2 fade-in duration-200 pointer-events-none">
                      <div className="bg-foreground text-background text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-widest relative">
                        {item.name}
                        {/* Tooltip Arrow */}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-foreground" />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>


        </div>
      </aside>
    </>
  );
}

