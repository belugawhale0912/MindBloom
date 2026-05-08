"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Wind,
  Heart,
  BookOpen,
  Anchor,
  Pause,
  Sparkles,
  Bookmark,
  Pencil,
  Check,
  X,
} from "lucide-react";

function GuidedToolsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  
  const toolTabs = [
    { value: "breathing", label: "Breathing" },
    { value: "meditation", label: "Meditation" },
    { value: "journaling", label: "Journaling" },
    { value: "grounding", label: "Grounding" },
  ];
  const [activeToolTab, setActiveToolTab] = useState("breathing");

  useEffect(() => {
    if (tab && toolTabs.some(t => t.value === tab)) {
      setActiveToolTab(tab);
    }
  }, [tab, toolTabs]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("Ready");
  const [breathingMode, setBreathingMode] = useState("Box Breathing");
  const [selectedMeditationVideoId, setSelectedMeditationVideoId] = useState("");
  const [meditationTopic, setMeditationTopic] = useState("Morning Mindfulness");
  const [journalContent, setJournalContent] = useState("");
  const [savedJournals, setSavedJournals] = useState([]);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [journalViewMode, setJournalViewMode] = useState("all");
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const meditationTopics = [
    { label: "Morning Mindfulness", value: "Morning Mindfulness" },
    { label: "Body Scan Meditation", value: "Body Scan Meditation" },
    { label: "Sleep Meditation", value: "Sleep Meditation" },
    { label: "Anxiety Relief Meditation", value: "Anxiety Relief Meditation" },
    { label: "Visualization Meditation", value: "Visualization Meditation" },
  ];

  const fallbackMeditationVideos = {
    "Morning Mindfulness": [
      { id: "inpok4MKVLM", title: "5-Minute Meditation You Can Do Anywhere", channelTitle: "Goodful" },
      { id: "ZToicYcHIOU", title: "Daily Calm | 10 Minute Mindfulness Meditation | Be Present", channelTitle: "Calm" },
    ],
    "Body Scan Meditation": [
      { id: "aH72AScs0qk", title: "10 Minute Body Scan Meditation", channelTitle: "Priory" },
      { id: "jH9c0P58Gsc", title: "Mindfulness Body Scan", channelTitle: "Our Mental Health Space - Sussex Partnership NHS Foundation Trust" },
    ],
    "Sleep Meditation": [
      { id: "aEqlQvczMJQ", title: "10-Minute Meditation For Sleep", channelTitle: "Goodful" },
      { id: "69o0P7s8GHE", title: "Sleep Talk Down Guided Meditation: Fall Asleep Faster with Sleep Music & Spoken Word Hypnosis", channelTitle: "Jason Stephenson - Guided Sleep Meditation " },
    ],
    "Anxiety Relief Meditation": [
      { id: "O-6f5wQXSu8", title: "10-Minute Meditation For Anxiety | Goodful", channelTitle: "Goodful" },
      { id: "MIr3RsUWrdo", title: "20 Minute Guided Meditation for Reducing Anxiety and Stress--Clear the Clutter to Calm Down", channelTitle: "The Mindful Movement" },
    ],
    "Visualization Meditation": [
      { id: "Z_u-P2hqL8M", title: "Guided Manifestation Visualization Meditation ✨", channelTitle: "Alina Align" },
      { id: "FTuqv2fYbGc", title: "How To Manifest Anything! Visualize What You Want (POWERFUL GUIDED MEDITATION!)", channelTitle: "Fearless Soul" },
    ],
  };

  const breathingPatterns = {
    "Box Breathing": [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
    "4-7-8 Relaxing": [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Exhale", seconds: 8 },
    ],
    "Deep Calm": [
      { label: "Inhale", seconds: 5 },
      { label: "Exhale", seconds: 5 },
    ],
  };

  // Fetch journals
  useEffect(() => {
    fetch("/api/journal")
      .then(res => res.json())
      .then(data => setSavedJournals(data))
      .catch(err => console.error(err));
  }, []);

  const handleSaveJournal = async () => {
    if (!journalContent.trim() || isSavingJournal) return;
    setIsSavingJournal(true);
    const newEntry = {
      date: new Date().toISOString(),
      content: journalContent,
    };
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        const result = await res.json();
        setSavedJournals([result, ...savedJournals]);
        setJournalContent("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleToggleCollect = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_collected: !currentStatus })
      });
      if (res.ok) {
        const updatedEntry = await res.json();
        setSavedJournals(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      }
    } catch (e) {
      console.error("Failed to toggle collect status", e);
    }
  };

  const canEdit = (dateString) => {
    const entryDate = new Date(dateString);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return entryDate >= oneMonthAgo;
  };

  const handleEditStart = (entry) => {
    setEditingEntryId(entry.id);
    setEditContent(entry.content);
  };

  const handleEditCancel = () => {
    setEditingEntryId(null);
    setEditContent("");
  };

  const handleUpdateJournal = async (id) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: editContent })
      });
      if (res.ok) {
        const updatedEntry = await res.json();
        setSavedJournals(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
        setEditingEntryId(null);
      }
    } catch (e) {
      console.error("Failed to update journal", e);
    }
  };

  // Breathing logic
  useEffect(() => {
    let interval;
    if (isBreathing) {
      const pattern = breathingPatterns[breathingMode] || breathingPatterns["Box Breathing"];
      let stepIndex = 0;
      let remaining = pattern[0].seconds;

      setBreathingPhase(`${pattern[0].label} (${remaining}s)`);
      interval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          stepIndex = (stepIndex + 1) % pattern.length;
          remaining = pattern[stepIndex].seconds;
        }
        setBreathingPhase(`${pattern[stepIndex].label} (${remaining}s)`);
      }, 1000);
    } else {
      setBreathingPhase("Ready");
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathingMode]);

  const availableMeditationVideos = useMemo(() => {
    return (fallbackMeditationVideos[meditationTopic] || []).map((video) => ({
      ...video,
    }));
  }, [meditationTopic]);

  useEffect(() => {
    if (availableMeditationVideos.length === 0) {
      setSelectedMeditationVideoId("");
      return;
    }
    setSelectedMeditationVideoId(availableMeditationVideos[0].id);
  }, [availableMeditationVideos]);

  const journalsGroupedByDay = useMemo(() => {
    const groups = {};
    const filteredJournals = journalViewMode === "collected" 
      ? savedJournals.filter(entry => entry.is_collected)
      : savedJournals;

    filteredJournals.forEach((entry) => {
      const parsedDate = entry.createdAt ? new Date(entry.createdAt) : new Date(entry.date);
      const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const dayKey = safeDate.toLocaleDateString("en-CA");

      if (!groups[dayKey]) {
        groups[dayKey] = {
          label: safeDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          entries: [],
        };
      }
      groups[dayKey].entries.push(entry);
    });
    return Object.entries(groups).sort(([a], [b]) => (a > b ? -1 : 1));
  }, [savedJournals, journalViewMode]);

  const journalStreak = useMemo(() => {
    if (savedJournals.length === 0) return 0;

    const uniqueDays = [
      ...new Set(
        savedJournals.map((entry) => {
          const parsedDate = entry.createdAt ? new Date(entry.createdAt) : new Date(entry.date);
          const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
          return safeDate.toLocaleDateString("en-CA");
        }),
      ),
    ].sort((a, b) => (a > b ? -1 : 1));

    if (uniqueDays.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(uniqueDays[0]);

    for (let i = 1; i < uniqueDays.length; i += 1) {
      const previous = new Date(currentDate);
      previous.setDate(previous.getDate() - 1);
      const expected = previous.toLocaleDateString("en-CA");

      if (uniqueDays[i] === expected) {
        streak += 1;
        currentDate = new Date(uniqueDays[i]);
      } else {
        break;
      }
    }

    return streak;
  }, [savedJournals]);

  const toggleBreathing = () => setIsBreathing(!isBreathing);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Guided Tools
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Exercises to help you find your center.
        </p>
      </div>

      <Tabs value={activeToolTab} onValueChange={setActiveToolTab} className="w-full">
        <div className="w-full mb-6 rounded-2xl bg-secondary/50 p-1">
          <div className="rounded-xl bg-background/70 px-3 py-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Select Tool
            </label>
            <select
              value={activeToolTab}
              onChange={(e) => setActiveToolTab(e.target.value)}
              className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              aria-label="Select guided tool"
            >
              {toolTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TabsList className="sr-only">
          {toolTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* BREATHING TAB */}
        <TabsContent value="breathing" className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-b from-card to-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div
                className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-4 flex items-center justify-center transition-all duration-3000 ease-in-out ${isBreathing ? "scale-110 md:scale-115 border-primary/50 bg-primary/10" : "scale-100 border-primary/20 bg-transparent"}`}
                style={{
                  animation: isBreathing
                    ? "pulse-breathe 8s infinite alternate"
                    : "none",
                }}
              >
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-3000 ${isBreathing ? "bg-primary/20" : "bg-primary/5"}`}
                >
                  <span className="font-heading font-semibold text-lg text-primary text-center">
                    {isBreathing ? breathingPhase : "Ready"}
                  </span>
                </div>
              </div>
              <Button
                onClick={toggleBreathing}
                className="mt-12 rounded-full px-8 shadow-sm"
                variant={isBreathing ? "outline" : "default"}
              >
                {isBreathing ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Pause Exercise
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Start Breathing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              onClick={() => setBreathingMode("Box Breathing")}
              className={`border-0 shadow-sm ring-1 ring-border/50 cursor-pointer transition-colors ${breathingMode === "Box Breathing" ? "bg-primary/10 ring-primary/50" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-base ${breathingMode === "Box Breathing" ? "text-primary" : ""}`}>
                  Box Breathing
                </CardTitle>
                <CardDescription>4-4-4-4 technique for focus</CardDescription>
              </CardHeader>
            </Card>
            <Card
              onClick={() => setBreathingMode("4-7-8 Relaxing")}
              className={`border-0 shadow-sm ring-1 ring-border/50 cursor-pointer transition-colors ${breathingMode === "4-7-8 Relaxing" ? "bg-primary/10 ring-primary/50" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-base ${breathingMode === "4-7-8 Relaxing" ? "text-primary" : ""}`}>4-7-8 Relaxing</CardTitle>
                <CardDescription>Deep calm & sleep aid</CardDescription>
              </CardHeader>
            </Card>
            <Card
              onClick={() => setBreathingMode("Deep Calm")}
              className={`border-0 shadow-sm ring-1 ring-border/50 cursor-pointer transition-colors ${breathingMode === "Deep Calm" ? "bg-primary/10 ring-primary/50" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-base ${breathingMode === "Deep Calm" ? "text-primary" : ""}`}>Deep Calm</CardTitle>
                <CardDescription>Resonant breathing pace</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* MEDITATION TAB */}
        <TabsContent value="meditation" className="space-y-4">
          <Card className="border-0 shadow-sm ring-1 ring-border/50">
            <CardContent className="p-4 space-y-3">
              <label className="text-sm font-medium text-foreground">Choose an activity</label>
              <select
                value={meditationTopic}
                onChange={(e) => {
                  setMeditationTopic(e.target.value);
                }}
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              >
                {meditationTopics.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Available Videos</CardTitle>
              <CardDescription>Select a video to play below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableMeditationVideos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No videos available for this activity yet.</p>
              ) : (
                <div className="grid gap-2">
                  {availableMeditationVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => {
                        setSelectedMeditationVideoId(video.id);
                      }}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${selectedMeditationVideoId === video.id
                          ? "border-primary bg-primary/10"
                          : "border-border/60 hover:border-primary/40"
                        }`}
                    >
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedMeditationVideoId && (
            <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="aspect-video w-full overflow-hidden rounded-xl ring-1 ring-border/40">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${selectedMeditationVideoId}`}
                    title="Selected meditation video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {selectedMeditationVideoId && (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${selectedMeditationVideoId}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                Open Current Video
              </Button>
            </div>
          )}
        </TabsContent>

        {/* JOURNALING TAB */}
        <TabsContent value="journaling" className="space-y-4">
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-[#Fdfbf7]">
            <CardHeader>
              <CardTitle className="text-lg text-[#b8860b] flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Daily Prompt
              </CardTitle>
              <CardDescription className="text-base font-medium text-foreground">
                What&apos;s one thing that made you smile today, no matter how
                small?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your thoughts here..."
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                className="min-h-[150px] resize-none bg-white rounded-2xl focus-visible:ring-[#b8860b]/30 border-border/50 text-base"
                disabled={isSavingJournal}
              />

              <Button
                onClick={handleSaveJournal}
                disabled={!journalContent.trim() || isSavingJournal}
                className="w-full md:w-auto rounded-full bg-[#b8860b] hover:bg-[#b8860b]/90 text-white"
              >
                {isSavingJournal ? "Saving..." : "Save to Journal"}
              </Button>
            </CardContent>
          </Card>

          {/* Past Journals */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <h3 className="font-heading font-semibold text-foreground text-lg">Your Past Entries</h3>
                <div className="flex bg-secondary/50 rounded-full p-1">
                  <button 
                    onClick={() => setJournalViewMode("all")}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${journalViewMode === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setJournalViewMode("collected")}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${journalViewMode === "collected" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Collection
                  </button>
                </div>
              </div>
              <Badge variant="secondary" className="bg-[#b8860b]/10 text-[#b8860b] border border-[#b8860b]/20">
                {journalStreak} day streak
              </Badge>
            </div>
            {journalsGroupedByDay.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {journalViewMode === "collected" ? "No collected entries yet. Star an entry to add it here!" : "No entries yet. Start writing above!"}
              </p>
            ) : (
              <div className="grid gap-4">
                {journalsGroupedByDay.map(([dayKey, dayGroup]) => (
                  <Card key={dayKey} className="border-0 shadow-sm ring-1 ring-border/50 bg-secondary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">{dayGroup.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dayGroup.entries.map((entry, index) => (
                        <div key={entry.id}>
                          <div className="rounded-xl bg-background/60 p-3 text-sm text-foreground whitespace-pre-wrap relative group">
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              {canEdit(entry.date) && editingEntryId !== entry.id && (
                                <button
                                  onClick={() => handleEditStart(entry)}
                                  className="p-1.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                                  title="Edit Entry"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleCollect(entry.id, entry.is_collected)}
                                className={`p-1.5 rounded-full transition-colors ${entry.is_collected ? "text-[#b8860b] bg-[#b8860b]/10" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-secondary"}`}
                                title={entry.is_collected ? "Remove from Collection" : "Add to Collection"}
                              >
                                <Bookmark className="h-4 w-4" fill={entry.is_collected ? "currentColor" : "none"} />
                              </button>
                            </div>
                            
                            {editingEntryId === entry.id ? (
                              <div className="space-y-2 pr-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[80px] text-sm resize-none bg-background rounded-lg border-border/50"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive" onClick={handleEditCancel}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-primary" onClick={() => handleUpdateJournal(entry.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="pr-12">
                                {entry.content}
                              </div>
                            )}
                          </div>
                          {index < dayGroup.entries.length - 1 && <hr className="my-3 border-border/60" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* GROUNDING TAB */}
        <TabsContent value="grounding" className="space-y-4">
          <p className="mb-4 text-sm text-muted-foreground">
            The 5-4-3-2-1 technique helps bring you back to the present moment.
          </p>

          <div className="grid gap-3">
            {[
              {
                num: "5",
                text: "Things you can SEE",
                example: "A pen, a spot on the ceiling, a plant...",
              },
              {
                num: "4",
                text: "Things you can FEEL",
                example: "The chair under you, the fabric of your shirt...",
              },
              {
                num: "3",
                text: "Things you can HEAR",
                example: "A clock ticking, cars outside, the AC...",
              },
              {
                num: "2",
                text: "Things you can SMELL",
                example: "Coffee, soap, fresh air...",
              },
              {
                num: "1",
                text: "Thing you can TASTE",
                example: "Mint, the lingering taste of lunch...",
              },
            ].map((step, idx) => (
              <Card
                key={idx}
                className="border-0 shadow-sm ring-1 ring-border/50 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-primary/10 flex items-center justify-center font-heading font-bold text-2xl text-primary border-r border-border/50">
                  {step.num}
                </div>
                <CardContent className="p-4 pl-16">
                  <h3 className="font-bold text-foreground">{step.text}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.example}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function GuidedTools() {
  return (
    <Suspense fallback={<div>Loading tools...</div>}>
      <GuidedToolsContent />
    </Suspense>
  );
}
