import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function fetchWithBackoff(url, options, retries = 3, backoff = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithBackoff(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export async function POST(request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check Daily Limit
  const today = new Date().toISOString().split('T')[0];
  const { data: stats } = await supabase
    .from('daily_stats')
    .select('scan_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (stats && stats.scan_count >= 3) {
    return NextResponse.json({ error: 'Daily scan limit reached (3/3)' }, { status: 429 });
  }

  try {
    const { base64Data, mimeType } = await request.json();

    const prompt = `Identify the food in this image and provide a calorie estimate AND macronutrients (protein, carbs, fats in grams) for the serving size shown. Return ONLY raw JSON in this format: { "foodItem": "Food Name", "calories": number, "protein": number, "carbs": number, "fats": number }. If it's not food, return { "foodItem": "Unknown", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }. Do not include markdown formatting or backticks.`;

    const response = await fetchWithBackoff(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data } }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanText);

      // Increment Usage
      if (stats) {
        await supabase.from('daily_stats').update({ scan_count: (stats.scan_count || 0) + 1 }).eq('user_id', user.id).eq('date', today);
      } else {
        await supabase.from('daily_stats').insert({ user_id: user.id, date: today, scan_count: 1 });
      }

      return NextResponse.json(json);
    }
    
    return NextResponse.json({ error: "Could not analyze image" }, { status: 400 });
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
