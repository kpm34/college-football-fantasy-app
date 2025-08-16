export type Task = {
    goal: string;
    steps?: Step[];
    env?: Record<string, string>;
    meta?: Record<string, unknown>;
};
export type Step = {
    type: "openai.respond";
    input: unknown;
    tools?: any[];
} | {
    type: "anthropic.message";
    system?: string;
    prompt: string;
} | {
    type: "runway.create";
    prompt: string;
    options?: Record<string, unknown>;
} | {
    type: "meshy.create";
    prompt: string;
    options?: Record<string, unknown>;
} | {
    type: "appwrite.write";
    collection: string;
    data: Record<string, unknown>;
} | {
    type: "cron.schedule";
    path: string;
    schedule: string;
};
