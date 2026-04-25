"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Delete } from "lucide-react";

const CATEGORIES = ["School", "Family", "Social", "Work", "Health", "Finances"];

// Define the total number of images you have for each tier
// Just change these numbers, and name your images 1.jpg, 2.jpg, etc. in the respective folders
const TIER_IMAGE_COUNTS = {
  tier1: 3,
  tier2: 3,
  tier3: 3,
  tier4: 3,
};

export default function MoodTracker() {
  const [moodValue, setMoodValue] = useState([5.00]);
  const [currentTier, setCurrentTier] = useState(2);
  const [currentImageId, setCurrentImageId] = useState(1);
  const [extIndex, setExtIndex] = useState(0);

  const SUPPORTED_EXTS = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"];

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryImpacts, setCategoryImpacts] = useState({});
  const [note, setNote] = useState("");

  const [secureNote, setSecureNote] = useState("");
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [pinMode, setPinMode] = useState("manual"); // 'auto' | 'manual'
  const [savedAutoPin, setSavedAutoPin] = useState("");
  
  const [unlockedEntries, setUnlockedEntries] = useState([]);
  
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [keypadContext, setKeypadContext] = useState(null);
  const [keypadPin, setKeypadPin] = useState("");

  const handleKeypadSubmit = (pin) => {
    if (keypadContext === 'auto') {
      setSavedAutoPin(pin);
      setIsKeypadOpen(false);
    } else if (keypadContext === 'manual') {
      setIsKeypadOpen(false);
      handleSave(pin);
    } else {
      const entryId = keypadContext;
      const entry = pastEntries.find(e => (e.id || e.timestamp) === entryId);
      if (entry && pin === entry.pin) {
        setUnlockedEntries(prev => [...prev, entryId]);
        setIsKeypadOpen(false);
      } else {
        alert("Incorrect PIN");
        setKeypadPin("");
      }
    }
  };

  const handleKeypadPress = (digit) => {
    if (keypadPin.length < 6) {
      const newPin = keypadPin + digit;
      setKeypadPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => {
          handleKeypadSubmit(newPin);
        }, 150);
      }
    }
  };

  const handleKeypadDelete = () => {
    if (keypadPin.length > 0) {
      setKeypadPin(keypadPin.slice(0, -1));
    }
  };

  const openKeypad = (context) => {
    setKeypadContext(context);
    setKeypadPin("");
    setIsKeypadOpen(true);
  };

  const [pastEntries, setPastEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/mood")
      .then((res) => res.json())
      .then((data) => setPastEntries(data))
      .catch((err) => console.error("Failed to load mood entries:", err));
  }, []);

  // Image recalculation logic
  useEffect(() => {
    const val = moodValue[0];
    let newTier = 2;
    if (val <= 2.50) newTier = 1;
    else if (val <= 5.00) newTier = 2;
    else if (val <= 7.50) newTier = 3;
    else newTier = 4;

    if (newTier !== currentTier) {
      setCurrentTier(newTier);
      const maxImages = TIER_IMAGE_COUNTS[`tier${newTier}`];
      const randomId = Math.floor(Math.random() * maxImages) + 1;
      setCurrentImageId(randomId);
      setExtIndex(0); // Reset extension guesser when changing image
    }
  }, [moodValue, currentTier]);

  const handleSave = async (overridePin = null) => {
    if (isSaving) return;

    let finalPin = null;
    if (isSecureMode) {
      finalPin = pinMode === 'auto' ? savedAutoPin : overridePin;
      if (!finalPin || finalPin.length !== 6 || !/^\d+$/.test(finalPin)) {
        return;
      }
    }

    setIsSaving(true);
    const now = new Date();

    // Format to tags array for backward compatibility
    // e.g. ["School: Negative", "Family: Positive"]
    const tagsArray = selectedCategories.map(cat => `${cat}: ${categoryImpacts[cat] || "Neutral"}`);

    // Generate a fallback emoji based on tier for past entries UI
    const fallbackEmoji = currentTier === 1 ? "😞" : currentTier === 2 ? "🙁" : currentTier === 3 ? "🙂" : "😄";

    const newEntry = {
      date: now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      timestamp: now.toISOString(),
      emoji: fallbackEmoji,
      level: Math.round(moodValue[0] / 2), // map 0-10 back to 1-5 scale for backwards compatibility if needed
      tags: tagsArray,
      note: isSecureMode ? null : note,
      detailedScore: moodValue[0], // Optional new field
      suggestion: dynamicInsight,
      isLocked: isSecureMode,
      secureNote: isSecureMode ? secureNote : null,
      pin: isSecureMode ? finalPin : null,
    };

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      if (res.ok) {
        const savedEntry = await res.json();
        setPastEntries([savedEntry, ...pastEntries]);

        // Reset state
        setMoodValue([5.00]);
        setSelectedCategories([]);
        setCategoryImpacts({});
        setNote("");
        setSecureNote("");
        setIsSecureMode(false);
        setPinMode("manual");
      }
    } catch (err) {
      console.error("Failed to save mood:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        const newCats = prev.filter(c => c !== cat);
        // remove its impact
        setCategoryImpacts(curr => {
          const newImpacts = { ...curr };
          delete newImpacts[cat];
          return newImpacts;
        });
        return newCats;
      } else {
        return [...prev, cat];
      }
    });
  };

  const setImpact = (cat, impact) => {
    setCategoryImpacts(prev => ({
      ...prev,
      [cat]: impact
    }));
  };

  // Generate dynamic insight text
  const dynamicInsight = useMemo(() => {
    if (selectedCategories.length === 0) return null;

    const positives = Object.entries(categoryImpacts).filter(([_, imp]) => imp === "Positive").map(([cat]) => cat);
    const negatives = Object.entries(categoryImpacts).filter(([_, imp]) => imp === "Negative").map(([cat]) => cat);

    if (positives.length > 0 && negatives.length > 0) {
      return `It looks like ${negatives.join(" and ")} might be bothering you right now, but leaning into ${positives.join(" and ")} can provide a wonderful anchor.`;
    } else if (positives.length > 0) {
      return `It's great that ${positives.join(" and ")} are making you feel positive today! Keep exploring that good energy.`;
    } else if (negatives.length > 0) {
      return `I see that ${negatives.join(" and ")} are weighing on you. Be gentle with yourself and maybe take a small break.`;
    }

    return "Tell me more about how these factors are affecting your mood.";

  }, [selectedCategories, categoryImpacts]);

  // Determine if Step 3 should be visible
  const allImpactsAssigned = selectedCategories.length > 0 && selectedCategories.every(cat => categoryImpacts[cat]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <Card className="border-0 shadow-md ring-1 ring-border/50 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-primary"></div>
        <CardHeader>
          <CardTitle>Daily Mood Check-in</CardTitle>
          <CardDescription>
            Take a moment to reflect on how you feel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-3xl border border-border/50 transition-all duration-500">
              {/* Dynamic Image Container */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg mb-4 bg-muted relative">
                <img
                  key={`${currentTier}-${currentImageId}`} // forces refresh animation only on real image change
                  src={`/image/moodTier${currentTier}/${currentImageId}${SUPPORTED_EXTS[extIndex]}`}
                  alt="Mood representation"
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                  onError={(e) => {
                    if (extIndex < SUPPORTED_EXTS.length - 1) {
                      setExtIndex(prev => prev + 1);
                    } else {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }
                  }}
                />
              </div>
              <p className="font-heading font-medium text-3xl text-primary font-mono tracking-tight">
                {moodValue[0].toFixed(2)}
              </p>
            </div>

            <div className="px-2">
              <Slider
                value={moodValue}
                onValueChange={(val) => setMoodValue(val)}
                max={10}
                min={0}
                step={0.01}
                className="my-6"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>0 • Lowest</span>
                <span>5 • Neutral</span>
                <span>10 • Best</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border my-6"></div>

          {/* STEP 1: Categories Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              What&apos;s contributing to this?
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategories.includes(cat) ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 transition-all text-sm rounded-full ${selectedCategories.includes(cat) ? 'shadow-md scale-105' : 'hover:bg-primary/20 hover:text-primary bg-transparent text-muted-foreground border-border'}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* STEP 2: Impact Assignment (Auto-revealed) */}
          {selectedCategories.length > 0 && (
            <div className="space-y-4 pt-4 animate-in slide-in-from-top-4 fade-in duration-500">
              <label className="text-sm font-semibold text-foreground">
                How are these factors affecting you?
              </label>
              <div className="space-y-3">
                {selectedCategories.map(cat => (
                  <div key={cat} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-border/50 gap-3">
                    <span className="font-medium px-2">{cat}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={categoryImpacts[cat] === "Negative" ? "destructive" : "outline"}
                        className={`rounded-full ${categoryImpacts[cat] === "Negative" ? "opacity-100 ring-2 ring-destructive ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100 dark:text-red-400 dark:hover:text-red-300"}`}
                        onClick={() => setImpact(cat, "Negative")}
                      >
                        Bothering me
                      </Button>
                      <Button
                        size="sm"
                        variant={categoryImpacts[cat] === "Positive" ? "default" : "outline"}
                        className={`rounded-full ${categoryImpacts[cat] === "Positive" ? "opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-background bg-green-600 hover:bg-green-700 text-white" : "opacity-70 hover:opacity-100 dark:text-green-400 dark:hover:text-green-300"}`}
                        onClick={() => setImpact(cat, "Positive")}
                      >
                        Making me happy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Feedback & Save (Auto-revealed) */}
          {allImpactsAssigned && (
            <div className="space-y-6 pt-6 animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20">
                <p className="text-sm text-primary font-medium leading-relaxed">
                  {dynamicInsight}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Care to add more details? (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="secure-mode"
                      checked={isSecureMode}
                      onCheckedChange={setIsSecureMode}
                    />
                    <label htmlFor="secure-mode" className="text-xs cursor-pointer font-medium text-muted-foreground">Secure Brain Dump mode</label>
                  </div>
                </div>

                {isSecureMode ? (
                  <div className="space-y-4 p-4 border border-primary/20 bg-primary/5 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                    <Textarea
                      placeholder="Write your secure thoughts here..."
                      className="resize-none h-28 rounded-xl bg-background border-border focus-visible:ring-primary"
                      value={secureNote}
                      onChange={(e) => setSecureNote(e.target.value)}
                    />
                    
                    <div className="space-y-3 pt-2 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                        <label htmlFor="auto-pin" className="text-sm cursor-pointer font-medium text-foreground">Auto-apply 6-digit PIN</label>
                        <Switch
                          id="auto-pin"
                          checked={pinMode === "auto"}
                          onCheckedChange={(checked) => setPinMode(checked ? "auto" : "manual")}
                        />
                      </div>

                      {pinMode === "auto" ? (
                        <div className="animate-in slide-in-from-top-2 fade-in">
                          {savedAutoPin.length === 6 ? (
                             <div className="flex items-center gap-3">
                               <span className="text-sm border border-primary/30 px-3 py-1.5 rounded-full bg-primary/10 font-mono tracking-widest text-primary">••••••</span>
                               <Button variant="outline" size="sm" onClick={() => openKeypad('auto')} className="rounded-full">Change PIN</Button>
                             </div>
                          ) : (
                             <Button onClick={() => openKeypad('auto')} className="rounded-full" variant="secondary">Set Auto PIN</Button>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
                            This PIN will be seamlessly applied to future secure entries once saved.
                          </p>
                        </div>
                      ) : (
                        <div className="animate-in slide-in-from-top-2 fade-in">
                          <p className="text-xs text-muted-foreground mt-1">
                            You will be asked to enter a 6-digit PIN when you save.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Textarea
                    placeholder="Jot down a few thoughts..."
                    className="resize-none h-28 rounded-2xl bg-secondary/20 border-border focus-visible:ring-primary/30"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                )}
              </div>

              <Button
                className="w-full rounded-full h-12 text-base shadow-sm font-semibold transition-all"
                onClick={() => {
                  if (isSecureMode && pinMode === 'manual') {
                    openKeypad('manual');
                  } else {
                    handleSave();
                  }
                }}
                disabled={isSaving || (isSecureMode && pinMode === 'auto' && savedAutoPin.length !== 6)}
              >
                {isSaving ? "Saving..." : (isSecureMode && pinMode === 'manual') ? "Lock & Save" : "Save Today's Mood"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unchanged Past Entries rendering */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-semibold mt-8 mb-4">
          Recent Entries
        </h3>
        {pastEntries.length === 0 && (
          <p className="text-sm text-muted-foreground border border-border bg-secondary/10 p-4 rounded-xl">No entries yet. Create your first one above!</p>
        )}
        <div className="grid gap-3">
          {pastEntries.map((entry) => (
            <Card
              key={entry.id || entry.timestamp}
              className="border-0 shadow-sm ring-1 ring-border/50 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-start gap-4">
                {/* Retaining backward compatible emoji rendering for lists */}
                <div className="text-3xl bg-secondary rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                  {entry.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-sm text-foreground">
                      {entry.date}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {entry.time}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                    {entry.tags?.map((tag) => {
                      const isPos = typeof tag === 'string' && tag.includes("Positive");
                      const isNeg = typeof tag === 'string' && tag.includes("Negative");
                      return (
                        <span
                          key={tag}
                          className={`text-[10px] tracking-wide px-2.5 py-0.5 rounded-full font-medium border ${isPos ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : isNeg ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-secondary text-primary border-transparent'}`}
                        >
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                  {entry.suggestion && (
                    <p className="text-sm text-primary font-medium mt-3 bg-primary/10 p-2.5 rounded-lg border border-primary/20">{entry.suggestion}</p>
                  )}
                  {entry.isLocked ? (
                    unlockedEntries.includes(entry.id || entry.timestamp) ? (
                      <div className="mt-3 bg-primary/5 border border-primary/20 p-3 rounded-xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">🔓</span>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Secure Note Unlocked</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pl-1 whitespace-pre-wrap">{entry.secureNote}</p>
                      </div>
                    ) : (
                      <div className="mt-3 bg-secondary/30 border border-border/50 p-3 rounded-xl flex items-center justify-between gap-3">
                         <div className="flex items-center gap-2">
                           <span className="text-sm">🔒</span>
                           <span className="text-sm font-semibold text-foreground">Locked Entry</span>
                         </div>
                         <Button
                           size="sm"
                           variant="secondary"
                           className="font-medium rounded-full px-5"
                           onClick={() => openKeypad(entry.id || entry.timestamp)}
                         >
                           Unlock
                         </Button>
                      </div>
                    )
                  ) : (
                    entry.note && (
                      <p className="text-sm text-muted-foreground mt-2 bg-secondary/20 p-2.5 rounded-lg whitespace-pre-wrap">{entry.note}</p>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isKeypadOpen} onOpenChange={setIsKeypadOpen}>
        <DialogContent className="sm:max-w-xs p-6 bg-background rounded-3xl" showCloseButton={false}>
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="text-xl font-heading font-medium">
              {keypadContext === 'auto' ? 'Set Auto PIN' : keypadContext === 'manual' ? 'Enter PIN to Save' : 'Unlock Entry'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsKeypadOpen(false)} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-center gap-4 mb-10">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < keypadPin.length ? 'bg-primary scale-110' : 'bg-secondary border border-border'}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-y-4 gap-x-6 mx-auto max-w-[240px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <Button
                key={num}
                variant="outline"
                className="w-16 h-16 rounded-full text-2xl font-medium border-border/50 hover:bg-secondary active:scale-95 transition-all shadow-sm"
                onClick={() => handleKeypadPress(num.toString())}
              >
                {num}
              </Button>
            ))}
            <div />
            <Button
              variant="outline"
              className="w-16 h-16 rounded-full text-2xl font-medium border-border/50 hover:bg-secondary active:scale-95 transition-all shadow-sm"
              onClick={() => handleKeypadPress("0")}
            >
              0
            </Button>
            <Button
              variant="ghost"
              className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
              onClick={handleKeypadDelete}
            >
              <Delete className="w-7 h-7" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
