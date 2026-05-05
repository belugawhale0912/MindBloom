import { NextResponse } from 'next/server';
import { supabase, DEMO_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('assessments')
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
    const newAssessment = await request.json();

    const entryToInsert = {
      type: newAssessment.type,
      date: newAssessment.date || new Date().toISOString(),
      score: newAssessment.score,
      total_score: newAssessment.totalScore, // totalScore -> total_score
      question_count: newAssessment.questionCount, // questionCount -> question_count
      severity: newAssessment.severity,
      answers: newAssessment.answers || [],
      user_id: DEMO_USER_ID
    };

    const { data, error } = await supabase
      .from('assessments')
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
