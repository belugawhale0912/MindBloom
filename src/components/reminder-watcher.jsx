"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/toast-custom";

export function ReminderWatcher() {
  const { addToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const remindersRef = useRef([]); // To keep the latest reminders accessible in the interval
  const lastChecked = useRef(""); // To prevent double triggers in the same minute

  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const fetchReminders = async () => {
      try {
        const res = await fetch("/api/reminders");
        const data = await res.json();
        const active = data.filter(r => r.active);
        setReminders(active);
        remindersRef.current = active;
      } catch (err) {
        console.error("Failed to fetch reminders for watcher", err);
      }
    };

    fetchReminders();
    
    // Interval 1: Refresh data every 30s
    const listInterval = setInterval(fetchReminders, 30000);

    // Interval 2: Check time every 15s for higher precision
    const checkInterval = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const isNewMinute = currentTime !== lastChecked.current;
      
      if (isNewMinute) {
        lastChecked.current = currentTime;
      }

      // Emit status update for the debug UI
      window.dispatchEvent(new CustomEvent('mindbloom:watcher-update', {
        detail: {
          currentTime,
          lastChecked: lastChecked.current,
          watchingCount: remindersRef.current.length,
          status: "Active"
        }
      }));

      if (!isNewMinute) return;

      remindersRef.current.forEach((reminder) => {
        // Enforced format HH:mm in data.json makes this simple
        const rTime = reminder.time.trim();
        
        if (rTime === currentTime) {
          console.log(`[MindBloom Watcher] MATCH FOUND! Triggering ${reminder.title}`);
          triggerNotification(reminder);
        }
      });
    }, 15000);

    return () => {
      clearInterval(listInterval);
      clearInterval(checkInterval);
    };
  }, []); 

  const triggerNotification = (reminder) => {
    console.log(`[MindBloom Watcher] Triggering: ${reminder.title}`);
    
    // 1. In-app Toast
    addToast({
      title: "MindBloom Reminder",
      message: reminder.title,
      type: "reminder",
      duration: 10000,
    });


    // 2. Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("MindBloom Reminder", {
        body: reminder.title,
        icon: "/favicon.ico",
      });
    }

    // 3. Play a subtle, programmatically generated Zen chime
    const playZenChime = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        
        // Create multiple oscillators for a richer chime sound
        const frequencies = [880, 1318.51, 1760]; // A5, E6, A6
        
        frequencies.forEach((freq, i) => {
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
      } catch (error) {
        console.log("Audio feedback could not be played:", error);
      }
    };

    playZenChime();
  };

  return null; // This component doesn't render anything
}
