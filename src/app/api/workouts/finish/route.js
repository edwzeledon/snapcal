import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { ids, duration } = body;

  // 1. Update Logs to Completed
  if (ids && Array.isArray(ids) && ids.length > 0) {
      const { error: logsError } = await supabase
        .from('workout_logs')
        .update({ status: 'completed' }) // Duration is now on session, not log
        .in('id', ids)
        .eq('user_id', user.id);

      if (logsError) {
        return NextResponse.json({ error: logsError.message }, { status: 500 });
      }
  }

  // 2. Close the Active Session
  const { error: sessionError } = await supabase
    .from('workout_sessions')
    .update({ 
        status: 'completed', 
        ended_at: new Date().toISOString(),
        duration_seconds: duration 
    })
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
