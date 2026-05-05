import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kit_media')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('id', { ascending: true });

    if (error) throw error;

    // Map database fields to frontend format
    const mappedData = (data || []).map(item => ({
      id: item.id,
      url: item.media_path,
      type: item.media_type,
      title: item.title || (item.media_path ? item.media_path.split('/').pop() : 'Untitled'), // Fallback to filename if title column doesn't exist yet
      description: item.description || ''
    }));

    // Default data if empty (including the hardcoded techniques)
    if (mappedData.length === 0) {
      const defaultItems = [
        { type: "technique", title: "Box Breathing", description: "Focus & nervous system regulation", icon: "Wind" },
        { type: "technique", title: "5-4-3-2-1 Grounding", description: "Anxiety reduction & panic relief", icon: "Wind" }
      ];
      return NextResponse.json(defaultItems);
    }

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Supabase GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newItem = await request.json();

    // Mapping frontend fields to the new kit_media table columns
    const entryToInsert = {
      media_path: newItem.url,
      media_type: newItem.type,
      user_id: DEMO_USER_ID,
      // We still pass title/description in case you add these columns to the table later
      title: newItem.title,
      description: newItem.description
    };

    const { data, error } = await supabase
      .from('kit_media')
      .insert([entryToInsert])
      .select()
      .single();

    if (error) throw error;

    // Return mapped data for frontend
    return NextResponse.json({
      id: data.id,
      url: data.media_path,
      type: data.media_type,
      title: data.title || newItem.title,
      description: data.description || newItem.description
    }, { status: 201 });
  } catch (error) {
    console.error('Supabase POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    const { error } = await supabase
      .from('kit_media')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
