// <toolbox:BEGIN toolbox/packages/clients/src/openai-responses.ts v2>
import OpenAI from "openai";
export function getClient(apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey)
        throw new Error("OPENAI_API_KEY missing");
    return new OpenAI({ apiKey });
}
export async function respond(opts) {
    const client = getClient();
    const { model = "gpt-4.1-mini", input, tools } = opts;
    return client.responses.create({
        model,
        input: input,
        tools: tools?.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
                strict: tool.strict,
            },
        })),
    });
}
// <toolbox:END toolbox/packages/clients/src/openai-responses.ts v2>
