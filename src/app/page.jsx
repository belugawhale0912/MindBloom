"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleHeart, Flower2, Smile, Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      {/* Hero Section - Apple Style */}
      <section className="text-center space-y-4">
        <h2 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
          Good morning, {userSettings.name}.
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed">
          Ready for a mindful day? Take it one step at a time.
        </p>
        <div className="pt-4">
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1.5 text-sm font-medium bg-secondary/50 border-none text-foreground"
          >
            🔥 {streak}-day check-in streak
          </Badge>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12">
        {/* Mood Check-in - Large Editorial Card */}
        <Card className="border-none shadow-none bg-card overflow-hidden rounded-[28px] ring-1 ring-border/50">
          <CardHeader className="pt-10 px-10 pb-0">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              How are you feeling right now?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-8">
            <div className="flex justify-between items-center max-w-xl mx-auto gap-4">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMoodSelect(idx)}
                  className={cn(
                    "text-5xl transition-all duration-300 hover:scale-110 p-4 rounded-full",
                    selectedMood === idx ? "bg-primary/5 scale-110" : "hover:bg-secondary/40"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedMood !== null && (
              <p className="text-sm text-center text-primary font-medium mt-8 animate-in fade-in slide-in-from-bottom-2">
                Mood logged. Great job checking in.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quote Card - Subtle & Minimal */}
          <Card className="border-none shadow-none bg-secondary/30 rounded-[28px] flex items-center justify-center p-10 ring-1 ring-border/30">
            <CardContent className="p-0 text-center space-y-6">
              <p className="text-2xl font-medium text-foreground leading-snug">
                "You don't have to control your thoughts. You just have to stop
                letting them control you."
              </p>
              <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
                — Dan Millman
              </p>
            </CardContent>
          </Card>

          {/* Trend Card - Data Visual */}
          <Card className="border-none shadow-none bg-card rounded-[28px] ring-1 ring-border/50">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="text-xl font-semibold flex items-center justify-between">
                <span>Mood Trend</span>
                <Link
                  href="/insights"
                  className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                >
                  View full
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart
                    data={moodData}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "var(--color-muted-foreground)",
                        fontWeight: 500
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-secondary)", radius: 6 }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        padding: "12px"
                      }}
                    />
                    <Bar
                      dataKey="mood"
                      fill="var(--color-primary)"
                      radius={[6, 6, 6, 6]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shortcuts Section - Grid of Rounded Pills */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold tracking-tight px-2">Quick Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { href: "/companion", icon: MessageCircleHeart, title: "AI Companion", desc: "Share your thoughts" },
              { href: "/tools", icon: Flower2, title: "Guided Tools", desc: "Regulate your system" },
              { href: "/zen", icon: Sparkles, title: "Zen Space", desc: "Find your calm" },
              { href: "/mood", icon: Smile, title: "Log Mood", desc: "Track patterns" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <Card className="border-none shadow-none bg-card rounded-[24px] ring-1 ring-border/50 hover:ring-primary/40 transition-all duration-400 group-hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="bg-secondary/50 text-primary p-4 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-400">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Reminder - Modern Banner */}
        <Card className="border-none shadow-none bg-primary/5 rounded-[24px] ring-1 ring-primary/10">
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-card text-primary p-3 rounded-xl shadow-sm border border-primary/10">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Upcoming Reminder
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {upcomingReminder.time ? `${upcomingReminder.time} — ${upcomingReminder.title}` : upcomingReminder.title}
                </p>
              </div>
            </div>
            <Link href="/reminders">
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary px-3 py-1 font-medium hover:bg-primary/5 cursor-pointer">
                Manage
              </Badge>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
