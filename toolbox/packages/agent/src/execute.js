import { tools } from "./tools";
export async function execute(task) {
    const outputs = [];
    for (const step of task.steps || []) {
        const fn = tools[step.type];
        if (!fn)
            throw new Error(`Unknown step type: ${step.type}`);
        outputs.push(await fn({ ...step }));
    }
    return { goal: task.goal, outputs };
}
// <toolbox:END toolbox/packages/agent/src/execute.ts v1>
