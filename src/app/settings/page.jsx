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
  Globe,
  Shield,
  LogOut,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
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

    // 3. Move and Show persistent Google Translate widget
    const persistentWidget = document.getElementById('google_translate_element');
    const anchor = document.getElementById('google_translate_anchor');

    if (persistentWidget && anchor) {
      anchor.appendChild(persistentWidget);
      persistentWidget.style.display = 'block';
    }

    return () => {
      // Hide and move back to body on unmount
      if (persistentWidget) {
        persistentWidget.style.display = 'none';
        document.body.appendChild(persistentWidget);
      }
    };
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
        <style jsx global>{`
          .goog-te-gadget-simple {
            background-color: transparent !important;
            border: none !important;
            padding: 0 !important;
            font-size: 14px !important;
            font-family: inherit !important;
            display: flex !important;
            align-items: center !important;
            cursor: pointer !important;
          }
          .goog-te-gadget-simple img {
            display: none !important;
          }
          .goog-te-menu-value {
            margin: 0 !important;
            color: inherit !important;
            display: flex !important;
            align-items: center !important;
            gap: 4px;
          }
          .goog-te-menu-value span {
            color: inherit !important;
          }
          .goog-te-menu-value:after {
            content: '▾';
            margin-left: 4px;
            opacity: 0.5;
          }
          .goog-te-gadget-simple .goog-te-menu-value span:nth-child(3),
          .goog-te-gadget-simple .goog-te-menu-value span:nth-child(5) {
            display: none !important;
          }
          /* 隐藏顶部的 Google 翻译横幅 */
          iframe.goog-te-banner-frame,
          .goog-te-banner-frame {
            display: none !important;
          }
          
          /* 隐藏鼠标悬停时的原始文字提示框 */
          #goog-gt-tt, 
          .goog-te-balloon-frame {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* 修复页面偏移 */
          body {
            top: 0 !important;
            position: static !important;
          }

          /* 确保下拉框组件本身是可见且可点击的 */
          #google_translate_element {
            display: block !important;
          }
          
          /* 针对简单的 gadget 样式进行优化 */
          .goog-te-gadget-simple {
            background-color: #f8fafc !important; /* bg-slate-50 */
            border: 1px solid #e2e8f0 !important; /* border-slate-200 */
            padding: 8px 16px !important;
            border-radius: 9999px !important;
            display: flex !important;
            align-items: center !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
          }
          .dark .goog-te-gadget-simple {
            background-color: #1e293b !important; /* bg-slate-800 */
            border-color: #334155 !important; /* border-slate-700 */
            color: white !important;
          }
          .goog-te-gadget-simple:hover {
            border-color: #7c3aed !important; /* border-primary */
            background-color: #f1f5f9 !important;
          }
          .dark .goog-te-gadget-simple:hover {
            background-color: #334155 !important;
          }
        `}</style>
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
                  <Globe className="h-4 w-4 text-primary" /> Language
                </Label>
                <p className="text-sm text-muted-foreground">
                  Preferred language for the interface
                </p>
              </div>
              <div
                id="google_translate_anchor"
                className="min-h-[40px] flex items-center justify-center transition-colors cursor-pointer group text-sm font-medium text-foreground"
              >
                {/* The persistent widget will be appended here via useEffect */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
