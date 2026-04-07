import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const db = JSON.parse(fileContent);
    if (!db.kitNotes) {
      db.kitNotes = [
        {
          id: 1,
          content: "Remember that productivity doesn't define your worth. It's okay to have rest days. You are doing enough just by being here.",
          date: "Added 2 days ago"
        }
      ];
      await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { kitNotes: [] };
    }
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.kitNotes);
}

export async function POST(request) {
  const newNote = await request.json();
  const db = await getDb();
  
  if (!newNote.id) {
    newNote.id = Date.now();
  }
  
  db.kitNotes.unshift(newNote);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  
  return NextResponse.json(newNote, { status: 201 });
}

export async function DELETE(request) {
  const { id } = await request.json();
  const db = await getDb();
  db.kitNotes = db.kitNotes.filter(note => note.id !== id);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  return NextResponse.json({ success: true });
}
