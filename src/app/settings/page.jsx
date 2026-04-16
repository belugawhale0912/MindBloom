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
  const [name, setName] = useState("Alex");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    
    // From here used to add the dark mode setting to local storage
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDarkMode(isDark);
    }

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setName(data.name || "Alex");
        if (data.darkMode !== undefined) {
          setDarkMode(data.darkMode);
          if (data.darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          }
        }
        setNotifications(data.notifications !== undefined ? data.notifications : true);
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

  const handleProfileSave = () => {
    saveSettings({ name });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10 max-w-2xl">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile
            </CardTitle>
            <CardDescription>Manage your public Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-2xl shadow-inner border border-border">
                <User className="h-10 w-10" />
              </div>
              <Button variant="outline" className="rounded-full">
                Change Avatar
              </Button>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-md rounded-xl"
              />
            </div>
            <Button className="rounded-full mt-2" onClick={handleProfileSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Moon className="h-4 w-4" /> Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch to a darker theme for less eye strain
                </p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <BellRing className="h-4 w-4" /> Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Manage how we send you reminders
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={toggleNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Language
                </Label>
                <p className="text-sm text-muted-foreground">
                  Preferred language for the interface
                </p>
              </div>
              <span className="text-sm font-medium border px-3 py-1 rounded-full cursor-pointer hover:bg-secondary">
                English (US)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Account & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30">
              <div>
                <h4 className="font-medium text-foreground">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Last changed 3 months ago
                </p>
              </div>
              <Button variant="outline" className="rounded-full">
                Update Password
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-secondary/50 rounded-xl py-6 mt-2"
              onClick={() => alert("Logging out...")}
            >
              <LogOut className="h-5 w-5 mr-3" /> Log Out of All Devices
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <div className="pt-8 px-4 flex flex-col items-center text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button
            variant="outline"
            className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10"
            onClick={() => confirm("Are you sure you want to delete your account? This action is permanent.") && alert("Account deletion requested.")}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
