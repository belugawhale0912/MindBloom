"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircleHeart, Flower2, Smile, Bell, Sparkles, TrendingUp } from "lucide-react";
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      {/* Header Section - Standard App Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Welcome back, {userSettings.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ready for a mindful day? Take it one step at a time.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full px-4 py-1.5 text-xs font-medium bg-primary/10 border-none text-primary w-fit"
        >
          🔥 {streak}-day check-in streak
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Mood Check-in Card - More Compact */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              How are you feeling right now?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="flex justify-between items-center max-w-md mx-auto gap-2">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMoodSelect(idx)}
                  className={cn(
                    "text-4xl transition-all duration-300 hover:scale-110 p-3 rounded-2xl",
                    selectedMood === idx ? "bg-primary/10 scale-110" : "hover:bg-secondary/50"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedMood !== null && (
              <p className="text-xs text-center text-primary font-bold mt-4 animate-in fade-in slide-in-from-bottom-2 uppercase tracking-widest">
                Mood logged successfully
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quote Card - Standard Style */}
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-secondary/30 to-transparent flex flex-col justify-center p-6">
            <CardContent className="p-0 text-center space-y-4">
              <p className="text-lg font-medium text-foreground leading-relaxed italic">
                "You don't have to control your thoughts. You just have to stop
                letting them control you."
              </p>
              <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
                — Dan Millman
              </p>
            </CardContent>
          </Card>

          {/* Trend Card - Compact Visual */}
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Mood Trend
                </span>
                <Link
                  href="/insights"
                  className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
                >
                  Details
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart
                    data={moodData}
                    margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--color-muted-foreground)",
                        fontWeight: 500
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-secondary)", radius: 4 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        padding: "8px",
                        fontSize: "10px"
                      }}
                    />
                    <Bar
                      dataKey="mood"
                      fill="var(--color-primary)"
                      radius={[4, 4, 4, 4]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shortcuts Section - Standard Grid */}
        <section className="space-y-4 pt-2">
          <h3 className="text-lg font-bold tracking-tight px-1">Quick Shortcuts</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/companion", icon: MessageCircleHeart, title: "Companion", desc: "Share thoughts", color: "text-rose-500", bg: "bg-rose-50" },
              { href: "/tools", icon: Flower2, title: "Tools", desc: "Regulate system", color: "text-emerald-500", bg: "bg-emerald-50" },
              { href: "/zen", icon: Sparkles, title: "Zen", desc: "Find calm", color: "text-purple-500", bg: "bg-purple-50" },
              { href: "/mood", icon: Smile, title: "Mood", desc: "Track patterns", color: "text-amber-500", bg: "bg-amber-50" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card hover:ring-primary/40 transition-all duration-300">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className={cn("p-3 rounded-xl transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground", item.bg, item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Reminder - Standard Card */}
        <Card className="border-0 shadow-sm ring-1 ring-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-card text-primary p-2.5 rounded-xl shadow-sm border border-primary/10">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Upcoming Reminder
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                  {upcomingReminder.time ? `${upcomingReminder.time} — ${upcomingReminder.title}` : upcomingReminder.title}
                </p>
              </div>
            </div>
            <Link href="/reminders">
              <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/10 text-xs font-bold px-4">
                Manage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
