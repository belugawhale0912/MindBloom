import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const db = JSON.parse(fileContent);
    if (!db.journalEntries) {
      db.journalEntries = [];
      await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { journalEntries: [] };
    }
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.journalEntries);
}

export async function POST(request) {
  const newEntry = await request.json();
  const db = await getDb();
  
  if (!newEntry.id) {
    newEntry.id = Date.now();
  }
  
  db.journalEntries.unshift(newEntry);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  
  return NextResponse.json(newEntry, { status: 201 });
}
