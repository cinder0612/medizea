import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { meditationPrompt, musicPrompt, duration } = await req.json()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check subscription
    const { data: subscription, error: subError } = await supabase
      .from('customer_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription check error:', subError)
      return NextResponse.json(
        { error: 'Failed to verify subscription' },
        { status: 500 }
      )
    }

    if (!subscription?.status) {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 402 }
      )
    }

    // Generate meditation content using OpenAI
    const meditationCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a meditation guide. Create a soothing and calming meditation script.' },
        { role: 'user', content: `Create a ${duration} second meditation based on the theme: ${meditationPrompt}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    // Generate music prompt using OpenAI
    const musicCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a music expert. Create descriptive and atmospheric music suggestions.' },
        { role: 'user', content: `Suggest background music or sounds that would complement this meditation theme: ${musicPrompt}` }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return NextResponse.json({
      meditation: meditationCompletion.choices[0].message.content,
      musicDescription: musicCompletion.choices[0].message.content,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate meditation content' },
      { status: 500 }
    )
  }
}
