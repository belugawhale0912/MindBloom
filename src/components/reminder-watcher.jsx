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
      // Manual formatting to be 100% sure we get HH:mm even on different locales
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;

      // Debug log (hidden in console)
      console.log(`[MindBloom Watcher] Ticking at ${currentTime}. Watching ${remindersRef.current.length} reminders.`);

      if (currentTime === lastChecked.current) return;
      lastChecked.current = currentTime;

      remindersRef.current.forEach((reminder) => {
        // Normalize reminder time to HH:mm to ensure matches
        let rTime = reminder.time.trim();
        if (rTime.includes(" ")) {
          // If it's something like "8:00 AM", convert it for comparison
          try {
            const [time, modifier] = rTime.split(" ");
            let [hours, minutes] = time.split(":");
            if (hours === "12") hours = "00";
            if (modifier === "PM") hours = parseInt(hours, 10) + 12;
            rTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
          } catch (e) {
            console.error("Format error on reminder time:", rTime);
          }
        } else if (rTime.includes(":")) {
          // Ensure HH:mm format (e.g., "8:00" -> "08:00")
          const [h, m] = rTime.split(":");
          rTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        }

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
  }, []); // Run once on mount and stay alive

  const triggerNotification = (reminder) => {
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
