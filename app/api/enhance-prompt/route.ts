import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { meditationPrompt, musicPrompt } = await req.json()

    if (!meditationPrompt && !musicPrompt) {
      return NextResponse.json(
        { error: 'At least one prompt is required' },
        { status: 400 }
      )
    }

    const enhancePrompt = async (prompt: string, type: 'meditation' | 'music') => {
      const systemPrompt = type === 'meditation'
        ? 'You are an expert meditation guide. Given a simple theme or emotion, create exactly 3 unique lines that expand on that theme. Each line should be different but related to the theme. Do not repeat the original word. Example for "peace": "Let tranquility wash over you", "Find serenity in the moment", "Rest in perfect stillness".'
        : 'You are a professional music composer. Given a simple theme or emotion, create exactly 3 unique lines describing the musical atmosphere. Each line should be different but related to the theme. Do not repeat the original word. Example for "gentle": "Soft piano notes floating in air", "Delicate strings whispering melodies", "Light chimes dancing with breeze".'

      const userPrompt = type === 'meditation'
        ? `Create 3 unique meditation lines based on this theme: "${prompt}". Remember, do not repeat the original word.`
        : `Create 3 unique musical atmosphere lines based on this theme: "${prompt}". Remember, do not repeat the original word.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 60,
        frequency_penalty: 1.0,
        presence_penalty: 1.0,
      })

      const content = completion.choices[0]?.message?.content || ''
      let lines = content.split('\n').filter(line => line.trim())
      
      if (lines.length < 3) {
        const variations = type === 'meditation'
          ? [
              `Let ${prompt}ness envelop your being`,
              `Find deep ${prompt}ness within`,
              `Rest in perfect ${prompt}ness`
            ]
          : [
              `Soft ${prompt} melodies flow`,
              `Gentle ${prompt} rhythms sway`,
              `Peaceful ${prompt} harmonies blend`
            ]
        
        while (lines.length < 3) {
          lines.push(variations[lines.length])
        }
      }
      
      return lines.slice(0, 3).join('\n')
    }

    const results = await Promise.all([
      meditationPrompt ? enhancePrompt(meditationPrompt, 'meditation') : Promise.resolve(meditationPrompt),
      musicPrompt ? enhancePrompt(musicPrompt, 'music') : Promise.resolve(musicPrompt)
    ])

    return NextResponse.json({
      success: true,
      meditationPrompt: results[0],
      musicPrompt: results[1]
    })
  } catch (error) {
    console.error('Error in enhance-prompt:', error)
    return NextResponse.json(
      { error: 'Failed to enhance prompts' },
      { status: 500 }
    )
  }
}

