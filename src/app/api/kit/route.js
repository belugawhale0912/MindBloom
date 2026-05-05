import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kit_notes')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('id', { ascending: false });

    if (error) throw error;

    // Default data if empty
    if (!data || data.length === 0) {
      return NextResponse.json([
        {
          id: 1,
          content: "Remember that productivity doesn't define your worth. It's okay to have rest days. You are doing enough just by being here.",
          date: "Added 2 days ago"
        }
      ]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Supabase GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newNote = await request.json();

    const entryToInsert = {
      content: newNote.content,
      date: newNote.date || "Just now",
      user_id: DEMO_USER_ID
    };

    const { data, error } = await supabase
      .from('kit_notes')
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

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    const { error } = await supabase
      .from('kit_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
