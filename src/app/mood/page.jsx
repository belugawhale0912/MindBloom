"use client";

import { useState, useEffect } from "react";
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

const MOODS = [
  { level: 1, emoji: "😞", label: "Very Low" },
  { level: 2, emoji: "🙁", label: "Low" },
  { level: 3, emoji: "😐", label: "Neutral" },
  { level: 4, emoji: "🙂", label: "Good" },
  { level: 5, emoji: "😄", label: "Great" },
];

const TAGS = [
  "Anxious",
  "Happy",
  "Tired",
  "Grateful",
  "Stressed",
  "Calm",
  "Overwhelmed",
  "Excited",
  "Sad",
  "Productive",
];




export default function MoodTracker() {
  const [moodValue, setMoodValue] = useState([3]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState("");
  const [pastEntries, setPastEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/mood")
      .then((res) => res.json())
      .then((data) => setPastEntries(data))
      .catch((err) => console.error("Failed to load mood entries:", err));
  }, []);

  const currentMood = MOODS.find((m) => m.level === moodValue[0]) || MOODS[2];

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const now = new Date();
    const newEntry = {
      date: now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      timestamp: now.toISOString(),
      emoji: currentMood.emoji,
      level: currentMood.level,
      tags: selectedTags,
      note: note,
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
        setMoodValue([3]);
        setSelectedTags([]);
        setNote("");
      }
    } catch (err) {
      console.error("Failed to save mood:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-3xl border border-border/50">
              <span
                className="text-6xl mb-4 animate-in zoom-in duration-300"
                key={currentMood.emoji}
              >
                {currentMood.emoji}
              </span>
              <p className="font-heading font-medium text-lg text-primary">
                {currentMood.label}
              </p>
            </div>

            <div className="px-2">
              <Slider
                value={moodValue}
                onValueChange={(val) => setMoodValue(val)}
                max={5}
                min={1}
                step={1}
                className="my-6"
              />

              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Low</span>
                <span>Neutral</span>
                <span>Great</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              What&apos;s contributing to this?
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 transition-colors hover:bg-primary/20 hover:text-primary ${!selectedTags.includes(tag) && "bg-transparent text-muted-foreground border-border"}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              What&apos;s on your mind? (Optional)
            </label>
            <Textarea
              placeholder="Jot down a few thoughts..."
              className="resize-none h-24 rounded-2xl bg-secondary/20 border-border focus-visible:ring-primary/30"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button 
            className="w-full rounded-full h-12 text-base shadow-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Today's Mood"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="bg-[#FFF9C4]/50 text-[#856404] p-4 rounded-2xl border border-[#FFE082]/60 flex gap-3 shadow-sm">
          <span className="text-xl">📌</span>
          <div>
            <h4 className="font-semibold text-sm">Pattern Insight</h4>
            <p className="text-xs opacity-90 mt-0.5">
              You tend to feel lower on Mondays. Try to plan something relaxing
              for Sunday evening.
            </p>
          </div>
        </div>

        <h3 className="font-heading text-xl font-semibold mt-8 mb-4">
          Recent Entries
        </h3>
        <div className="grid gap-3">
          {pastEntries.map((entry) => (
            <Card
              key={entry.id}
              className="border-0 shadow-sm ring-1 ring-border/50"
            >
              <CardContent className="p-4 flex items-start gap-4">
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
                  <div className="flex gap-1.5 mb-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider bg-secondary text-primary px-2 py-0.5 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.note}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
