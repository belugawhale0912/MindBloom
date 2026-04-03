"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  CloudRain,
  Waves,
  Flame,
  Trees,
  Coffee,
  Wind,
  Headphones,
  MoonStar,
  Play,
  Save,
  Pause,
} from "lucide-react";
import { useRef } from "react";

const SOUNDS = [
  {
    id: "rain",
    label: "Rain",
    icon: CloudRain,
    color: "text-blue-500",
    activeBg: "bg-blue-500/10",
    activeBorder: "border-blue-500/30",
    url: "/audio/rain.mp3"
  },
  {
    id: "ocean",
    label: "Ocean Waves",
    icon: Waves,
    color: "text-cyan-500",
    activeBg: "bg-cyan-500/10",
    activeBorder: "border-cyan-500/30",
    url: "/audio/ocean.mp3"
  },
  {
    id: "campfire",
    label: "Campfire",
    icon: Flame,
    color: "text-orange-500",
    activeBg: "bg-orange-500/10",
    activeBorder: "border-orange-500/30",
    url: "/audio/campfire.mp3"
  },
  {
    id: "forest",
    label: "Forest",
    icon: Trees,
    color: "text-green-500",
    activeBg: "bg-green-500/10",
    activeBorder: "border-green-500/30",
    url: "/audio/forest.mp3"
  },
  {
    id: "coffee",
    label: "Coffee Shop",
    icon: Coffee,
    color: "text-amber-600",
    activeBg: "bg-amber-600/10",
    activeBorder: "border-amber-600/30",
    url: "/audio/coffee.mp3"
  },
  {
    id: "wind",
    label: "Wind",
    icon: Wind,
    color: "text-slate-500",
    activeBg: "bg-slate-500/10",
    activeBorder: "border-slate-500/30",
    url: "/audio/wind.mp3"
  },
  {
    id: "lofi",
    label: "Lo-fi Beats",
    icon: Headphones,
    color: "text-purple-500",
    activeBg: "bg-purple-500/10",
    activeBorder: "border-purple-500/30",
    url: "/audio/lofi.mp3"
  },
  {
    id: "crickets",
    label: "Night Crickets",
    icon: MoonStar,
    color: "text-indigo-500",
    activeBg: "bg-indigo-500/10",
    activeBorder: "border-indigo-500/30",
    url: "/audio/crickets.mp3"
  },
];

export default function WhiteNoiseMixer() {
  const [activeSounds, setActiveSounds] = useState({});
  const [volumes, setVolumes] = useState({
    rain: [70],
    lofi: [40],
  });
  const [masterVolume, setMasterVolume] = useState([80]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mixName, setMixName] = useState("");
  const [savedMixes, setSavedMixes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [timerLeft, setTimerLeft] = useState(0); // seconds
  const audioRefs = useRef({}); 

  useEffect(() => {
    fetch("/api/mixes")
      .then(res => res.json())
      .then(data => setSavedMixes(data))
      .catch(err => console.error(err));
      
    // Cleanup on unmount
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.onerror = null;
        audio.pause();
        audio.src = "";
        audio.load(); // Force clearing
      });
      audioRefs.current = {};
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isPlaying && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timerLeft]);

  // Audio management
  useEffect(() => {
    if (!isPlaying) {
      Object.values(audioRefs.current).forEach(audio => audio.pause());
      return;
    }
    
    SOUNDS.forEach(sound => {
      let audio = audioRefs.current[sound.id];
      if (activeSounds[sound.id]) {
        if (!audio) {
           audio = new Audio(sound.url);
           audio.loop = true;
           audio.preload = "auto";
           audio.onerror = (e) => {
             console.error("Audio error for " + sound.id, e, audio.error);
           };
           audioRefs.current[sound.id] = audio;
        }
        const vol = ((volumes[sound.id]?.[0] || 50) / 100) * (masterVolume[0] / 100);
        audio.volume = Math.max(0, Math.min(1, vol));
        
        // Ensure playback
        if (audio.paused) {
          audio.play().catch((err) => {
            console.error("Playback failed for " + sound.id, err);
          });
        }
      } else if (audio) {
        audio.pause();
      }
    });
  }, [isPlaying, activeSounds, volumes, masterVolume]);

  const handleSetTimer = (minutes) => {
    setTimerLeft(minutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveMix = async () => {
    if (!mixName.trim() || isSaving) return;
    setIsSaving(true);
    const newMix = {
      name: mixName.trim(),
      activeSounds,
      volumes,
      masterVolume
    };
    try {
      const res = await fetch("/api/mixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMix)
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedMixes([saved, ...savedMixes]);
        setMixName("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const loadMix = (mix) => {
    setActiveSounds(mix.activeSounds);
    setVolumes(mix.volumes);
    setMasterVolume(mix.masterVolume);
  };

  const toggleSound = (id) => {
    setActiveSounds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (!volumes[id]) {
      setVolumes((prev) => ({ ...prev, [id]: [50] }));
    }
  };

  const handleVolume = (id, val) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-32">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Find Your Calm 🎵
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Mix sounds to create your perfect relaxing environment.
        </p>
      </div>

      {savedMixes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-semibold flex items-center mr-2">Saved Mixes:</span>
          {savedMixes.map(mix => (
            <Button 
              key={mix.id} 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={() => loadMix(mix)}
            >
              <Play className="h-3 w-3 mr-2" /> {mix.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SOUNDS.map((sound) => {
          const Icon = sound.icon;
          const isActive = activeSounds[sound.id];
          return (
            <Card
              key={sound.id}
              className={`border transition-all duration-300 overflow-hidden ${
                isActive
                  ? `${sound.activeBg} ${sound.activeBorder} shadow-sm ring-1 ring-${sound.color.split("-")[1]}-500/20`
                  : "border-border/50 shadow-none hover:border-border"
              }`}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full gap-3 relative">
                <button
                  onClick={() => toggleSound(sound.id)}
                  className={`p-3 rounded-full transition-all ${
                    isActive
                      ? `bg-background shadow-sm text-foreground`
                      : `bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground`
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? sound.color : ""}`} />
                </button>

                <h3
                  className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {sound.label}
                </h3>

                <div
                  className={`w-full transition-all duration-300 ${isActive ? "opacity-100 h-6" : "opacity-0 h-0 overflow-hidden"}`}
                >
                  <Slider
                    value={volumes[sound.id] || [50]}
                    onValueChange={(val) => handleVolume(sound.id, val)}
                    max={100}
                    step={1}
                    className="w-full mt-2 cursor-pointer"
                  />

                  <div className="flex justify-between w-full mt-1 px-1">
                    <span className="text-[9px] text-muted-foreground">
                      Min
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Max
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Controls - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 z-40 md:sticky md:bottom-2 md:rounded-3xl md:border md:shadow-lg md:mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <Button
            size="lg"
            className="w-full md:w-auto shrink-0 rounded-full h-14 px-8 text-base shadow-sm font-bold bg-primary hover:bg-primary/90"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-5 w-5 fill-current" /> Pause Mix
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5 fill-current" /> Play Mix
              </>
            )}
          </Button>

          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold w-24 shrink-0">
                Master Vol
              </span>
              <Slider
                value={masterVolume}
                onValueChange={(val) => setMasterVolume(val)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* This might cause hydration mismatch if Select isn't dynamically disabled during SSR, but for prototype it's fine */}
              <div className="w-full sm:w-1/2 flex items-center gap-3">
                <span className="text-sm font-semibold w-24 shrink-0">
                  Timer
                </span>
                <div className="flex gap-1 w-full overflow-x-auto pb-1 no-scrollbar">
                  {[10, 30, 60].map(m => (
                    <Button 
                      key={m} 
                      variant="secondary" 
                      size="sm" 
                      className={`rounded-full text-[10px] h-7 px-3 ${timerLeft === m * 60 ? "bg-primary text-white" : ""}`}
                      onClick={() => handleSetTimer(m)}
                    >
                      {m}m
                    </Button>
                  ))}
                  {timerLeft > 0 && (
                    <span className="ml-2 text-xs font-mono text-primary animate-pulse">{formatTime(timerLeft)}</span>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-1/2 relative">
                <Input
                  placeholder="Name this mix..."
                  value={mixName}
                  onChange={(e) => setMixName(e.target.value)}
                  disabled={isSaving}
                  className="rounded-full pr-10 border-border/80 focus-visible:ring-primary/30"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveMix}
                  disabled={isSaving || !mixName.trim()}
                  className="absolute right-1 top-1 h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
