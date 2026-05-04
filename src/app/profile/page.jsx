"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("Alex");
  const [tempName, setTempName] = useState("Alex");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setName(data.name || "Alex");
        setTempName(data.name || "Alex");
      })
      .catch(err => console.error(err));
  }, []);

  const saveSettings = async (updates) => {
    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      // Update the actual name after successful save
      if (updates.name) {
        setName(updates.name);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = () => {
    saveSettings({ name: tempName });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10 max-w-2xl">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          My Profile
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your personal information and how you appear on MindBloom.
        </p>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile Details
          </CardTitle>
          <CardDescription>Manage your public identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center sm:flex-row gap-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-4xl shadow-inner border-4 border-background ring-1 ring-border">
                <User className="h-16 w-16" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">Mindful Journey Member</p>
              <Button variant="outline" size="sm" className="rounded-full mt-2">
                Update Photo
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Display Name</Label>
              <Input
                id="name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="max-w-md rounded-xl h-12 bg-secondary/20 border-border focus:ring-primary/20"
                placeholder="How should we call you?"
              />
            </div>

            <div className="pt-4">
              <Button
                className="rounded-full h-11 px-8 font-semibold shadow-lg shadow-primary/20"
                onClick={handleProfileSave}
                disabled={isSaving || tempName === name}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
