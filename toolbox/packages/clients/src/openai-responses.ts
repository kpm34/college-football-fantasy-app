// <toolbox:BEGIN toolbox/packages/clients/src/openai-responses.ts v2>
import OpenAI from "openai";

export type FunctionToolDef = {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
};

export function getClient(apiKey = process.env.OPENAI_API_KEY) {
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  return new OpenAI({ apiKey });
}

export async function respond(opts: { model?: string; input: any; tools?: FunctionToolDef[] }) {
  const client = getClient();
  const { model = "gpt-4.1-mini", input, tools } = opts;
  return client.responses.create({
    model,
    input: input as any,
    tools: tools?.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as any,
        strict: tool.strict,
      },
    })) as any,
  });
}
// <toolbox:END toolbox/packages/clients/src/openai-responses.ts v2>
