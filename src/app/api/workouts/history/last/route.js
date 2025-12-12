import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exerciseName = searchParams.get('exercise');

  if (!exerciseName) {
    return NextResponse.json({ error: 'Exercise name required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, workout_sessions!inner(status)')
    .eq('user_id', user.id)
    .eq('exercise_name', exerciseName)
    .eq('workout_sessions.status', 'completed')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}
