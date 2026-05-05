import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Supabase GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newEntry = await request.json();

    // Transform frontend data to database schema if needed
    // In our SQL schema, tags is TEXT[], but frontend might send "Category: Impact"
    const entryToInsert = {
      date: newEntry.date,
      time: newEntry.time,
      timestamp: newEntry.timestamp || new Date().toISOString(),
      emoji: newEntry.emoji,
      level: newEntry.level,
      tags: newEntry.tags || [],
      note: newEntry.note,
      detailed_score: newEntry.detailedScore, // detailedScore -> detailed_score
      suggestion: newEntry.suggestion,
      is_locked: newEntry.isLocked, // isLocked -> is_locked
      secure_note: newEntry.secureNote, // secureNote -> secure_note
      pin: newEntry.pin,
      user_id: DEMO_USER_ID
    };

    const { data, error } = await supabase
      .from('mood_entries')
      .insert([entryToInsert])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Supabase POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
