"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Wind,
  Bookmark,
  PlaySquare,
  StickyNote,
  Save,
  Trash2,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function CalmKit() {
  const [notes, setNotes] = useState([]);
  const [items, setItems] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: "", description: "", type: "technique" });

  useEffect(() => {
    fetch("/api/kit")
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error(err));

    fetch("/api/kit/items")
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  }, []);

  const handleAddItem = async () => {
    if (!newItemData.title.trim()) return;
    try {
      const res = await fetch("/api/kit/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemData),
      });
      if (res.ok) {
        const result = await res.json();
        setItems([...items, result]);
        setIsAddingItem(false);
        setNewItemData({ title: "", description: "", type: "technique" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await fetch("/api/kit/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems(items.filter(item => item.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || isSaving) return;
    setIsSaving(true);
    const newNote = {
      content: newNoteText,
      date: `Added just now`,
    };
    try {
      const res = await fetch("/api/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        const saved = await res.json();
        setNotes([saved, ...notes]);
        setNewNoteText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-24 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            My Calm Kit 🧺
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your personal collection of tools and techniques.
          </p>
        </div>
      </div>

      {/* Saved Techniques */}
      <section className="space-y-4">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" /> My Saved Techniques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.filter(item => item.type === "technique").map(item => (
            <Card key={item.id} className="border-0 shadow-sm ring-1 ring-border/50 group hover:ring-primary/40 transition-all cursor-pointer bg-secondary/10 relative">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <Wind className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 hover:text-destructive h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Saved Videos */}
      <section className="space-y-4">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <PlaySquare className="h-5 w-5 text-indigo-500" /> My Saved Videos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.filter(item => item.type === "video").map(item => (
            <div key={item.id} className="group cursor-pointer relative">
               <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 hover:text-white bg-black/20 hover:bg-black/40 h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              <div className="aspect-video bg-secondary/80 rounded-2xl relative overflow-hidden flex items-center justify-center ring-1 ring-border/50 group-hover:ring-indigo-500/50 transition-all">
                <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <PlaySquare className="h-5 w-5 text-indigo-500 ml-0.5" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {item.duration || "5:00"}
                </div>
              </div>
              <h4 className="font-medium text-sm mt-3 group-hover:text-indigo-500 transition-colors line-clamp-1">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Notes to Self */}
      <section className="space-y-4">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-[#FBC02D]" /> My Notes to Self
        </h3>

        <div className="grid gap-4">
          {notes.map(note => (
            <Card key={note.id} className="border-0 shadow-sm bg-[#FFF9C4]/60 ring-1 ring-[#FBC02D]/30 transform -rotate-1 hover:rotate-0 transition-transform">
              <CardContent className="p-6">
                <p className="font-medium text-[#82610A] mb-4 text-sm whitespace-pre-wrap">
                  "{note.content}"
                </p>
                <p className="text-xs text-[#82610A]/60 italic">
                  — {note.date}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mt-6">
          <Textarea
            placeholder="Write a new note to yourself..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            disabled={isSaving}
            className="min-h-[120px] resize-none pb-12 bg-secondary/20 rounded-2xl border-border/50 focus-visible:ring-primary/30"
          />

          <div className="absolute bottom-3 right-3">
            <Button size="sm" className="rounded-full shadow-sm text-xs h-8" onClick={handleSaveNote} disabled={isSaving || !newNoteText.trim()}>
              <Save className="h-3 w-3 mr-1.5" /> {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      {isAddingItem && (
        <Card className="fixed bottom-40 right-5 md:bottom-24 md:right-10 z-30 shadow-2xl w-80 animate-in zoom-in-95 duration-200">
           <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Button size="sm" variant={newItemData.type === "technique" ? "default" : "outline"} className="flex-1" onClick={() => setNewItemData({...newItemData, type: "technique"})}>Technique</Button>
                <Button size="sm" variant={newItemData.type === "video" ? "default" : "outline"} className="flex-1" onClick={() => setNewItemData({...newItemData, type: "video"})}>Video</Button>
              </div>
              <input 
                placeholder="Title" 
                className="w-full text-sm border p-2 rounded-md" 
                value={newItemData.title}
                onChange={(e) => setNewItemData({...newItemData, title: e.target.value})}
              />
              <input 
                placeholder={newItemData.type === "technique" ? "Description" : "Author/Channel"} 
                className="w-full text-sm border p-2 rounded-md" 
                value={newItemData.description}
                onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
              />
              <Button size="sm" className="w-full" onClick={handleAddItem}>Add to Kit</Button>
           </CardContent>
        </Card>
      )}
      <Button 
        className={`fixed bottom-24 right-5 md:bottom-8 md:right-auto md:absolute md:-bottom-2 rounded-full h-14 pr-6 pl-4 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 z-40 ${isAddingItem ? "bg-destructive hover:bg-destructive/90" : ""}`}
        onClick={() => setIsAddingItem(!isAddingItem)}
      >
        <div className="bg-white/20 p-1 rounded-full">
          <Plus className={`h-4 w-4 transition-transform ${isAddingItem ? "rotate-45" : ""}`} />
        </div>
        {isAddingItem ? "Close" : "Add to My Calm Kit"}
      </Button>
    </div>
  );
}
