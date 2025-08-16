// <toolbox:BEGIN toolbox/packages/agent/src/execute.ts v1>
import type { Task } from "./schema";
import { tools } from "./tools";
export async function execute(task: Task) {
  const outputs: any[] = [];
  for (const step of task.steps || []) {
    const fn = (tools as any)[(step as any).type];
    if (!fn) throw new Error(`Unknown step type: ${(step as any).type}`);
    outputs.push(await fn({ ...(step as any) }));
  }
  return { goal: task.goal, outputs };
}
// <toolbox:END toolbox/packages/agent/src/execute.ts v1>
