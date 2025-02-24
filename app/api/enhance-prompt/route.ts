import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { meditationPrompt, musicPrompt } = await req.json()

    if (!meditationPrompt && !musicPrompt) {
      return NextResponse.json(
        { error: 'At least one prompt is required' },
        { status: 400 }
      )
    }

    let enhancedMeditationPrompt = meditationPrompt
    let enhancedMusicPrompt = musicPrompt

    if (meditationPrompt) {
      const meditationCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a meditation expert. Enhance the given meditation prompt to be more detailed and relaxing, while keeping the same theme and core meaning. Keep the response concise (max 2-3 sentences)."
          },
          {
            role: "user",
            content: meditationPrompt
          }
        ],
        model: "gpt-3.5-turbo",
      })

      enhancedMeditationPrompt = meditationCompletion.choices[0]?.message?.content || meditationPrompt
    }

    if (musicPrompt) {
      const musicCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a music expert. Enhance the given music prompt to be more detailed and atmospheric, while keeping the same theme and core meaning. Keep the response concise (max 2-3 sentences)."
          },
          {
            role: "user",
            content: musicPrompt
          }
        ],
        model: "gpt-3.5-turbo",
      })

      enhancedMusicPrompt = musicCompletion.choices[0]?.message?.content || musicPrompt
    }

    return NextResponse.json({
      enhancedMeditationPrompt,
      enhancedMusicPrompt
    })

  } catch (error: any) {
    console.error('Error in enhance-prompt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to enhance prompts' },
      { status: 500 }
    )
  }
}
