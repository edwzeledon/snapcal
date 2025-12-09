import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (date) {
    // Filter by date (start and end of day in UTC)
    // date is expected to be YYYY-MM-DD
    const startISO = `${date}T00:00:00.000Z`;
    const endISO = `${date}T23:59:59.999Z`;
    
    query = query.gte('date', startISO).lte('date', endISO);
  } else if (status) {
    query = query.eq('status', status);
  } else {
    // If no date provided, only return active workouts (for the current session view)
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('workout_logs')
    .insert([
      { 
        user_id: user.id,
        exercise_name: body.exercise,
        category: body.category,
        sets: body.sets || [],
        date: body.date || new Date().toISOString(),
        status: 'active'
      }
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
