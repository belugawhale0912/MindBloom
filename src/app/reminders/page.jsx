"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Sunrise, SunMedium, Moon, Coffee, Trash2, Pencil, Check, X, Bell } from "lucide-react";
import { useToast } from "@/components/ui/toast-custom";

const ICON_MAP = {
  Sunrise,
  SunMedium,
  Moon,
  Coffee,
};

export default function Reminders() {
  const { addToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    fetch("/api/reminders")
      .then(res => res.json())
      .then(data => setReminders(data))
      .catch(err => console.error(err));
  }, []);

  const saveReminders = async (updated, successMessage = null) => {
    setReminders(updated);
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (successMessage) {
        addToast({ title: "Success", message: successMessage, type: "success" });
      }
    } catch (err) {
      console.error(err);
      addToast({ title: "Error", message: "Failed to save reminders", type: "error" });
    }
  };

  const toggleReminder = (id) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    saveReminders(updated);
  };

  const startEditing = (reminder) => {
    setEditingId(reminder.id);
    setEditTitle(reminder.title);
    setEditTime(reminder.time);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, title: editTitle, time: editTime } : r
    );
    saveReminders(updated, "Reminder updated");
    setEditingId(null);
  };

  const deleteReminder = (id) => {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to remove this reminder?")) {
      // Using string comparison to avoid type mismatch issues
      const updated = reminders.filter((r) => String(r.id) !== String(id));
      
      if (updated.length === reminders.length) {
        console.error("No reminder found with id:", id);
        addToast({ title: "Error", message: "Reminder not found in list", type: "error" });
        return;
      }

      saveReminders(updated, "Reminder removed");
    }
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim() || !newReminderTime.trim()) return;
    const newReminder = {
      id: Date.now(),
      title: newReminderTitle,
      time: newReminderTime,
      active: true,
      icon: "Clock",
      color: "text-primary",
      freq: "Daily",
    };
    saveReminders([...reminders, newReminder], "Reminder added");
    setIsAdding(false);
    setNewReminderTitle("");
    setNewReminderTime("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Reminders
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Set gentle nudges to check in with yourself.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="rounded-full shadow-sm"
            onClick={() => {
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                [880, 1318.51, 1760].forEach((freq, i) => {
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2);
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.start(audioCtx.currentTime + (i * 0.05));
                  osc.stop(audioCtx.currentTime + 2);
                });
                addToast({ title: "Sound Test", message: "If you heard a chime, audio is working!", type: "success" });
              } catch (e) {
                addToast({ title: "Audio Error", message: "Your browser blocked the sound. Try clicking the page first.", type: "error" });
              }
            }}
          >
            <Bell className="mr-2 h-4 w-4" /> Test Sound
          </Button>
          <Button className="rounded-full shadow-sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="mr-2 h-4 w-4" /> {isAdding ? "Cancel" : "Add New Reminder"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="mb-6 bg-secondary/10 shadow-sm border-primary/20">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Reminder Title" 
              className="flex-1 rounded-md border border-border p-2 text-sm bg-background" 
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
            />
            <input 
              type="time" 
              className="rounded-md border border-border p-2 text-sm bg-background w-full md:w-32" 
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
            />
            <Button onClick={handleAddReminder} disabled={!newReminderTitle.trim() || !newReminderTime.trim()}>
              Save
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="bg-primary/5 rounded-2xl p-4 mb-6 border border-primary/10 flex items-center justify-center text-center gap-2">
        <span className="text-lg">🌸</span>
        <p className="text-sm font-medium text-primary">
          Reminders are gentle, not pushy.
        </p>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => {
          const Icon = ICON_MAP[reminder.icon] || Clock;
          return (
            <Card
              key={reminder.id}
              className={`border-0 shadow-sm ring-1 ring-border/50 transition-colors ${reminder.active ? "bg-card" : "bg-muted/30"}`}
            >
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                {editingId === reminder.id ? (
                  <div className="flex flex-1 flex-col md:flex-row gap-3">
                    <input 
                      type="text" 
                      className="flex-1 rounded-md border border-border p-2 text-sm bg-background" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input 
                      type="time" 
                      className="rounded-md border border-border p-2 text-sm bg-background w-full md:w-32" 
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-600 h-8 w-8" onClick={() => saveEdit(reminder.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${reminder.active ? "bg-secondary" : "bg-background"} transition-colors`}
                      >
                        <Icon
                          className={`h-6 w-6 ${reminder.active ? reminder.color : "text-muted-foreground"}`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${reminder.active ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {reminder.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{reminder.time}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${reminder.active ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}
                          >
                            {reminder.freq}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8 relative z-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(reminder);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 relative z-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReminder(reminder.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={reminder.active}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
          Frequency Options
        </h3>
        <div className="flex flex-wrap gap-2">
          {["Daily", "Weekdays", "Weekends", "Custom"].map((freq) => (
            <Badge
              key={freq}
              variant="secondary"
              className="px-4 py-2 text-sm rounded-full font-normal cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border border-transparent hover:border-primary/20"
            >
              {freq}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
