import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const moodDir = path.join(process.cwd(), 'public', 'mood');
  const tiers = ['0-2', '3-5', '6-7', '8-10'];
  
  let result = {
    '0-2': [],
    '3-5': [],
    '6-7': [],
    '8-10': []
  };

  try {
    if (fs.existsSync(moodDir)) {
      for (const tier of tiers) {
        const tierPath = path.join(moodDir, tier);
        if (fs.existsSync(tierPath)) {
          const files = fs.readdirSync(tierPath);
          // Filter out non-image files if necessary, but returning all is fine
          // just filter common image extensions
          const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
          result[tier] = images;
        }
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error reading mood images directory:", error);
    return NextResponse.json(result, { status: 500 });
  }
}
