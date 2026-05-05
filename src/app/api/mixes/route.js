import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('mixes')
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
    const newMix = await request.json();

    const entryToInsert = {
      name: newMix.name,
      volumes: newMix.volumes || {},
      timestamp: newMix.timestamp || new Date().toISOString(),
      user_id: DEMO_USER_ID
    };

    const { data, error } = await supabase
      .from('mixes')
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing mix id" }, { status: 400 });
    }

    const { error } = await supabase
      .from('mixes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
