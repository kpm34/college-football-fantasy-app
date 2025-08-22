// <toolbox:BEGIN toolbox/packages/cli/src/agent-execute.ts v4>
import { plan as makePlan, execute } from "@global/toolbox-agent";
import fs from "node:fs/promises";
export async function agentExecute(opts: { goal?: string; task?: string; save?: boolean }) {
  const task = opts.task ? JSON.parse(await fs.readFile(opts.task, "utf8")) : makePlan(opts.goal || "");
  const result = await execute(task);
  console.log(JSON.stringify(result, null, 2));
}
// <toolbox:END toolbox/packages/cli/src/agent-execute.ts v4>
