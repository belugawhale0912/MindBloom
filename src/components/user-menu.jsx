"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, UserCircle, ChevronDown, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1 md:p-1.5 rounded-full transition-all duration-200 ring-1 ring-border group",
          isOpen ? "bg-secondary ring-primary/20" : "bg-background hover:bg-secondary/50"
        )}
      >
        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shadow-sm ring-2 ring-background">
          <User className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 mr-1 hidden md:block",
            isOpen && "rotate-180 text-primary"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-card border border-border shadow-xl ring-1 ring-black/5 p-2 animate-in zoom-in-95 fade-in duration-200 z-50">
          <div className="px-3 py-2 border-b border-border/50 mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
          </div>
          
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors group"
          >
            <UserCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            My Profile
          </Link>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors group"
          >
            <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            Account Settings
          </Link>
        </div>
      )}
    </div>
  );
}
