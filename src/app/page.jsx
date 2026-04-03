"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleHeart, Flower2, Smile, Bell } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useState, useEffect } from "react";

const emojis = ["😞", "😐", "🙂", "😊", "😄"];

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [upcomingReminder, setUpcomingReminder] = useState({ title: "No upcoming reminders", time: "" });
  const [userSettings, setUserSettings] = useState({ name: "Alex" });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Fetch settings
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setUserSettings(data))
      .catch(err => console.error(err));

    // Fetch mood data
    fetch("/api/mood")
      .then(res => res.json())
      .then(data => {
        // Calculate streak
        if (data.length > 0) {
          const dates = [...new Set(data.map(d => d.date))];
          setStreak(dates.length); // Simplified streak for prototype: total unique days
        }

        const recent = data.slice(0, 7).reverse();
        const formatted = recent.map(entry => ({
          day: entry.date.split(',')[0].split(' ')[0],
          mood: entry.level || 3
        }));
        
        if (formatted.length === 0) {
          setMoodData([
            { day: "Mon", mood: 3 },
            { day: "Tue", mood: 4 },
            { day: "Wed", mood: 2 },
            { day: "Thu", mood: 5 },
            { day: "Fri", mood: 4 },
            { day: "Sat", mood: 4 },
            { day: "Sun", mood: 5 },
          ]);
        } else {
          setMoodData(formatted);
        }
      })
      .catch(err => console.error("Failed to fetch mood data", err));

    // Fetch reminders
    fetch("/api/reminders")
      .then(res => res.json())
      .then(data => {
        const active = data.find(r => r.active);
        if (active) {
          setUpcomingReminder({ title: active.title, time: active.time });
        }
      })
      .catch(err => console.error("Failed to fetch reminders", err));
  }, []);

  const handleMoodSelect = async (idx) => {
    setSelectedMood(idx);
    const now = new Date();
    const newEntry = {
      date: now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      timestamp: now.toISOString(),
      emoji: emojis[idx],
      level: idx + 1,
      tags: [],
      note: "Quick check-in from dashboard",
    };
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Good morning, {userSettings.name} 🌸
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ready for a mindful day? Take it one step at a time.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit text-sm px-3 py-1.5 rounded-full flex gap-1.5 font-medium border-primary/10"
        >
          <span>🔥</span> {streak}-day check-in streak!
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                How are you feeling right now?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-2xl">
                {emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMoodSelect(idx)}
                    className={`text-3xl transition-transform hover:scale-110 p-2 rounded-full ${selectedMood === idx ? "bg-primary/10 scale-110" : ""}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {selectedMood !== null && (
                <p className="text-xs text-center text-muted-foreground mt-3 transition-opacity">
                  Mood logged! Great job checking in.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-secondary/40 border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-lg font-medium text-primary text-center italic">
                "You don't have to control your thoughts. You just have to stop
                letting them control you."
              </p>
              <p className="text-right text-xs text-muted-foreground mt-2">
                — Dan Millman
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div>Mini Mood Trend</div>
                <Link
                  href="/insights"
                  className="text-xs text-primary font-normal hover:underline"
                >
                  View full
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart
                    data={moodData}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--color-muted-foreground)",
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-secondary)" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Bar
                      dataKey="mood"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <p className="font-heading font-semibold text-foreground">
              Quick Shortcuts
            </p>
            <Link href="/companion" className="group">
              <Card className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-secondary text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MessageCircleHeart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Talk to AI Companion
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Share your thoughts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tools" className="group">
              <Card className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-secondary text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Flower2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Start Breathing Exercise
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Regulate your nervous system
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mood" className="group">
              <Card className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-secondary text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Smile className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Log Detailed Mood
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Track patterns over time
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-background to-secondary/30">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="bg-background text-primary p-2 rounded-xl shadow-sm border border-border">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Upcoming Reminder
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {upcomingReminder.time ? `${upcomingReminder.time} — ${upcomingReminder.title}` : upcomingReminder.title}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
