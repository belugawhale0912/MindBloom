import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const db = JSON.parse(fileContent);
    if (!db.calmKitItems) {
      db.calmKitItems = [
        { id: 1, type: "technique", title: "Box Breathing", description: "Focus & nervous system regulation", icon: "Wind" },
        { id: 2, type: "technique", title: "5-4-3-2-1 Grounding", description: "Anxiety reduction & panic relief", icon: "Wind" },
        { id: 3, type: "video", title: "Gentle Yoga for Tension Relief", description: "Yoga with Adriene", duration: "10:45" },
        { id: 4, type: "video", title: "Guided Sleep Meditation", description: "Great Meditation", duration: "15:20" }
      ];
      await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { calmKitItems: [] };
    }
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.calmKitItems);
}

export async function POST(request) {
  const newItem = await request.json();
  const db = await getDb();
  if (!newItem.id) newItem.id = Date.now();
  db.calmKitItems.push(newItem);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  return NextResponse.json(newItem);
}

export async function DELETE(request) {
  const { id } = await request.json();
  const db = await getDb();
  db.calmKitItems = db.calmKitItems.filter(item => item.id !== id);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  return NextResponse.json({ success: true });
}
