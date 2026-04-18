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
import { cn } from "@/lib/utils";

export default function CalmKit() {
  const [notes, setNotes] = useState([]);
  const [items, setItems] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: "", description: "", type: "technique", file: null });
  const [viewerItem, setViewerItem] = useState(null); // Full-screen Lightbox item
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out pb-32 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-heading font-black text-foreground tracking-tight">
            My Calm Kit <span className="text-primary italic">🧺</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl">
            A hand-picked selection of your favorite breathing techniques, sights, sounds, and gentle reminders.
          </p>
        </div>
      </div>

      {/* Saved Techniques */}
      <section className="space-y-6">
        <h3 className="font-heading font-bold text-xl flex items-center gap-3 text-primary/80">
          <Bookmark className="h-6 w-6" /> My Saved Techniques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.filter(item => item.type === "technique").map(item => (
            <Card key={item.id} className="border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer bg-card group relative overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="bg-primary/5 text-primary p-4 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 scale-100 group-hover:scale-110">
                  <Wind className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/5 transition-all h-8 w-8 rounded-full" 
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {items.filter(item => item.type === "technique").length === 0 && (
            <div className="col-span-full py-12 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5 group hover:border-primary/20 transition-colors">
              <Wind className="h-10 w-10 mb-3 opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-sm font-medium">No techniques saved yet.</p>
            </div>
          )}
        </div>
      </section>

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
        </div>
      </section>

      {/* Favorite Photos */}
      <section className="space-y-6">
        <h3 className="font-heading font-bold text-xl flex items-center gap-3 text-emerald-500/80">
          <ImageIcon className="h-6 w-6" /> Visual Breathing
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
                style={{ animation: 'gentle-breathing 8s ease-in-out infinite' }}
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

      {/* Notes to Self (Modern Board) */}
      <section className="space-y-6 pt-8 border-t border-border/50">
        <h3 className="font-heading font-bold text-2xl flex items-center gap-3">
          <StickyNote className="h-7 w-7 text-amber-500" /> Notes to Self
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, idx) => (
            <Card 
              key={note.id} 
              className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden bg-card/60 backdrop-blur-sm rounded-[2rem] group"
            >
              <CardContent className="p-8 pb-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/5 transition-all h-8 w-8 rounded-full" 
                  onClick={() => handleDeleteNote(note.id)}
                >
                   <Trash2 className="h-4 w-4" />
                </Button>
                <div 
                  className="w-8 h-1 rounded-full mb-6 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: idx % 3 === 0 ? '#fbbf24' : idx % 3 === 1 ? '#38bdf8' : '#4ade80' }}
                />
                <p className="font-medium text-lg text-foreground italic leading-relaxed">
                  "{note.content}"
                </p>
                <div className="absolute bottom-6 left-8 flex items-center gap-1.5 opacity-40 group-hover:opacity-80 transition-all font-bold tracking-tighter text-[10px] uppercase">
                  <Clock className="w-3 h-3" />
                  {note.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mt-8 group">
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
                   {["technique", "video", "photo"].map((type) => (
                     <Button 
                       key={type}
                       variant={newItemData.type === type ? "default" : "ghost"} 
                       className={cn(
                        "flex-1 rounded-[1.5rem] font-bold text-xs h-12 uppercase tracking-widest",
                        newItemData.type === type ? "shadow-lg" : "hover:bg-background/50"
                       )}
                       onClick={() => setNewItemData({...newItemData, type})}
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
                       onChange={(e) => setNewItemData({...newItemData, title: e.target.value})}
                     />
                   </div>
                   
                   {newItemData.type === "technique" ? (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground/80">Description</label>
                        <input 
                          placeholder="What makes this technique helpful?" 
                          className="w-full text-base border-border/50 bg-background/40 hover:bg-background/80 transition-colors p-4 rounded-2xl outline-none ring-primary/10 focus:ring-4 border" 
                          value={newItemData.description}
                          onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                        />
                     </div>
                   ) : (
                     <div className="space-y-4">
                       <div 
                         className="border-2 border-dashed border-border/80 rounded-[2.5rem] p-10 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 group/drop"
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
                            onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                          />
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <Button size="lg" className="w-full h-16 rounded-[1.8rem] text-lg font-bold shadow-2xl transition-transform hover:-translate-y-1 active:scale-95" onClick={handleAddItem} disabled={!newItemData.title.trim() && !newItemData.file}>
                    {newItemData.file ? 'Begin Upload' : 'Confirm & Add'}
                 </Button>
              </CardContent>
           </Card>
        </div>
      )}

      {/* Lightbox: Media Viewer */}
      {viewerItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12 animate-in fade-in duration-500">
           <Button 
             variant="ghost" 
             size="icon" 
             className="absolute top-6 right-6 z-[210] text-white/60 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
             onClick={() => setViewerItem(null)}
           >
              <X className="h-8 w-8" />
           </Button>

           <div className="w-full h-full max-w-6xl flex flex-col items-center justify-center gap-8 group/viewer">
              <div className="relative w-full flex-1 flex items-center justify-center animate-in zoom-in-95 duration-500">
                {viewerItem.type === "video" ? (
                  <video 
                    src={viewerItem.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full max-h-[70vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)]" 
                  />
                ) : (
                  <img 
                    src={viewerItem.url} 
                    alt={viewerItem.title} 
                    className="w-full h-full max-h-[70vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105" 
                  />
                )}
              </div>
              
              <div className="text-center space-y-2 max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-3xl font-heading font-black text-white tracking-tight">{viewerItem.title}</h3>
                <p className="text-zinc-400 text-lg italic">{viewerItem.description || "A peaceful moment preserved."}</p>
                <div className="h-1 w-12 bg-primary mx-auto mt-6 rounded-full opacity-60" />
              </div>
           </div>
        </div>
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

