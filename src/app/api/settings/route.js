import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const db = JSON.parse(fileContent);
    if (!db.settings) {
      db.settings = {
        name: "Alex",
        darkMode: false,
        notifications: true,
        language: "English (US)"
      };
      await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { settings: { name: "Alex", darkMode: false } };
    }
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.settings);
}

export async function POST(request) {
  const newSettings = await request.json();
  const db = await getDb();
  db.settings = { ...db.settings, ...newSettings };
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  return NextResponse.json(db.settings);
}
