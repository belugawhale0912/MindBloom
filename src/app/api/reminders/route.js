import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const db = JSON.parse(fileContent);
    if (!db.reminders) {
      db.reminders = [
        { id: 1, title: "Morning Check-in", time: "08:00", active: true, icon: "Sunrise", color: "text-orange-500", freq: "Daily" },
        { id: 2, title: "Midday Mood Log", time: "12:30", active: false, icon: "SunMedium", color: "text-amber-500", freq: "Weekdays" },
        { id: 3, title: "Evening Reflection", time: "20:00", active: true, icon: "Moon", color: "text-indigo-500", freq: "Daily" },
        { id: 4, title: "Take a Break", time: "15:00", active: false, icon: "Coffee", color: "text-brown-500", freq: "Custom" }
      ];
      await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.reminders);
}

export async function POST(request) {
  const updatedReminders = await request.json();
  console.log(`[API] Received POST request. New reminders count: ${updatedReminders.length}`);
  const db = await getDb();
  db.reminders = updatedReminders;
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  console.log(`[API] Sync successful. Data written to ${dataFilePath}`);
  return NextResponse.json({ success: true });
}
