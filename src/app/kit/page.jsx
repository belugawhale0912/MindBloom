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
  Image as ImageIcon,
  X,
  Loader2,
  Pin
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import MediaViewer from "@/components/media-viewer";

export default function CalmKit() {
  const [notes, setNotes] = useState([]);
  const [items, setItems] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: "", description: "", type: "video", file: null });
  const [viewerItem, setViewerItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  // Keep a live ref so drag handlers always see the current type
  const newItemDataRef = useRef(newItemData);
  useEffect(() => { newItemDataRef.current = newItemData; }, [newItemData]);


  useEffect(() => {
    fetch("/api/kit")
      .then(res => res.json())
      .then(data => setNotes(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch("/api/kit/items")
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewItemData({ ...newItemData, file: e.target.files[0] });
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Use the live ref so we always read the current type, not a stale closure
    const currentType = newItemDataRef.current.type;
    const isVideo = currentType === "video";
    const isPhoto = currentType === "photo";
    if ((isVideo && file.type.startsWith("video/")) || (isPhoto && file.type.startsWith("image/"))) {
      setNewItemData((prev) => ({ ...prev, file }));
    }
  }, []);

  const handleAddItem = async () => {
    if (!newItemData.title.trim() && !newItemData.file) return;

    setIsUploading(true);
    try {
      let finalData = { ...newItemData };

      // Handle file upload first if needed
      if (newItemData.file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', newItemData.file);
        uploadFormData.append('type', newItemData.type);

        const uploadRes = await fetch("/api/kit/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalData.url = url;
          // If title is empty, use filename
          if (!finalData.title) finalData.title = newItemData.file.name;
        } else {
          throw new Error("File upload failed");
        }
      }

      const res = await fetch("/api/kit/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalData.title,
          description: finalData.description,
          type: finalData.type,
          url: finalData.url
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setItems([...items, result]);
        setIsAddingItem(false);
        setNewItemData({ title: "", description: "", type: "video", file: null });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
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

  const handleDeleteNote = async (id) => {
    try {
      await fetch("/api/kit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotes(notes.filter(note => note.id !== id));
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out pb-32 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-heading font-black text-foreground tracking-tight">
            My Calm Kit <span className="text-primary italic">🧺</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl">
            Your confort zone with your favorite videos, photos, and quotes.
          </p>
        </div>
      </div>


      {/* Saved Videos */}
      <section className="space-y-6">
        <h3 className="font-heading font-bold text-xl flex items-center gap-3 text-indigo-500/80">
          <PlaySquare className="h-6 w-6" /> My Peace Sanctuary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.filter(item => item.type === "video").map(item => (
            <div key={item.id} className="group relative rounded-3xl overflow-hidden cursor-pointer" onClick={() => setViewerItem(item)}>
              <div className="aspect-video bg-muted relative overflow-hidden ring-1 ring-border/50 group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                {item.url ? (
                  <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                    <PlaySquare className="h-10 w-10 text-indigo-500/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 scale-90 group-hover:scale-100 transition-transform">
                    <PlaySquare className="h-7 w-7 text-white fill-white/20" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 hover:text-white bg-black/20 hover:bg-destructive h-9 w-9 rounded-full backdrop-blur-sm transition-all"
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 px-1">
                <h4 className="font-bold text-base text-foreground group-hover:text-indigo-500 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1 opacity-80 uppercase text-[10px] font-bold tracking-widest leading-none">
                  {item.description || "Video Memory"}
                </p>
              </div>
            </div>
          ))}
          {items.filter(item => item.type === "video").length === 0 && (
            <div className="col-span-full py-16 border-2 border-dashed border-border/50 rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 group hover:border-indigo-500/20 transition-colors">
              <PlaySquare className="h-12 w-12 mb-4 opacity-10 group-hover:opacity-30 transition-opacity" />
              <p className="text-sm font-medium tracking-tight">Your peace sanctuary is waiting.</p>
            </div>
          )}
        </div>
      </section>

      {/* Favorite Photos */}
      <section className="space-y-6">
        <h3 className="font-heading font-bold text-xl flex items-center gap-3 text-emerald-500/80">
          <ImageIcon className="h-6 w-6" /> My Favourtie Photos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.filter(item => item.type === "photo").map(item => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-[2rem] overflow-hidden ring-1 ring-border/50 hover:ring-emerald-500/40 hover:shadow-2xl transition-all duration-700 cursor-zoom-in group"
              onClick={() => setViewerItem(item)}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-[10s] ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <p className="text-[11px] text-white font-bold truncate tracking-wide">{item.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 hover:bg-destructive text-white h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm transition-all"
                onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.filter(item => item.type === "photo").length === 0 && (
            <div className="col-span-full py-16 border-2 border-dashed border-border/50 rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 group hover:border-emerald-500/20 transition-colors">
              <ImageIcon className="h-12 w-12 mb-4 opacity-10 group-hover:opacity-30 transition-opacity" />
              <p className="text-sm font-medium tracking-tight">Your visual sanctuary is waiting.</p>
            </div>
          )}
        </div>
      </section>

      {/* Notes to Self — Corkboard */}
      <section className="space-y-6 pt-8 border-t border-border/50">
        <h3 className="font-heading font-bold text-2xl flex items-center gap-3">
          <StickyNote className="h-7 w-7 text-amber-500" /> Notes to Self
        </h3>

        {/* Corkboard */}
        <div
          className="relative rounded-[2.5rem] p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, hsl(var(--muted)/0.6) 0%, hsl(var(--card)/0.8) 100%)",
            boxShadow: "inset 0 2px 12px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid hsl(var(--border)/0.4)",
          }}
        >
          {notes.length === 0 && (
            <div className="py-14 flex flex-col items-center justify-center text-muted-foreground/50 gap-3">
              <Pin className="h-8 w-8 opacity-20" />
              <p className="text-sm font-medium">Your corkboard is empty — pin something kind to yourself.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, idx) => {
              const pinColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
              const noteColors = [
                'hsl(48 96% 96%)',
                'hsl(210 100% 97%)',
                'hsl(142 76% 96%)',
                'hsl(280 100% 97%)',
                'hsl(0 86% 97%)',
              ];
              const pin = pinColors[idx % pinColors.length];
              const bg = noteColors[idx % noteColors.length];
              const rotate = (idx % 2 === 0 ? -1 : 1) * (1 + (idx % 3) * 0.5);
              return (
                <div
                  key={note.id}
                  className="relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ transform: `rotate(${rotate}deg)` }}
                >
                  {/* Pin */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-md border-2 border-white/60 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: pin }}
                    />
                    <div className="w-0.5 h-3 bg-black/20" />
                  </div>

                  <div
                    className="rounded-2xl p-6 pt-8 pb-10 shadow-md"
                    style={{ backgroundColor: bg }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all h-7 w-7 rounded-full"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <p className="font-medium text-base text-zinc-800 italic leading-relaxed">
                      &ldquo;{note.content}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {note.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-6 group">
          <Textarea
            placeholder="Write a gentle nudge to your future self..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            disabled={isSaving}
            className="min-h-[160px] text-lg resize-none p-8 pb-20 bg-card rounded-[2.5rem] border-border/50 focus-visible:ring-primary/20 shadow-inner group-hover:border-primary/20 transition-all duration-500"
          />
          <div className="absolute bottom-6 right-8">
            <Button
              size="lg"
              className="rounded-full shadow-2xl h-12 px-8 font-bold transition-transform hover:-translate-y-1 active:scale-95"
              onClick={handleSaveNote}
              disabled={isSaving || !newNoteText.trim()}
            >
              <Save className="h-5 w-5 mr-2" /> {isSaving ? "Whispering..." : "Save Note"}
            </Button>
          </div>
        </div>
      </section>

      {/* Modal: Add to Kit */}
      {isAddingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border-border/50 rounded-[3rem] animate-in zoom-in-95 duration-300">
            <CardContent className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold font-heading">Add to Sanctuary</h3>
                  <p className="text-sm text-muted-foreground mt-1">Select the type of peace you'd like to preserve.</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => setIsAddingItem(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex p-1.5 bg-secondary/50 rounded-[2rem] gap-1">
                {["video", "photo"].map((type) => (
                  <Button
                    key={type}
                    variant={newItemData.type === type ? "default" : "ghost"}
                    className={cn(
                      "flex-1 rounded-[1.5rem] font-bold text-xs h-12 uppercase tracking-widest",
                      newItemData.type === type ? "shadow-lg" : "hover:bg-background/50"
                    )}
                    onClick={() => setNewItemData({ ...newItemData, type })}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground/80">Title</label>
                  <input
                    placeholder="Give this a meaningful name..."
                    className="w-full text-base border-border/50 bg-background/40 hover:bg-background/80 transition-colors p-4 rounded-2xl outline-none ring-primary/10 focus:ring-4 border"
                    value={newItemData.title}
                    onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all duration-300 group/drop",
                      isDragging
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border/80 hover:bg-primary/5 hover:border-primary/20"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept={newItemData.type === "video" ? "video/*" : "image/*"}
                      onChange={handleFileChange}
                    />
                    {newItemData.file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-primary/10 p-4 rounded-full text-primary">
                          {newItemData.type === "video" ? <PlaySquare className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                        </div>
                        <span className="text-sm font-bold truncate max-w-[200px]">{newItemData.file.name}</span>
                        <span className="text-[10px] text-muted-foreground">Click to change file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-muted p-4 rounded-full group-hover/drop:bg-primary/10 group-hover/drop:text-primary transition-all duration-300">
                          <Plus className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Choose your {newItemData.type} file</p>
                          <p className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Drag & Drop or Browse</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground/80">Description/Source</label>
                    <input
                      placeholder="Add a note or memory about this item..."
                      className="w-full text-base border-border/50 bg-background/40 hover:bg-background/80 transition-colors p-4 rounded-2xl outline-none ring-primary/10 focus:ring-4 border"
                      value={newItemData.description}
                      onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full h-16 rounded-[1.8rem] text-lg font-bold shadow-2xl transition-transform hover:-translate-y-1 active:scale-95" onClick={handleAddItem} disabled={isUploading || (!newItemData.title.trim() && !newItemData.file)}>
                {isUploading ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Uploading...</>
                ) : newItemData.file ? 'Begin Upload' : 'Confirm & Add'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lightbox: Media Viewer */}
      {viewerItem && (
        <MediaViewer
          item={viewerItem}
          allItems={items.filter(i => i.type === "photo" || i.type === "video")}
          onClose={() => setViewerItem(null)}
          onNavigate={setViewerItem}
        />
      )}

      {/* Floating Add Button */}
      {!isAddingItem && (
        <Button
          className="fixed bottom-10 right-10 rounded-full h-20 w-20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-primary/30 hover:-translate-y-2 transition-all group z-50 p-0"
          onClick={() => setIsAddingItem(true)}
        >
          <Plus className="h-10 w-10 transition-transform group-hover:rotate-90 duration-500" />
        </Button>
      )}
    </div>
  );
}

