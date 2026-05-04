"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Moon,
  BellRing,
  Globe,
  Shield,
  LogOut,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. First sync with LocalStorage to avoid flicker
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("theme") === "dark";
      setDarkMode(isDark);
    }

    // 2. Fetch data from API
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications !== undefined ? data.notifications : true);
        
        if (data.darkMode !== undefined) {
          const currentTheme = localStorage.getItem("theme");
          const apiTheme = data.darkMode ? "dark" : "light";
          
          if (currentTheme !== apiTheme) {
            setDarkMode(data.darkMode);
            if (data.darkMode) {
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            } else {
              document.documentElement.classList.remove("dark");
              localStorage.setItem("theme", "light");
            }
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const toggleDarkMode = async (checked) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    await saveSettings({ darkMode: checked });
  };

  const toggleNotifications = async (checked) => {
    setNotifications(checked);
    await saveSettings({ notifications: checked });
  };

  const saveSettings = async (updates) => {
    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10 max-w-2xl">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your app preferences and experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Preferences */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> App Preferences
            </CardTitle>
            <CardDescription>Customize your MindBloom experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-2">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" /> Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch to a darker theme for less eye strain
                </p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="flex items-center justify-between p-2">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary" /> Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Manage how we send you reminders
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={toggleNotifications} />
            </div>

            <div className="flex items-center justify-between p-2">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Language
                </Label>
                <p className="text-sm text-muted-foreground">
                  Preferred language for the interface
                </p>
              </div>
              <span className="text-sm font-semibold bg-secondary/50 text-primary px-4 py-1.5 rounded-full cursor-pointer hover:bg-secondary transition-colors">
                English (US)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
