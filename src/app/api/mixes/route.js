import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getDb() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const db = JSON.parse(fileContent);
    if (!db.mixes) {
      db.mixes = [];
      await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { mixes: [] };
    }
    throw error;
  }
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.mixes);
}

export async function POST(request) {
  const newMix = await request.json();
  const db = await getDb();
  
  if (!newMix.id) {
    newMix.id = Date.now();
  }
  
  db.mixes.unshift(newMix);
  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));
  
  return NextResponse.json(newMix, { status: 201 });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing mix id" }, { status: 400 });
  }

  const db = await getDb();
  const initialLength = db.mixes.length;

  db.mixes = db.mixes.filter((mix) => String(mix.id) !== String(id));

  if (db.mixes.length === initialLength) {
    return NextResponse.json({ error: "Mix not found" }, { status: 404 });
  }

  await fs.writeFile(dataFilePath, JSON.stringify(db, null, 2));

  return NextResponse.json({ success: true });
}
