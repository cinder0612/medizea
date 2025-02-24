import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabase-admin';

const CREDITS_PER_MINUTE = 10;

export async function POST(req: Request) {
  try {
    // Get user from session
    const supabase = createRouteHandlerClient({ cookies: () => headers().getAll() });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's available credits and minutes
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('available_credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    if (!credits || credits.available_credits < CREDITS_PER_MINUTE) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Get current minutes
    const { data: minutes, error: minutesError } = await supabaseAdmin
      .from('user_meditation_minutes')
      .select('available_minutes, total_minutes')
      .eq('user_id', user.id)
      .single();

    if (minutesError) {
      console.error('Error fetching minutes:', minutesError);
      return NextResponse.json({ error: 'Failed to fetch minutes' }, { status: 500 });
    }

    // Calculate new values after spending credits
    const newAvailableCredits = credits.available_credits - CREDITS_PER_MINUTE;
    const newAvailableMinutes = (minutes?.available_minutes || 0) - 1;
    const newTotalMinutes = (minutes?.total_minutes || 0) + 1; // Increment total used minutes

    // Update credits
    const { error: updateCreditsError } = await supabaseAdmin
      .from('user_credits')
      .update({ available_credits: newAvailableCredits })
      .eq('user_id', user.id);

    if (updateCreditsError) {
      console.error('Error updating credits:', updateCreditsError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // Update minutes
    const { error: updateMinutesError } = await supabaseAdmin
      .from('user_meditation_minutes')
      .update({
        available_minutes: newAvailableMinutes,
        total_minutes: newTotalMinutes
      })
      .eq('user_id', user.id);

    if (updateMinutesError) {
      console.error('Error updating minutes:', updateMinutesError);
      return NextResponse.json({ error: 'Failed to update minutes' }, { status: 500 });
    }

    console.log('Generated meditation:', {
      userId: user.id,
      creditsSpent: CREDITS_PER_MINUTE,
      newAvailableCredits,
      newAvailableMinutes,
      newTotalMinutes
    });

    // TODO: Add your meditation generation logic here
    
    return NextResponse.json({
      success: true,
      availableCredits: newAvailableCredits,
      availableMinutes: newAvailableMinutes,
      totalMinutesUsed: newTotalMinutes
    });
  } catch (error) {
    console.error('Error generating meditation:', error);
    return NextResponse.json(
      { error: 'Failed to generate meditation' },
      { status: 500 }
    );
  }
}
