// <toolbox:BEGIN toolbox/packages/clients/src/anthropic-messages.ts v1>
import Anthropic from "@anthropic-ai/sdk";
export function getClient(apiKey = process.env.ANTHROPIC_API_KEY) {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  return new Anthropic({ apiKey });
}
export async function message(opts: {
  model?: string; system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number; temperature?: number;
}) {
  const c = getClient();
  const { model = "claude-3-5-sonnet-20241022", system, messages, maxTokens = 2048, temperature = 0.7 } = opts;
  return c.messages.create({ model, system, max_tokens: maxTokens, temperature, messages });
}
// <toolbox:END toolbox/packages/clients/src/anthropic-messages.ts v1>
