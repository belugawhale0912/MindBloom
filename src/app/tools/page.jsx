"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function GuidedTools() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("Ready");
  const [breathingMode, setBreathingMode] = useState("Box Breathing");
  const [meditationPlaying, setMeditationPlaying] = useState(null);
  const [journalContent, setJournalContent] = useState("");
  const [savedJournals, setSavedJournals] = useState([]);
  const [isSavingJournal, setIsSavingJournal] = useState(false);

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
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" }),
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

  // Breathing logic
  useEffect(() => {
    let interval;
    if (isBreathing) {
      let count = 0;
      const phases = breathingMode === "Box Breathing" 
        ? ["Inhale (4s)", "Hold (4s)", "Exhale (4s)", "Hold (4s)"]
        : ["Inhale (4s)", "Hold (7s)", "Exhale (8s)"];
      
      setBreathingPhase(phases[0]);
      interval = setInterval(() => {
        count = (count + 1) % phases.length;
        setBreathingPhase(phases[count]);
      }, 4000); // simplified 4s for all for prototype, but ideally unique per phase
    } else {
      setBreathingPhase("Ready");
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathingMode]);

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

      <Tabs defaultValue="breathing" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-secondary/50 rounded-2xl overflow-x-auto hide-scrollbar flex-nowrap mb-6 [&>button]:flex-1 flex min-w-max">
          <TabsTrigger value="breathing" className="rounded-xl py-2.5 px-4">
            <Wind className="h-4 w-4 mr-2" /> Breathing
          </TabsTrigger>
          <TabsTrigger value="meditation" className="rounded-xl py-2.5 px-4">
            <Heart className="h-4 w-4 mr-2" /> Meditation
          </TabsTrigger>
          <TabsTrigger value="journaling" className="rounded-xl py-2.5 px-4">
            <BookOpen className="h-4 w-4 mr-2" /> Journaling
          </TabsTrigger>
          <TabsTrigger value="grounding" className="rounded-xl py-2.5 px-4">
            <Anchor className="h-4 w-4 mr-2" /> Grounding
          </TabsTrigger>
        </TabsList>

        {/* BREATHING TAB */}
        <TabsContent value="breathing" className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-b from-card to-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div
                className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-3000 ease-in-out ${isBreathing ? "scale-125 border-primary/50 bg-primary/10" : "scale-100 border-primary/20 bg-transparent"}`}
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
          {[
            {
              title: "5-min Morning Calm",
              duration: "5 min",
              desc: "Start your day with clarity.",
            },
            {
              title: "10-min Body Scan",
              duration: "10 min",
              desc: "Release physical tension.",
            },
            {
              title: "Sleep Wind-Down",
              duration: "15 min",
              desc: "Prepare your mind for rest.",
            },
          ].map((item, i) => (
            <Card
              key={i}
              onClick={() => setMeditationPlaying(meditationPlaying === i ? null : i)}
              className={`border-0 shadow-sm ring-1 transition-all cursor-pointer ${meditationPlaying === i ? "ring-primary bg-primary/5" : "ring-border/50 hover:ring-primary/40"}`}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className={`w-full sm:w-24 h-24 sm:h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors ${meditationPlaying === i ? "bg-primary text-white" : "bg-secondary/80"}`}>
                  {meditationPlaying === i ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 text-primary" />}
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className={`font-semibold transition-colors ${meditationPlaying === i ? "text-primary" : "text-foreground"}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{meditationPlaying === i ? "Playing now..." : item.desc}</p>
                </div>
                <Badge variant="secondary" className="bg-background text-xs">
                  {item.duration}
                </Badge>
              </CardContent>
            </Card>
          ))}
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
            <h3 className="font-heading font-semibold text-foreground text-lg">Your Past Entries</h3>
            {savedJournals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No entries yet. Start writing above!</p>
            ) : (
              <div className="grid gap-4">
                {savedJournals.map(entry => (
                  <Card key={entry.id} className="border-0 shadow-sm ring-1 ring-border/50 bg-secondary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">{entry.date}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground whitespace-pre-wrap">
                      {entry.content}
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
