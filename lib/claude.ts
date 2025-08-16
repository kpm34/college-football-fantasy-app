import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const CLAUDE_MODELS = {
  OPUS: 'claude-3-opus-20240229',
  SONNET: 'claude-3-5-sonnet-20241022',
  HAIKU: 'claude-3-haiku-20240307',
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS];

interface ClaudeOptions {
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Generate text with Claude
 */
export async function generateText(
  prompt: string,
  options: ClaudeOptions = {}
) {
  const {
    model = CLAUDE_MODELS.SONNET,
    maxTokens = 4096,
    temperature = 0.7,
    systemPrompt = 'You are a helpful AI assistant.',
  } = options;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Stream text generation with Claude
 */
export async function streamText(
  prompt: string,
  onChunk: (text: string) => void,
  options: ClaudeOptions = {}
) {
  const {
    model = CLAUDE_MODELS.SONNET,
    maxTokens = 4096,
    temperature = 0.7,
    systemPrompt = 'You are a helpful AI assistant.',
  } = options;

  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text);
      }
    }
  } catch (error) {
    console.error('Claude streaming error:', error);
    throw error;
  }
}

/**
 * Code generation with Claude
 */
export async function generateCode(
  description: string,
  language: string = 'typescript',
  context?: string
) {
  const systemPrompt = `You are an expert ${language} developer. Generate clean, efficient, and well-commented code based on the user's requirements. Return only the code without explanations unless specifically asked.`;
  
  const prompt = context 
    ? `Context:\n${context}\n\nTask: ${description}`
    : description;

  return generateText(prompt, {
    model: CLAUDE_MODELS.SONNET,
    systemPrompt,
    temperature: 0.3, // Lower temperature for code generation
  });
}

/**
 * Analyze code with Claude
 */
export async function analyzeCode(
  code: string,
  analysisType: 'review' | 'optimize' | 'explain' | 'debug' = 'review'
) {
  const prompts = {
    review: 'Review this code for bugs, security issues, and improvements:',
    optimize: 'Optimize this code for performance and readability:',
    explain: 'Explain what this code does in detail:',
    debug: 'Find and fix any bugs in this code:',
  };

  const systemPrompt = 'You are an expert code reviewer with deep knowledge of best practices, security, and performance optimization.';
  
  return generateText(`${prompts[analysisType]}\n\n\`\`\`\n${code}\n\`\`\``, {
    model: CLAUDE_MODELS.SONNET,
    systemPrompt,
    temperature: 0.5,
  });
}

/**
 * Generate documentation with Claude
 */
export async function generateDocs(
  code: string,
  docType: 'jsdoc' | 'markdown' | 'readme' = 'jsdoc'
) {
  const prompts = {
    jsdoc: 'Generate comprehensive JSDoc comments for this code:',
    markdown: 'Create detailed markdown documentation for this code:',
    readme: 'Generate a complete README.md file for this code/project:',
  };

  return generateText(`${prompts[docType]}\n\n\`\`\`\n${code}\n\`\`\``, {
    model: CLAUDE_MODELS.SONNET,
    systemPrompt: 'You are a technical documentation expert. Create clear, comprehensive documentation.',
    temperature: 0.5,
  });
}

/**
 * Chat with conversation history
 */
export class ClaudeChat {
  private messages: Anthropic.MessageParam[] = [];
  private systemPrompt: string;
  private model: ClaudeModel;

  constructor(systemPrompt?: string, model: ClaudeModel = CLAUDE_MODELS.SONNET) {
    this.systemPrompt = systemPrompt || 'You are a helpful AI assistant.';
    this.model = model;
  }

  async sendMessage(content: string): Promise<string> {
    this.messages.push({ role: 'user', content });

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemPrompt,
        messages: this.messages,
      });

      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      return assistantMessage;
    } catch (error) {
      console.error('Claude chat error:', error);
      throw error;
    }
  }

  clearHistory() {
    this.messages = [];
  }

  getHistory() {
    return this.messages;
  }
}

export default anthropic;