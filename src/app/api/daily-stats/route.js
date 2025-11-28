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
  const range = searchParams.get('range'); // 'week', 'month'

  let query = supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id);

  if (date) {
    query = query.eq('date', date).single();
  } else if (range === 'month') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0]).order('date', { ascending: true });
  } else {
    // Default to today if no params, or handle as needed
    const today = new Date().toISOString().split('T')[0];
    query = query.eq('date', today).single();
  }

  const { data, error } = await query;

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" for single()
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || (date ? { water_intake: 0, weight: null } : []));
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { date, water_intake, weight } = body;

  // Upsert
  const { data, error } = await supabase
    .from('daily_stats')
    .upsert({ 
      user_id: user.id, 
      date: date,
      ...(water_intake !== undefined && { water_intake }),
      ...(weight !== undefined && { weight })
    }, { onConflict: 'user_id, date' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
