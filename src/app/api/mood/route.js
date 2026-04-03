import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { moodEntries: [], companionMessages: [] };
    }
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.moodEntries);
}

export async function POST(request) {
  const newEntry = await request.json();
  const db = await getDb();
  
  // Assign a basic ID if missing
  if (!newEntry.id) {
    newEntry.id = Date.now();
  }
  
  db.moodEntries.unshift(newEntry);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  
  return NextResponse.json(newEntry, { status: 201 });
}
