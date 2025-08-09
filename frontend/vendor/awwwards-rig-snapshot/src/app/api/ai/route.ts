import { NextRequest, NextResponse } from 'next/server'
import { getAIConfig } from '@/lib/feature-flags'

// API route using Vercel AI Gateway with Edge Config

const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'https://gateway.vercel.app'
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY
const AI_PROVIDER_FALLBACK = process.env.AI_PROVIDER_FALLBACK || 'openai/chat.completions'

export async function POST(req: NextRequest) {
  try {
    // Get AI configuration from Edge Config
    const aiConfig = await getAIConfig()
    
    // Check if AI is enabled
    if (!aiConfig.enabled) {
      return NextResponse.json(
        { error: 'AI service is currently disabled' },
        { status: 503 }
      )
    }
    
    // Check if AI Gateway is configured
    if (!AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        { error: 'AI Gateway not configured. Set AI_GATEWAY_API_KEY in environment.' },
        { status: 500 }
      )
    }

    const { messages } = await req.json()
    
    // Build provider path based on Edge Config
    const providerPath = aiConfig.provider === 'anthropic' 
      ? 'anthropic/messages' 
      : 'openai/chat.completions'

    // Primary provider request
    const gatewayResponse = await fetch(`${AI_GATEWAY_URL}/v1/${providerPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`,
        'x-provider-fallback': AI_PROVIDER_FALLBACK, // Automatic fallback
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        max_tokens: aiConfig.maxTokens,
        temperature: 0.7,
      }),
    })

    if (!gatewayResponse.ok) {
      throw new Error(`Gateway error: ${gatewayResponse.statusText}`)
    }

    const data = await gatewayResponse.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('AI Gateway error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

// Example usage from client:
// const response = await fetch('/api/ai', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     messages: [{ role: 'user', content: 'Hello!' }]
//   })
// })