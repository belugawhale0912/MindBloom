import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', DEMO_USER_ID);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Map frontend fields to snake_case if they exist in updates
    const mappedUpdates = { ...updates };
    if (updates.detailedScore !== undefined) {
      mappedUpdates.detailed_score = updates.detailedScore;
      delete mappedUpdates.detailedScore;
    }
    if (updates.isLocked !== undefined) {
      mappedUpdates.is_locked = updates.isLocked;
      delete mappedUpdates.isLocked;
    }
    if (updates.secureNote !== undefined) {
      mappedUpdates.secure_note = updates.secureNote;
      delete mappedUpdates.secureNote;
    }

    const { data, error } = await supabase
      .from('mood_entries')
      .update(mappedUpdates)
      .eq('id', id)
      .eq('user_id', DEMO_USER_ID)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Supabase PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
