// <toolbox:BEGIN toolbox/packages/clients/src/runway.ts v1>
export async function create(input) {
    if (!process.env.RUNWAY_API_KEY)
        throw new Error("RUNWAY_API_KEY missing");
    return { ok: true, input };
}
// <toolbox:END toolbox/packages/clients/src/runway.ts v1>
