"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Heart, Send, Ghost, RefreshCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const WARM_QUOTES = [
  "You are doing much better than you think.",
  "It's okay to have a slow day.",
  "Your kindness is a light in this world.",
  "Take a deep breath. You are safe.",
  "Every small step counts.",
  "You are enough, exactly as you are.",
  "Softness is not weakness; it is strength.",
];

export default function ZenSpace() {
  const [worry, setWorry] = useState("");
  const [worries, setWorries] = useState([]); // Array of strings
  const [isTransforming, setIsTransforming] = useState(false);
  const [activeMessage, setActiveMessage] = useState("");
  const [activeMessageTimer, setActiveMessageTimer] = useState(null);
  const [fireflies, setFireflies] = useState([]); // { id, x, y, size }
  const [isJarGlowing, setIsJarGlowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log("Audio play failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Attempt to auto-play or handle initial state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      // Browsers often block auto-play without user interaction.
      // We set isPlaying to true, and attempt play. 
      // If it fails, the user will see the "playing" state but hear nothing until they click.
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked by browser. Music will start on first interaction.");
        // We keep isPlaying as true so the UI reflects the intent, 
        // and the toggle will work correctly on first click.
      });
    }
  }, []);

  // Initial fireflies
  useEffect(() => {
    const initial = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setFireflies(initial);
  }, []);

  const handleReleaseWorry = (e) => {
    e.preventDefault();
    if (!worry.trim()) return;

    setIsTransforming(true);
    // After animation, add worry to jar and clear input
    setTimeout(() => {
      setIsTransforming(false);
      setWorries(prev => [...prev, worry]);
      setWorry("");
      setIsJarGlowing(true);
      setTimeout(() => setIsJarGlowing(false), 2000);

      // Add a new "gratitude" firefly
      const newId = Date.now();
      setFireflies(prev => [...prev, {
        id: newId,
        x: 50,
        y: 50,
        size: 6,
        duration: 4,
        delay: 0,
        isNew: true
      }]);
    }, 2000);
  };

  const clearJar = () => {
    setIsJarGlowing(true);
    // Visual feedback for clearing
    setTimeout(() => {
      setWorries([]);
      setIsJarGlowing(false);
    }, 1000);
  };

  const drawFromJar = (e) => {
    if (e) e.stopPropagation();

    // Clear any existing timer
    if (activeMessageTimer) {
      clearTimeout(activeMessageTimer);
    }

    // Pick a random quote, ensure it's different from current if possible
    let randomQuote;
    do {
      randomQuote = WARM_QUOTES[Math.floor(Math.random() * WARM_QUOTES.length)];
    } while (randomQuote === activeMessage && WARM_QUOTES.length > 1);

    setActiveMessage(randomQuote);
    setIsJarGlowing(true);

    // Clear worries when drawing warmth
    setWorries([]);

    setTimeout(() => setIsJarGlowing(false), 1500);

    // Auto-clear message after exactly 3 seconds
    const timer = setTimeout(() => {
      setActiveMessage("");
      setActiveMessageTimer(null);
    }, 3000);

    setActiveMessageTimer(timer);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-180px)] w-full flex flex-col items-center justify-start md:justify-center overflow-y-auto rounded-[40px] transition-all duration-1000 bg-[#F9F8FF] dark:bg-[#0A0910] border border-purple-100/50 dark:border-purple-900/20 shadow-inner px-4 md:px-8">
      {/* Background - Soft Apple Purple Ambient Light */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Main Ambient Glow - Purple/Violet Tones */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[140px] opacity-30 transition-all duration-[3000ms] bg-purple-100 dark:bg-purple-900/20"
        />

        {/* Floating Fireflies (Subtle Purple-Gold) */}
        {fireflies.map((f) => (
          <div
            key={f.id}
            className={cn(
              "absolute rounded-full bg-purple-300 dark:bg-purple-500 blur-[0.5px] opacity-30",
              f.isNew ? "animate-bounce" : "animate-pulse"
            )}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              transition: "all 3s ease-in-out"
            }}
          />
        ))}
      </div>

      {/* Music Control - Fixed Position */}
      <div className="absolute top-6 right-6 md:right-8 z-30 flex items-center gap-3">
        <span className="text-[10px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-widest hidden md:block">
          {isPlaying ? "Now Playing" : "Healing Music"}
        </span>
        <audio ref={audioRef} src="/audio/lofi.mp3" loop />
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMusic}
          className={cn(
            "rounded-full bg-white/80 dark:bg-card/80 border-purple-100/50 dark:border-white/10 shadow-lg backdrop-blur-xl hover:scale-110 active:scale-95 transition-all h-12 w-12 group",
            !isPlaying && "animate-pulse"
          )}
        >
          {isPlaying ? (
            <Volume2 className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          )}
        </Button>
      </div>

      {/* Content View - Centered and Fit */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center gap-4 md:gap-8 py-10 md:py-12 min-h-full">

        {/* Top Message Display - Re-positioned to be clearly inside */}
        <div className="absolute top-4 md:top-10 left-0 right-0 z-50 flex items-center justify-center w-full px-8 pointer-events-none">
          {activeMessage && activeMessage.length > 0 && (
            <div className="bg-white/95 dark:bg-[#1A1926] backdrop-blur-2xl border-2 border-purple-200 dark:border-purple-500/30 px-10 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,92,246,0.3)] animate-in slide-in-from-top-4 fade-in duration-700 max-w-xl pointer-events-auto">
              <p className="text-xl md:text-2xl font-bold text-purple-900 dark:text-purple-100 tracking-tight text-center leading-relaxed">
                "{activeMessage}"
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full mt-12 md:mt-0">

          {/* Left: The Jar (Interactive) */}
          <div className="flex flex-col items-center justify-center gap-4 md:gap-6 order-1">
            <div
              onClick={drawFromJar}
              className={cn(
                "relative w-64 h-72 md:w-80 md:h-96 cursor-pointer group transition-all duration-700 ease-out shrink-0 active:scale-90",
                isJarGlowing && "scale-105 animate-shake"
              )}
            >
              {/* The Jar SVG - Warmer Glass Style */}
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
                <path
                  d="M30 10 Q30 5 50 5 Q70 5 70 10 L70 20 Q70 25 85 40 L85 100 Q85 115 50 115 Q15 115 15 100 L15 40 Q30 25 30 20 Z"
                  fill="currentColor"
                  className="text-white/40 dark:text-card/40"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.1"
                />
                <path
                  d="M30 15 L70 15"
                  stroke="currentColor"
                  className="text-purple-200 dark:text-foreground/10"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Glowing Dust at bottom - Primary Theme Color */}
                <path
                  d="M15 100 Q15 115 50 115 Q85 115 85 100 L85 85 Q50 95 15 85 Z"
                  fill="url(#jarGradient)"
                  className={cn("transition-opacity duration-1000", isJarGlowing ? "opacity-90" : "opacity-20")}
                />
                <defs>
                  <radialGradient id="jarGradient" cx="50%" cy="100%" r="80%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Worries inside the jar - Warmer & Clearer */}
              <div className="absolute inset-x-8 top-1/4 bottom-12 flex flex-wrap content-end justify-center gap-2 overflow-hidden pointer-events-none p-6">
                {worries.map((w, i) => (/* Use the same worries array from state */
                  <div
                    key={i}
                    className="text-[10px] md:text-[12px] px-3 py-1.5 rounded-xl bg-white dark:bg-purple-100 text-purple-900 font-bold shadow-md border border-purple-200/50 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700"
                    style={{
                      transform: `rotate(${Math.sin(i) * 15}deg)`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    {w.length > 12 ? w.substring(0, 10) + "..." : w}
                  </div>
                ))}

                {/* Fireflies inside the jar - Warm Purple */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`firefly-${i}`}
                    className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                    style={{ animationDelay: `${i * 0.4}s`, opacity: 0.5 }}
                  />
                ))}
              </div>

              {/* Hover hint - Softer style */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="bg-white/90 dark:bg-foreground/90 backdrop-blur-md text-purple-900 dark:text-background text-[10px] px-5 py-2.5 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg border border-purple-100">
                  Tap to Draw Warmth
                </p>
              </div>
            </div>
            <p className="text-purple-900/20 dark:text-muted-foreground/20 text-[10px] font-bold tracking-[0.3em] uppercase">The Jar of Warmth</p>
          </div>

          {/* Right: Interaction Area */}
          <div className="flex flex-col gap-6 md:gap-8 order-2 w-full max-w-md mx-auto">
            <div className="bg-white/60 dark:bg-card shadow-xl shadow-purple-900/5 border border-purple-100/50 dark:border-border/50 p-6 md:p-10 rounded-[2.5rem] space-y-6 md:space-y-8 relative overflow-hidden ring-1 ring-purple-100/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-primary/5 text-purple-600 dark:text-primary">
                    <Ghost className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Release a Worry</h3>
                </div>
                {worries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearJar}
                    className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-destructive/20 dark:text-destructive dark:hover:bg-destructive/10 text-[10px] font-bold uppercase tracking-widest px-4"
                  >
                    Empty
                  </Button>
                )}
              </div>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                Type something that's weighing on you. Watch it transform into a spark of light and join the jar.
              </p>

              <form onSubmit={handleReleaseWorry} className="space-y-4">
                <div className="relative group">
                  <Input
                    value={worry}
                    onChange={(e) => setWorry(e.target.value)}
                    placeholder={isTransforming ? "Transforming..." : "My worry is..."}
                    disabled={isTransforming}
                    className="h-14 md:h-16 rounded-2xl bg-white/50 dark:bg-secondary/50 border-purple-100/50 dark:border-border/50 text-foreground placeholder:text-muted-foreground/40 text-base md:text-lg px-6 focus-visible:ring-purple-200 focus-visible:border-purple-300 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!worry.trim() || isTransforming}
                    className="absolute right-2 top-2 md:right-3 md:top-3 h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500 text-white hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-purple-500/20"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>

              {/* Transformation Animation overlay - Purple Tones */}
              {isTransforming && (
                <div className="absolute inset-0 bg-white/95 dark:bg-background/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-700 z-20">
                  <div className="relative">
                    <div className="text-purple-900 dark:text-foreground text-lg font-semibold animate-pulse text-center px-8 leading-snug">
                      "{worry}"
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-400/20 to-transparent h-full w-full mix-blend-overlay animate-float" />
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-purple-500 animate-spin" />
                    <span className="text-purple-600 dark:text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Converting to Light</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Decoration */}
        <div className="flex items-center gap-4 opacity-10 select-none pointer-events-none shrink-0 py-2 md:py-4">
          <div className="h-px w-20 bg-purple-900 dark:bg-foreground" />
          <Heart className="h-4 w-4 text-purple-600 dark:text-foreground" />
          <div className="h-px w-20 bg-purple-900 dark:bg-foreground" />
        </div>
      </div>
    </div>
  );
}
