import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('id', { ascending: true });

    if (error) throw error;

    // If no reminders, return empty array
    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Supabase GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const updatedReminders = await request.json();

    if (!Array.isArray(updatedReminders)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Prepare for bulk sync: delete all and re-insert
    // (This matches the current "replace entire array" logic of the data.json implementation)
    // Note: In a production app with multi-user support, you'd filter by user_id.

    // 1. Delete existing
    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .eq('user_id', DEMO_USER_ID);

    if (deleteError) throw deleteError;

    // 2. Insert new
    const remindersToInsert = updatedReminders.map(r => ({
      title: r.title,
      time: r.time,
      active: r.active,
      icon: r.icon,
      color: r.color,
      freq: r.freq,
      user_id: DEMO_USER_ID
    }));

    const { error: insertError } = await supabase
      .from('reminders')
      .insert(remindersToInsert);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase POST Error:', error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
