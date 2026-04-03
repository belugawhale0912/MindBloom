"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flame, BookOpen, TrendingUp } from "lucide-react";

import { useState, useEffect } from "react";

const getColorForLevel = (level, isActive) => {
  if (!isActive) return "bg-muted text-transparent";
  switch (level) {
    case 5:
      return "bg-primary text-primary-foreground";
    case 4:
      return "bg-primary/80 text-primary-foreground";
    case 3:
      return "bg-primary/60 text-primary-foreground";
    case 2:
      return "bg-primary/40 text-foreground";
    case 1:
      return "bg-primary/20 text-foreground";
    default:
      return "bg-muted";
  }
};

export default function Insights() {
  const [mockData, setMockData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  const [moodEntries, setMoodEntries] = useState([]);
  const [journalCount, setJournalCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/mood").then(res => res.json()),
      fetch("/api/journal").then(res => res.json())
    ]).then(([moodData, journalData]) => {
      setMoodEntries(moodData);
      setJournalCount(journalData.length);

      const recent30 = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const shortDateStr = `${d.getMonth() + 1}/${d.getDate()}`;
        const entry = moodData.find(e => e.date === dateStr);
        recent30.push({
          date: shortDateStr,
          mood: entry ? entry.level : null, 
        });
      }
      setMockData(recent30);

      const heatmap = Array.from({ length: 28 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - i));
        const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const entry = moodData.find(e => e.date === dateStr);
        return {
          day: i % 7,
          level: entry ? entry.level : 0,
          isActive: !!entry,
        };
      });
      setHeatmapData(heatmap);
    }).catch(err => console.error(err));
  }, []);

  const streakCount = [...new Set(moodEntries.map(e => e.date))].length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Insights & Progress
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          A gentle look back at your journey.
        </p>
      </div>

      {/* Streak Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-[#FFF9C4]/30 to-transparent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-500 rounded-full shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{streakCount} Days</p>
              <p className="text-xs text-muted-foreground">Total check-in days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-blue-50 to-transparent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-500 rounded-full shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{journalCount} Entries</p>
              <p className="text-xs text-muted-foreground">
                Total journal entries
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-green-50 to-transparent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-500 rounded-full shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{moodEntries.length > 0 ? "Tracking" : "N/A"}</p>
              <p className="text-xs text-muted-foreground">Progress status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-secondary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">30-Day Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full bg-background rounded-2xl p-4 shadow-inner ring-1 ring-border/50 mt-2">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart
                data={mockData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  minTickGap={20}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "var(--color-foreground)",
                  }}
                  itemStyle={{ color: "var(--color-primary)" }}
                />

                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  connectNulls={false}
                  dot={{ r: 0 }}
                  activeDot={{
                    r: 6,
                    fill: "var(--color-primary)",
                    stroke: "var(--color-background)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Weekly Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {heatmapData.map((data, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md ${getColorForLevel(data.level, data.isActive)} flex items-center justify-center text-[10px] font-bold`}
                  title={`Level: ${data.level}`}
                >
                  {data.isActive ? data.level : ""}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <div
                    key={l}
                    className={`w-3 h-3 rounded-sm ${getColorForLevel(l, true)}`}
                  ></div>
                ))}
              </div>
              <span>High</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Pattern Insights */}
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-[#FFF9C4]/40">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-xl">📊</span> Pattern Insights
              </h3>

              <div className="space-y-3">
                {moodEntries.length < 5 ? (
                  <p className="text-xs text-muted-foreground">
                    Keep logging for a few more days to unlock personalized insights and patterns!
                  </p>
                ) : (
                  <>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <p className="text-sm font-medium text-foreground">
                        Consistency is key 🌟
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You've been checking in regularly. This helps the AI understand your patterns better.
                      </p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <p className="text-sm font-medium text-foreground">
                        Morning vs evening
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Try logging at different times to see how your mood shifts during the day.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Encouraging Message */}
          <Card className="border-0 shadow-sm bg-primary/10 border-primary/20">
            <CardContent className="p-5 text-center">
              <div className="text-3xl mb-2">{streakCount >= 1 ? "👏" : "🌱"}</div>
              <h3 className="font-semibold text-primary mb-1">
                {streakCount >= 1 ? "Keep going — you're doing amazing." : "Start your journey today."}
              </h3>
              <p className="text-sm text-primary/80">
                {streakCount >= 1 ? `You've checked in ${streakCount} days so far.` : "Your first check-in will appear here."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
