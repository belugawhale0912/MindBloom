"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Sunrise, SunMedium, Moon, Coffee, Trash2, Pencil, Check, X, Bell, Heart, Smile, Zap, Activity, BookOpen, Music, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast-custom";

const ICON_MAP = {
  Clock,
  Sunrise,
  SunMedium,
  Moon,
  Coffee,
  Bell,
  Heart,
  Smile,
  Zap,
  Activity,
  BookOpen,
  Music,
  Sparkles,
};

const ICON_COLORS = {
  Clock: "text-primary",
  Sunrise: "text-orange-500",
  SunMedium: "text-amber-500",
  Moon: "text-indigo-500",
  Coffee: "text-brown-500",
  Bell: "text-yellow-500",
  Heart: "text-red-500",
  Smile: "text-green-500",
  Zap: "text-blue-500",
  Activity: "text-rose-500",
  BookOpen: "text-emerald-500",
  Music: "text-violet-500",
  Sparkles: "text-cyan-500",
};

export default function Reminders() {
  const { addToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderIcon, setNewReminderIcon] = useState("Clock");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editFreq, setEditFreq] = useState("Daily");
  const [editIcon, setEditIcon] = useState("Clock");
  const [reminderToDelete, setReminderToDelete] = useState(null);

  const fetchReminders = () => {
    fetch("/api/reminders")
      .then(res => res.json())
      .then(data => {
        setReminders(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchReminders();
    
    // Listen for manual updates from the Reminders page
    window.addEventListener('mindbloom:reminders-updated', fetchReminders);
    
    // Interval 1: Refresh data every 20s (fallback)
    const listInterval = setInterval(fetchReminders, 20000);
    
    return () => {
      window.removeEventListener('mindbloom:reminders-updated', fetchReminders);
      clearInterval(listInterval);
    };
  }, []);

  const saveReminders = async (updated, successMessage = null) => {
    const previousReminders = [...reminders];
    setReminders(updated);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      
      if (!res.ok) throw new Error("Failed to save");

      if (successMessage) {
        addToast({ title: "Success", message: successMessage, type: "success" });
        // Notify the watcher to refresh immediately
        window.dispatchEvent(new CustomEvent('mindbloom:reminders-updated'));
      }
    } catch (err) {
      console.error(err);
      setReminders(previousReminders); // Rollback
      addToast({ title: "Error", message: "Failed to save reminders. Changes rolled back.", type: "error" });
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
    setEditFreq(reminder.freq || "Daily");
    setEditIcon(reminder.icon || "Clock");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const updated = reminders.map((r) =>
      r.id === id ? { 
        ...r, 
        title: editTitle, 
        time: editTime, 
        freq: editFreq, 
        icon: editIcon,
        color: ICON_COLORS[editIcon] || "text-primary"
      } : r
    );
    saveReminders(updated, "Reminder updated");
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (reminderToDelete) {
      const updated = reminders.filter((r) => String(r.id) !== String(reminderToDelete.id));
      saveReminders(updated, "Reminder removed");
      setReminderToDelete(null);
    }
  };

  const [newReminderFreq, setNewReminderFreq] = useState("Daily");

  const handleAddReminder = () => {
    if (!newReminderTitle.trim() || !newReminderTime.trim()) return;
    const newReminder = {
      id: Date.now(),
      title: newReminderTitle,
      time: newReminderTime,
      active: true,
      icon: newReminderIcon,
      color: ICON_COLORS[newReminderIcon] || "text-primary",
      freq: newReminderFreq,
    };
    saveReminders([...reminders, newReminder], "Reminder added");
    setIsAdding(false);
    setNewReminderTitle("");
    setNewReminderTime("");
    setNewReminderFreq("Daily");
    setNewReminderIcon("Clock");
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
          <Button className="rounded-full shadow-sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="mr-2 h-4 w-4" /> {isAdding ? "Cancel" : "Add New Reminder"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="mb-6 bg-primary/5 shadow-sm border-primary/20 animate-in slide-in-from-top-4 duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Reminder Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Morning Meditation" 
                    className="w-full rounded-xl border border-border p-3 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" 
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Select Icon</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-background rounded-xl border border-border/50">
                    {Object.keys(ICON_MAP).map((iconKey) => {
                      const IconNode = ICON_MAP[iconKey];
                      return (
                        <button
                          key={iconKey}
                          onClick={() => setNewReminderIcon(iconKey)}
                          className={`p-2.5 rounded-lg transition-all ${
                            newReminderIcon === iconKey 
                              ? "bg-primary text-primary-foreground shadow-md scale-110" 
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                          title={iconKey}
                        >
                          <IconNode className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Time</label>
                  <input 
                    type="time" 
                    className="w-full rounded-xl border border-border p-3 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" 
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Frequency</label>
                  <select 
                    className="w-full rounded-xl border border-border p-3 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    value={newReminderFreq}
                    onChange={(e) => setNewReminderFreq(e.target.value)}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Once">Once</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-full px-6">
                Cancel
              </Button>
              <Button 
                onClick={handleAddReminder} 
                disabled={!newReminderTitle.trim() || !newReminderTime.trim()}
                className="rounded-full px-8 shadow-lg shadow-primary/20"
              >
                Create Reminder
              </Button>
            </div>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading your reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/10">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
              <Clock className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No reminders yet</h3>
            <p className="text-muted-foreground max-w-xs mt-2 mb-6">
              Create your first reminder to help stay on track with your mindfulness journey.
            </p>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} variant="outline" className="rounded-full">
                <Plus className="mr-2 h-4 w-4" /> Add your first reminder
              </Button>
            )}
          </div>
        ) : (
          reminders.map((reminder) => {
            const Icon = ICON_MAP[reminder.icon] || Clock;
            return (
              <Card
                key={reminder.id}
                className={`border-0 shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:shadow-md ${reminder.active ? "bg-card" : "bg-muted/30"}`}
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  {editingId === reminder.id ? (
                    <div className="flex flex-1 flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 py-2">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Title</label>
                          <input 
                            type="text" 
                            className="w-full rounded-xl border border-border p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Reminder title..."
                          />
                        </div>
                        <div className="md:w-32 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Time</label>
                          <input 
                            type="time" 
                            className="w-full rounded-xl border border-border p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                          />
                        </div>
                        <div className="md:w-32 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Freq</label>
                          <select 
                            className="w-full rounded-xl border border-border p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                            value={editFreq}
                            onChange={(e) => setEditFreq(e.target.value)}
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekdays">Weekdays</option>
                            <option value="Weekends">Weekends</option>
                            <option value="Once">Once</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Icon</label>
                          <div className="flex flex-wrap gap-1.5 p-1.5 bg-background rounded-xl border border-border/50">
                            {Object.keys(ICON_MAP).map((iconKey) => {
                              const IconNode = ICON_MAP[iconKey];
                              return (
                                <button
                                  key={iconKey}
                                  onClick={() => setEditIcon(iconKey)}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    editIcon === iconKey 
                                      ? "bg-primary text-primary-foreground shadow-sm scale-110" 
                                      : "hover:bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <IconNode className="h-4 w-4" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 px-6 shadow-sm" onClick={() => saveEdit(reminder.id)}>
                            <Check className="h-4 w-4 mr-2" /> Save
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full px-6" onClick={cancelEdit}>
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3.5 rounded-2xl ${reminder.active ? "bg-primary/10" : "bg-muted"} transition-colors`}
                        >
                          <Icon
                            className={`h-6 w-6 ${reminder.active ? reminder.color || "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`font-bold text-lg ${reminder.active ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {reminder.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{reminder.time}</span>
                            </div>
                            {reminder.freq && (
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold py-0 h-5 px-2 bg-primary/5 text-primary border-primary/10">
                                {reminder.freq}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full h-9 w-9 transition-colors"
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
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReminderToDelete(reminder);
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
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {reminderToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Remove Reminder?</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{reminderToDelete.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-full"
                    onClick={() => setReminderToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 rounded-full shadow-lg shadow-destructive/20"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

