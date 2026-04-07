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
  Maximize2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function CalmKit() {
  const [notes, setNotes] = useState([]);
  const [items, setItems] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: "", description: "", type: "technique", file: null });
  const [expandedVideoId, setExpandedVideoId] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleAddItem = async () => {
    if (!newItemData.title.trim() && !newItemData.file) return;

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
          url: finalData.url,
          icon: finalData.type === "technique" ? "Wind" : null
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setItems([...items, result]);
        setIsAddingItem(false);
        setNewItemData({ title: "", description: "", type: "technique", file: null });
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-24 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            My Calm Kit 🧺
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your personal sanctuary of tools and memories.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.filter(item => item.type === "video").map(item => (
            <div key={item.id} className={`group relative transition-all duration-300 ${expandedVideoId === item.id ? "col-span-full sm:col-span-full" : ""}`}>
               <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 hover:text-white bg-black/20 hover:bg-black/40 h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              
              {expandedVideoId === item.id ? (
                <div className="space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="aspect-video bg-black rounded-3xl overflow-hidden relative group/player">
                     <video src={item.url} controls autoPlay className="w-full h-full object-contain" />
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="absolute top-4 right-12 z-20 bg-black/40 text-white hover:bg-black/60 rounded-full"
                       onClick={() => setExpandedVideoId(null)}
                     >
                       <X className="h-4 w-4" />
                     </Button>
                  </div>
                  <div className="px-2">
                    <h4 className="font-semibold text-lg text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ) : (
                <div 
                  className="cursor-pointer" 
                  onClick={() => setExpandedVideoId(item.id)}
                >
                  <div className="aspect-video bg-secondary/80 rounded-2xl relative overflow-hidden flex items-center justify-center ring-1 ring-border/50 group-hover:ring-indigo-500/50 transition-all">
                    {item.url ? (
                      <video src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <PlaySquare className="h-5 w-5 text-indigo-500 ml-0.5" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                         <Maximize2 className="h-6 w-6 text-white" />
                       </div>
                    </div>
                  </div>
                  <h4 className="font-medium text-sm mt-3 group-hover:text-indigo-500 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                   <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Favorite Photos */}
      <section className="space-y-4">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-emerald-500" /> My Favorite Photos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.filter(item => item.type === "photo").map(item => (
            <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-border/50 hover:ring-emerald-500/50 transition-all cursor-zoom-in">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 hover:text-white bg-black/20 hover:bg-black/40 h-7 w-7 rounded-full" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover transition-all duration-[8s] ease-in-out group-hover:scale-110" 
                style={{ animation: 'gentle-breathing 8s ease-in-out infinite' }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white/90 font-medium truncate">{item.title}</p>
              </div>
            </div>
          ))}
          {items.filter(item => item.type === "photo").length === 0 && (
             <div className="col-span-full py-8 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Add your favorite photos to calm down.</p>
             </div>
          )}
        </div>
      </section>

      {/* Notes to Self */}
      <section className="space-y-4">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-[#FBC02D]" /> My Notes to Self
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note, idx) => (
            <Card 
              key={note.id} 
              className={`border-0 shadow-sm relative group transform transition-transform hover:rotate-0 hover:z-10`}
              style={{
                backgroundColor: idx % 3 === 0 ? '#FFF9C4' : idx % 3 === 1 ? '#E1F5FE' : '#F1F8E9',
                transform: `rotate(${idx % 2 === 0 ? '-1deg' : '1deg'})`,
                color: idx % 3 === 0 ? '#82610A' : idx % 3 === 1 ? '#01579B' : '#33691E'
              }}
            >
              <CardContent className="p-6">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-black/5" onClick={() => handleDeleteNote(note.id)}>
                   <Trash2 className="h-4 w-4" />
                </Button>
                <p className="font-medium mb-4 text-sm whitespace-pre-wrap">
                  "{note.content}"
                </p>
                <p className="text-[10px] opacity-60 italic">
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
        <Card className="fixed bottom-40 right-5 md:bottom-24 md:right-10 z-50 shadow-2xl w-80 animate-in zoom-in-95 duration-200">
           <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Button size="xs" variant={newItemData.type === "technique" ? "default" : "outline"} className="flex-1 text-[10px]" onClick={() => setNewItemData({...newItemData, type: "technique"})}>Technique</Button>
                <Button size="xs" variant={newItemData.type === "video" ? "default" : "outline"} className="flex-1 text-[10px]" onClick={() => setNewItemData({...newItemData, type: "video"})}>Video</Button>
                <Button size="xs" variant={newItemData.type === "photo" ? "default" : "outline"} className="flex-1 text-[10px]" onClick={() => setNewItemData({...newItemData, type: "photo"})}>Photo</Button>
              </div>
              
              <input 
                placeholder="Title (Optional for files)" 
                className="w-full text-sm border p-2 rounded-md" 
                value={newItemData.title}
                onChange={(e) => setNewItemData({...newItemData, title: e.target.value})}
              />
              
              {newItemData.type === "technique" ? (
                <input 
                  placeholder="Description" 
                  className="w-full text-sm border p-2 rounded-md" 
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                />
              ) : (
                <div className="space-y-2">
                  <div 
                    className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:bg-muted/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept={newItemData.type === "video" ? "video/*" : "image/*"}
                      onChange={handleFileChange}
                    />
                    {newItemData.file ? (
                      <span className="text-xs truncate block">{newItemData.file.name}</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Plus className="h-4 w-4 opacity-50" />
                        <span className="text-[10px] text-muted-foreground">Choose {newItemData.type} file</span>
                      </div>
                    )}
                  </div>
                  {newItemData.type === "video" && (
                     <input 
                       placeholder="Author/Source (Optional)" 
                       className="w-full text-[10px] border p-1.5 rounded-md" 
                       value={newItemData.description}
                       onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                     />
                  )}
                </div>
              )}
              
              <Button size="sm" className="w-full" onClick={handleAddItem}>
                 {newItemData.file ? 'Upload & Add' : 'Add to Kit'}
              </Button>
           </CardContent>
        </Card>
      )}
      
      <Button 
        className={`fixed bottom-24 right-5 md:bottom-8 md:right-8 rounded-full h-14 pr-6 pl-4 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 z-50 ${isAddingItem ? "bg-destructive hover:bg-destructive/90" : ""}`}
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
