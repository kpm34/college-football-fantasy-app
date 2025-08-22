import Anthropic from "@anthropic-ai/sdk";
export declare function getClient(apiKey?: string | undefined): Anthropic;
export declare function message(opts: {
    model?: string;
    system?: string;
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    maxTokens?: number;
    temperature?: number;
}): Promise<Anthropic.Messages.Message & {
    _request_id?: string | null;
}>;
