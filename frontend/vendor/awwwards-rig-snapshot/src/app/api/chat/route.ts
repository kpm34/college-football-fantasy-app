import { streamText } from 'ai'
import type { LanguageModelV1 } from 'ai'
import { createGateway } from '@ai-sdk/gateway'
import { getFlag } from '@/lib/edgeConfig'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const chatEnabled = await getFlag('chatEnabled')
  if (!chatEnabled) {
    return new Response(JSON.stringify({ error: 'Chat temporarily disabled' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'retry-after': '60' },
    })
  }

  const { messages, system, maxTokens = 800 } = await req.json()

  const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1/ai',
  })

  const primary = process.env.AI_PROVIDER_PRIMARY || 'anthropic/messages'
  const fallback = process.env.AI_PROVIDER_FALLBACK || 'openai/chat.completions'

  try {
    const result = await streamText({
      model: gateway(primary) as unknown as LanguageModelV1,
      system,
      messages,
      maxTokens,
    })
    return result.toAIStreamResponse()
  } catch {
    const result = await streamText({
      model: gateway(fallback) as unknown as LanguageModelV1,
      system,
      messages,
      maxTokens,
    })
    return result.toAIStreamResponse()
  }
}


