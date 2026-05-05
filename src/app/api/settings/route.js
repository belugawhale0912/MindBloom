import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    // Try to get settings for Emily
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

    // Default settings if none found
    if (!data) {
      return NextResponse.json({
        name: "User",
        dark_mode: false,
        notifications: true,
        language: "English (US)"
      });
    }

    // Map database fields back to frontend names if needed
    return NextResponse.json({
      name: data.name,
      darkMode: data.dark_mode,
      notifications: data.notifications,
      language: data.language
    });
  } catch (error) {
    console.error('Supabase GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newSettings = await request.json();

    // Map frontend fields to database names
    const settingsToUpsert = {
      name: newSettings.name,
      dark_mode: newSettings.darkMode,
      notifications: newSettings.notifications,
      language: newSettings.language,
      user_id: DEMO_USER_ID
    };

    const { data, error } = await supabase
      .from('settings')
      .upsert([settingsToUpsert], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      name: data.name,
      darkMode: data.dark_mode,
      notifications: data.notifications,
      language: data.language
    });
  } catch (error) {
    console.error('Supabase POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
