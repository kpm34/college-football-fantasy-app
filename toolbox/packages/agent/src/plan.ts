// <toolbox:BEGIN toolbox/packages/agent/src/plan.ts v1>
import type { Task, Step } from "./schema";
export function plan(goal: string): Task {
  const g = goal.toLowerCase(); const steps: Step[] = [];
  if (/(video|clip|ad)/.test(g)) steps.push({ type: "runway.create", prompt: goal });
  if (/(3d|mesh|model|texture)/.test(g)) steps.push({ type: "meshy.create", prompt: goal });
  if (/(nightly|weekly|every\s+\d)/.test(g)) steps.push({ type: "cron.schedule", path: "/api/cron/poll-jobs", schedule: "*/5 * * * *" });
  if (!steps.length) steps.push({ type: "anthropic.message", system: "You are a planner.", prompt: goal });
  return { goal, steps };
}
// <toolbox:END toolbox/packages/agent/src/plan.ts v1>
