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
import { X, Delete, Pencil, Trash2, GraduationCap, Users, Heart, Briefcase, Activity, Banknote, Shield, Lock, Unlock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "School", icon: GraduationCap, color: "text-blue-500" },
  { id: "Family", icon: Users, color: "text-pink-500" },
  { id: "Social", icon: Heart, color: "text-rose-500" },
  { id: "Work", icon: Briefcase, color: "text-amber-600" },
  { id: "Health", icon: Activity, color: "text-emerald-500" },
  { id: "Finances", icon: Banknote, color: "text-teal-600" },
];

const MOOD_EMOJIS = {
  0: "💀",
  1: "😫",
  2: "😞",
  3: "🙁",
  4: "😐",
  5: "🙂",
  6: "😊",
  7: "😄",
  8: "🤩",
  9: "😍",
  10: "🥳",
};

const MOOD_LABELS = {
  0: "Rock Bottom",
  1: "Exhausted",
  2: "Struggling",
  3: "A bit down",
  4: "Meh",
  5: "Balanced",
  6: "Content",
  7: "Cheerful",
  8: "Wonderful",
  9: "Radiant",
  10: "Euphoric",
};

const MOOD_COLORS = {
  0: "from-stone-600 to-zinc-900",
  1: "from-zinc-500 to-stone-700",
  2: "from-slate-500 to-slate-800",
  3: "from-indigo-400 to-blue-700",
  4: "from-sky-400 to-cyan-700",
  5: "from-teal-400 to-emerald-700",
  6: "from-emerald-400 to-teal-700",
  7: "from-yellow-400 to-orange-600",
  8: "from-orange-400 to-rose-600",
  9: "from-rose-400 to-purple-600",
  10: "from-purple-500 to-indigo-800",
};

export default function MoodTracker() {
  const [moodValue, setMoodValue] = useState([5]);
  const [isInteracted, setIsInteracted] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryImpacts, setCategoryImpacts] = useState({});
  const [note, setNote] = useState("");

  const [secureNote, setSecureNote] = useState("");
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [pinMode, setPinMode] = useState("manual"); // 'auto' | 'manual'
  const [savedAutoPin, setSavedAutoPin] = useState("");

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedSecureMode = localStorage.getItem('mood_isSecureMode');
      if (storedSecureMode !== null) setIsSecureMode(storedSecureMode === 'true');
      
      const storedPinMode = localStorage.getItem('mood_pinMode');
      if (storedPinMode) setPinMode(storedPinMode);

      const storedAutoPin = localStorage.getItem('mood_savedAutoPin');
      if (storedAutoPin) setSavedAutoPin(storedAutoPin);
    } catch (err) {
      console.error("Failed to load preferences from localStorage", err);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('mood_isSecureMode', isSecureMode);
      localStorage.setItem('mood_pinMode', pinMode);
      localStorage.setItem('mood_savedAutoPin', savedAutoPin);
    } catch (err) {
      console.error("Failed to save preferences to localStorage", err);
    }
  }, [isSecureMode, pinMode, savedAutoPin]);

  const [unlockedEntries, setUnlockedEntries] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);

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

  useEffect(() => {
    if (!isKeypadOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleKeypadDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKeypadOpen, keypadPin]);

  const openKeypad = (context) => {
    setKeypadContext(context);
    setKeypadPin("");
    setIsKeypadOpen(true);
  };

  const [pastEntries, setPastEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`/api/mood/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPastEntries(prev => prev.filter(e => (e.id || e.timestamp) !== id));
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const handleEdit = (entry) => {
    if ((entry.is_locked || entry.isLocked) && !unlockedEntries.includes(entry.id || entry.timestamp)) {
      alert("Please unlock the entry first before editing.");
      return;
    }
    setMoodValue([entry.detailed_score || (entry.level * 2)]);
    const newCategories = [];
    const newImpacts = {};
    if (entry.tags && Array.isArray(entry.tags)) {
      entry.tags.forEach(tag => {
        const parts = typeof tag === 'string' ? tag.split(': ') : [];
        if (parts.length === 2) {
          newCategories.push(parts[0]);
          newImpacts[parts[0]] = parts[1];
        }
      });
    }
    setSelectedCategories(newCategories);
    setCategoryImpacts(newImpacts);
    if (entry.is_locked || entry.isLocked) {
      setIsSecureMode(true);
      setSecureNote(entry.secure_note || entry.secureNote || "");
    } else {
      setIsSecureMode(false);
      setNote(entry.note || "");
    }
    setEditingEntryId(entry.id || entry.timestamp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetch("/api/mood")
      .then((res) => res.json())
      .then((data) => setPastEntries(data))
      .catch((err) => console.error("Failed to load mood entries:", err));
  }, []);


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
    const tagsArray = selectedCategories.map(cat => `${cat}: ${categoryImpacts[cat] || "Neutral"}`);

    // Generate emoji based on 1-10 scale
    const currentMoodEmoji = MOOD_EMOJIS[moodValue[0]];

    // If editing, preserve the original date/time, otherwise use now
    let entryDate = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    let entryTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    let entryTimestamp = now.toISOString();

    if (editingEntryId) {
      const existingEntry = pastEntries.find(e => (e.id || e.timestamp) === editingEntryId);
      if (existingEntry) {
        entryDate = existingEntry.date;
        entryTime = existingEntry.time;
        entryTimestamp = existingEntry.timestamp;
      }
    }

    const newEntry = {
      date: entryDate,
      time: entryTime,
      timestamp: entryTimestamp,
      emoji: currentMoodEmoji,
      level: Math.round(moodValue[0] / 2), // map 1-10 back to 1-5 scale for backwards compatibility
      tags: tagsArray,
      note: isSecureMode ? null : note,
      detailedScore: moodValue[0],
      suggestion: dynamicInsight,
      isLocked: isSecureMode,
      secureNote: isSecureMode ? secureNote : null,
      pin: isSecureMode ? finalPin : null,
    };

    try {
      if (editingEntryId) {
        const res = await fetch(`/api/mood/${editingEntryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });
        if (res.ok) {
          const updatedEntry = await res.json();
          setPastEntries(prev => prev.map(e => (e.id || e.timestamp) === editingEntryId ? updatedEntry : e));
          setEditingEntryId(null);
          // Reset state
          setMoodValue([5]);
          setSelectedCategories([]);
          setCategoryImpacts({});
          setNote("");
          setSecureNote("");
        }
      } else {
        const res = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });
        if (res.ok) {
          const savedEntry = await res.json();
          setPastEntries([savedEntry, ...pastEntries]);

          // Reset state
          setMoodValue([5]);
          setSelectedCategories([]);
          setCategoryImpacts({});
          setNote("");
          setSecureNote("");
          // Intentionally not resetting isSecureMode and pinMode to remember the user's choice
        }
      }
    } catch (err) {
      console.error("Failed to save mood:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        const newCats = prev.filter(c => c !== catId);
        // remove its impact
        setCategoryImpacts(curr => {
          const newImpacts = { ...curr };
          delete newImpacts[catId];
          return newImpacts;
        });
        return newCats;
      } else {
        return [...prev, catId];
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
    <div className="relative min-h-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary Glow */}
        <div 
          className={cn(
            "absolute -top-[20%] -left-[10%] w-[70%] h-[70%] blur-[120px] opacity-[0.15] rounded-full transition-all duration-1000 bg-gradient-to-br",
            MOOD_COLORS[moodValue[0]]
          )}
        />
        {/* Secondary Glow */}
        <div 
          className={cn(
            "absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] blur-[100px] opacity-[0.1] rounded-full transition-all duration-1000 delay-150 bg-gradient-to-tl",
            MOOD_COLORS[moodValue[0]]
          )}
        />
        {/* Accent Floating Blob */}
        <div 
          className={cn(
            "absolute top-[40%] left-[60%] w-[30%] h-[30%] blur-[80px] opacity-[0.08] rounded-full transition-all duration-1000 delay-300 animate-float bg-gradient-to-tr",
            MOOD_COLORS[moodValue[0]]
          )}
        />
        {/* Subtle Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <Card className="relative z-10 border-0 shadow-2xl ring-1 ring-border/20 bg-card/60 backdrop-blur-3xl overflow-hidden rounded-[2.5rem]">
        <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-primary"></div>
        <CardHeader>
          <CardTitle>Daily Mood Check-in</CardTitle>
          <CardDescription>
            Take a moment to reflect on how you feel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12 transition-all duration-700 relative overflow-hidden group">
              {/* Inner ambient glow background */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full blur-[100px] opacity-25 transition-all duration-1000 rounded-full scale-125 bg-gradient-to-b",
                  MOOD_COLORS[moodValue[0]]
                )}
              />

              <div className="relative z-10 w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-6 text-9xl md:text-[10rem] animate-breathing drop-shadow-[0_25px_60px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform duration-500">
                {MOOD_EMOJIS[moodValue[0]]}
              </div>

              <div className="relative z-10 text-center space-y-1">
                <p className={cn(
                  "font-heading font-bold text-5xl tracking-tighter drop-shadow-md text-foreground"
                )}>
                  {moodValue[0]}
                </p>
                <p className={cn(
                  "text-xl font-semibold tracking-wide transition-all duration-500 drop-shadow-md",
                  moodValue[0] <= 2 ? "text-rose-500" :
                    moodValue[0] <= 4 ? "text-orange-500" :
                      moodValue[0] <= 5 ? "text-blue-500" :
                        moodValue[0] <= 7 ? "text-emerald-500" : "text-purple-500"
                )}>
                  {MOOD_LABELS[moodValue[0]]}
                </p>
              </div>
            </div>

            <div className="px-6 max-w-xl mx-auto w-full">
              <Slider
                value={moodValue}
                onValueChange={(val) => {
                  setMoodValue(val);
                  setIsInteracted(true);
                }}
                max={10}
                min={0}
                step={1}
                className="my-6"
              />
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                <span>Low</span>
                <span>Neutral</span>
                <span>Best</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border/40 my-10"></div>

          {/* STEP 1: Categories Selection */}
          <div className="space-y-8 pt-2">
            <div className="text-center space-y-2">
              <label className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                What&apos;s contributing to this?
              </label>
              <p className="text-sm text-muted-foreground">Select the areas influencing your mood today</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-2xl mx-auto px-4">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={cn(
                    "cursor-pointer px-6 py-4 transition-all duration-300 rounded-2xl border flex items-center gap-3 group backdrop-blur-md",
                    selectedCategories.includes(cat.id)
                      ? "bg-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                      : "bg-card/40 hover:bg-secondary/40 border-border/50 text-foreground hover:border-primary/30 shadow-sm"
                  )}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <cat.icon className={cn(
                    "w-5 h-5 transition-colors",
                    selectedCategories.includes(cat.id) ? "text-primary-foreground" : cat.color
                  )} />
                  <span className="font-medium">{cat.id}</span>
                </div>
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
                    <label htmlFor="secure-mode" className="text-xs cursor-pointer font-medium text-muted-foreground">Hidden Space</label>
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
                {isSaving ? "Saving..." : editingEntryId ? "Update Entry" : (isSecureMode && pinMode === 'manual') ? "Lock & Save" : "Save Today's Mood"}
              </Button>
              {editingEntryId && (
                <Button
                  variant="outline"
                  className="w-full rounded-full h-12 text-base shadow-sm font-semibold transition-all mt-2"
                  onClick={() => {
                    setEditingEntryId(null);
                    setMoodValue([5]);
                    setSelectedCategories([]);
                    setCategoryImpacts({});
                    setNote("");
                    setSecureNote("");
                  }}
                  disabled={isSaving}
                >
                  Cancel Edit
                </Button>
              )}
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
              className="relative z-10 border-0 shadow-sm ring-1 ring-border/30 bg-card/40 backdrop-blur-xl hover:shadow-md transition-all hover:-translate-y-0.5 rounded-2xl overflow-hidden"
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn(
                  "text-3xl rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 shadow-inner transition-transform hover:scale-110 duration-300 bg-gradient-to-br border border-white/10",
                  MOOD_COLORS[entry.detailedScore ?? (entry.level * 2)] || "from-secondary to-secondary/50"
                )}>
                  <span className="drop-shadow-sm">{entry.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {entry.date}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {entry.time}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(entry)} title="Edit">
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={() => handleDelete(entry.id || entry.timestamp)} title="Delete">
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
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
                  {entry.is_locked || entry.isLocked ? (
                    unlockedEntries.includes(entry.id || entry.timestamp) ? (
                      <div className="mt-3 bg-primary/5 border border-primary/20 p-3 rounded-xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">🔓</span>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Secure Note Unlocked</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pl-1 whitespace-pre-wrap">{entry.secure_note || entry.secureNote}</p>
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
            <DialogTitle className="text-xl font-heading font-semibold flex items-center gap-2">
              {keypadContext === 'auto' ? <Shield className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-primary" />}
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
