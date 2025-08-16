export declare function create(input: {
    prompt: string;
    options?: Record<string, unknown>;
}): Promise<{
    ok: boolean;
    input: {
        prompt: string;
        options?: Record<string, unknown>;
    };
}>;
