"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MediaViewer — full-screen lightbox for photo/video items.
 *
 * Props:
 *   item        — the currently viewed item { id, type, url, title, description }
 *   allItems    — full array of photo+video items for prev/next navigation
 *   onClose     — called when the viewer should close
 *   onNavigate  — called with the new item when user navigates
 */
export default function MediaViewer({ item, allItems, onClose, onNavigate }) {
  const currentIndex = allItems.findIndex((i) => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allItems.length - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) onNavigate(allItems[currentIndex + 1]);
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(allItems[currentIndex - 1]);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, allItems, hasPrev, hasNext, currentIndex, onClose, onNavigate]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black animate-in fade-in duration-300">

      {/* ── Media fills the whole screen ─────────────────────── */}
      {item.type === "video" ? (
        <video
          key={item.id}
          src={item.url}
          controls
          autoPlay
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <img
          key={item.id}
          src={item.url}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}

      {/* ── Dark gradient overlays (top + bottom) ────────────── */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* ── Close ────────────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-5 right-5 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-11 w-11"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* ── Prev ─────────────────────────────────────────────── */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
          onClick={() => onNavigate(allItems[currentIndex - 1])}
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
      )}

      {/* ── Next ─────────────────────────────────────────────── */}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
          onClick={() => onNavigate(allItems[currentIndex + 1])}
        >
          <ChevronRight className="h-7 w-7" />
        </Button>
      )}

      {/* ── Caption (bottom overlay) ──────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 px-8 pb-8 pt-2 z-10 animate-in slide-in-from-bottom-3 duration-500">
        <h3 className="text-2xl font-heading font-black text-white tracking-tight drop-shadow">{item.title}</h3>
        {item.description && (
          <p className="text-white/60 text-sm italic mt-1">{item.description}</p>
        )}

        {/* Dot nav */}
        {allItems.length > 1 && (
          <div className="flex items-center gap-1.5 mt-3">
            {allItems.map((mi, i) => (
              <button
                key={mi.id}
                onClick={() => onNavigate(mi)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === currentIndex ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}

        {/* Keyboard hint */}
        <p className="text-white/25 text-[10px] tracking-widest uppercase mt-3">
          {allItems.length > 1 ? "← → to browse · Esc to close" : "Esc to close"}
        </p>
      </div>
    </div>,
    document.body
  );
}


