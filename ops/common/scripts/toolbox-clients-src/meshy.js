// <toolbox:BEGIN toolbox/packages/clients/src/meshy.ts v1>
export async function create(input) {
    if (!process.env.MESHY_API_KEY)
        throw new Error("MESHY_API_KEY missing");
    return { ok: true, input };
}
// <toolbox:END toolbox/packages/clients/src/meshy.ts v1>
