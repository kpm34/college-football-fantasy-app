import { useState, useCallback } from 'react';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export function useClaude() {
  const [messages, setMessages] = useState<ClaudeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    prompt: string,
    options: ClaudeOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: ClaudeMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...options }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ClaudeMessage = {
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      return data.text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const streamMessage = useCallback(async (
    prompt: string,
    onChunk: (text: string) => void
  ) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: ClaudeMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    let fullResponse = '';

    try {
      const response = await fetch(`/api/claude?prompt=${encodeURIComponent(prompt)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullResponse += parsed.text;
                onChunk(parsed.text);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Add complete assistant message
      const assistantMessage: ClaudeMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      return fullResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stream message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    streamMessage,
    clearMessages,
  };
}

// Utility hook for code generation
export function useClaudeCode() {
  const { sendMessage, isLoading, error } = useClaude();

  const generateCode = useCallback(async (
    description: string,
    language: string = 'typescript'
  ) => {
    const systemPrompt = `You are an expert ${language} developer. Generate clean, efficient, and well-commented code. Return only the code without explanations unless asked.`;
    
    return sendMessage(description, { systemPrompt, temperature: 0.3 });
  }, [sendMessage]);

  const reviewCode = useCallback(async (code: string) => {
    const prompt = `Review this code for bugs, improvements, and best practices:\n\n\`\`\`\n${code}\n\`\`\``;
    const systemPrompt = 'You are an expert code reviewer. Provide detailed feedback on code quality, potential bugs, and improvements.';
    
    return sendMessage(prompt, { systemPrompt, temperature: 0.5 });
  }, [sendMessage]);

  const explainCode = useCallback(async (code: string) => {
    const prompt = `Explain what this code does in detail:\n\n\`\`\`\n${code}\n\`\`\``;
    const systemPrompt = 'You are a patient programming teacher. Explain code clearly and thoroughly.';
    
    return sendMessage(prompt, { systemPrompt, temperature: 0.5 });
  }, [sendMessage]);

  return {
    generateCode,
    reviewCode,
    explainCode,
    isLoading,
    error,
  };
}