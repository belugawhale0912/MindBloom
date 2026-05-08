import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('date', { ascending: false });

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

    const entryToInsert = {
      content: newEntry.content,
      date: newEntry.date || new Date().toISOString(),
      mood: newEntry.mood,
      user_id: DEMO_USER_ID
    };

    const { data, error } = await supabase
      .from('journal_entries')
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

export async function PATCH(request) {
  try {
    const { id, is_collected, content } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
    }

    const updates = {};
    if (is_collected !== undefined) updates.is_collected = is_collected;
    if (content !== undefined) updates.content = content;

    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', DEMO_USER_ID)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Supabase PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
