"use client";

import { Sparkles } from "lucide-react";

const BOTPRESS_WEBCHAT_SRC =
  "https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/04/03/07/20260403075311-1UCF1L3N.json";

export default function AICompanion() {
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] min-h-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-secondary/25 p-4 text-sm text-muted-foreground">
        <Sparkles className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <p>
          Your live companion chat opens below. Avoid sharing sensitive personal
          information if you are not comfortable doing so.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col rounded-3xl border border-border/60 shadow-sm overflow-hidden bg-card">
        <iframe
          title="AI Companion chat"
          src={BOTPRESS_WEBCHAT_SRC}
          className="h-full w-full min-h-[400px] border-0 bg-background"
          allow="microphone; autoplay; clipboard-write"
        />
      </div>

      <p className="text-[10px] text-center text-muted-foreground shrink-0">
        MindBloom is not a substitute for professional mental health care.
      </p>
    </div>
  );
}
