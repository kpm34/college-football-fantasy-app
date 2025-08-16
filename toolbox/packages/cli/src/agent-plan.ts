// <toolbox:BEGIN toolbox/packages/cli/src/agent-plan.ts v5>
import { plan } from "@global/toolbox-agent";
export async function agentPlan(opts: { goal: string }) {
  const task = plan(opts.goal);
  console.log(JSON.stringify(task, null, 2));
}
// <toolbox:END toolbox/packages/cli/src/agent-plan.ts v5>
