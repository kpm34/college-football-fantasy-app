import OpenAI from "openai";
export type FunctionToolDef = {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
};
export declare function getClient(apiKey?: string | undefined): OpenAI;
export declare function respond(opts: {
    model?: string;
    input: any;
    tools?: FunctionToolDef[];
}): Promise<OpenAI.Responses.Response & {
    _request_id?: string | null;
}>;
