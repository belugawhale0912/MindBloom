"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Mic,
  Sparkles,
  HeartHandshake,
  Flame,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = [
  {
    id: "supportive",
    label: "Supportive",
    icon: HeartHandshake,
    color: "text-purple-500",
  },
  { id: "casual", label: "Casual", icon: Coffee, color: "text-blue-500" },
  {
    id: "motivational",
    label: "Motivational",
    icon: Flame,
    color: "text-orange-500",
  },
];



export default function AICompanion() {
  const [activeTone, setActiveTone] = useState("supportive");
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch("/api/companion")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to load messages:", err));
  }, []);

  const handleSend = async () => {
    if (!inputVal.trim() || isSending) return;
    setIsSending(true);

    const newMessage = {
      sender: "user",
      text: inputVal.trim(),
    };

    // Optimistically update UI
    const tempId = Date.now();
    setMessages((prev) => [...prev, { ...newMessage, id: tempId }]);
    setInputVal("");

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => prev.map(m => m.id === tempId ? savedMessage : m));
        
        // Simulate AI response
        setTimeout(async () => {
          const aiRes = {
            sender: "ai",
            text: "I hear you. I'm just a prototype right now, but I'm here to support you in the future!",
          };
          const aiPost = await fetch("/api/companion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aiRes),
          });
          if (aiPost.ok) {
            const savedAiMessage = await aiPost.json();
            setMessages((prev) => [...prev, savedAiMessage]);
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to save message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
        {/* Tone Selector Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-1">
            Companion Tone
          </p>
          <div className="flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0 hide-scrollbar">
            {TONES.map((tone) => {
              const Icon = tone.icon;
              return (
                <button
                  key={tone.id}
                  onClick={() => setActiveTone(tone.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap",
                    activeTone === tone.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/50 text-foreground hover:bg-secondary",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      activeTone === tone.id
                        ? "text-primary-foreground"
                        : tone.color,
                    )}
                  />
                  {tone.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex flex-col mt-auto bg-secondary/30 p-4 rounded-2xl border border-border/50">
            <Sparkles className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-semibold text-foreground">
              AI Memory Active
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your companion remembers your previous check-ins to provide better
              support.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[85%] animate-in slide-in-from-bottom-2 duration-300",
                  msg.sender === "user" ? "ml-auto justify-end" : "",
                )}
              >
                {msg.sender === "ai" && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1 shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={cn(
                    "py-3 px-4 rounded-2xl text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary/70 text-foreground rounded-tl-sm border border-border/40",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/50 border-t border-border/60 backdrop-blur-md">
            <div className="relative flex items-center">
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="pl-4 pr-24 py-6 rounded-full border-border/80 bg-card shadow-sm focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                disabled={isSending}
              />

              <div className="absolute right-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-9 w-9 rounded-full shadow-sm"
                  onClick={handleSend}
                  disabled={isSending || !inputVal.trim()}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              MindBloom is not a substitute for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
