// Direct OpenAI Client Integration
// Separate from Vercel AI SDK for specialized use cases
// Documentation: https://platform.openai.com/docs/api-reference

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const OPENAI_MODELS = {
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  GPT4_VISION: 'gpt-4-vision-preview',
} as const;

export type OpenAIModel = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS];

interface OpenAIOptions {
  model?: OpenAIModel;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface OpenAIImageOptions {
  model?: 'dall-e-3' | 'dall-e-2';
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

/**
 * Generate text with OpenAI
 */
export async function generateText(
  prompt: string,
  options: OpenAIOptions = {}
) {
  const {
    model = OPENAI_MODELS.GPT4_TURBO,
    maxTokens = 4096,
    temperature = 0.7,
    systemPrompt = 'You are a helpful AI assistant.',
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Stream text generation with OpenAI
 */
export async function streamText(
  prompt: string,
  onChunk: (text: string) => void,
  options: OpenAIOptions = {}
) {
  const {
    model = OPENAI_MODELS.GPT4_TURBO,
    maxTokens = 4096,
    temperature = 0.7,
    systemPrompt = 'You are a helpful AI assistant.',
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const stream = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    throw error;
  }
}

/**
 * Analyze image with OpenAI Vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string = 'What do you see in this image?',
  options: Omit<OpenAIOptions, 'model'> = {}
) {
  const {
    maxTokens = 4096,
    temperature = 0.7,
    systemPrompt = 'You are an expert image analyst.',
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.GPT4_VISION,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'imageUrl', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI vision error:', error);
    throw error;
  }
}

/**
 * Generate image with DALL-E
 */
export async function generateImage(
  prompt: string,
  options: OpenAIImageOptions = {}
) {
  const {
    model = 'dall-e-3',
    size = '1024x1024',
    quality = 'standard',
    style = 'vivid',
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.images.generate({
      model,
      prompt,
      size,
      quality: model === 'dall-e-3' ? quality : undefined,
      style: model === 'dall-e-3' ? style : undefined,
      n: 1,
    });

    return {
      url: response.data[0]?.url || '',
      revisedPrompt: response.data[0]?.revised_prompt,
    };
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    throw error;
  }
}

/**
 * Generate embeddings with OpenAI
 */
export async function generateEmbeddings(
  text: string | string[],
  model: 'text-embedding-3-small' | 'text-embedding-3-large' = 'text-embedding-3-small'
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
    });

    return response.data.map(item => ({
      embedding: item.embedding,
      index: item.index,
    }));
  } catch (error) {
    console.error('OpenAI embeddings error:', error);
    throw error;
  }
}

/**
 * Moderate content with OpenAI
 */
export async function moderateContent(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.moderations.create({
      input: text,
    });

    const result = response.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
    };
  } catch (error) {
    console.error('OpenAI moderation error:', error);
    throw error;
  }
}

/**
 * Chat with conversation history
 */
export class OpenAIChat {
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  private systemPrompt: string;
  private model: OpenAIModel;

  constructor(systemPrompt?: string, model: OpenAIModel = OPENAI_MODELS.GPT4_TURBO) {
    this.systemPrompt = systemPrompt || 'You are a helpful AI assistant.';
    this.model = model;
    this.messages.push({ role: 'system', content: this.systemPrompt });
  }

  async sendMessage(content: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    this.messages.push({ role: 'user', content });

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: this.messages,
        max_tokens: 4096,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';
      this.messages.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw error;
    }
  }

  clearHistory() {
    this.messages = [{ role: 'system', content: this.systemPrompt }];
  }

  getHistory() {
    return this.messages;
  }
}

/**
 * Check if OpenAI is configured and available
 */
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export default openai;