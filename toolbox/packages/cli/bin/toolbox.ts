// <toolbox:BEGIN toolbox/packages/cli/bin/toolbox.ts v2>
import { Command } from "commander";
import { integrate } from "../src/integrate";
import { agentPlan } from "../src/agent-plan";
import { agentExecute } from "../src/agent-execute";
import { ensureAppwrite } from "../src/ensure-appwrite";
import { doctor } from "../src/doctor";

const program = new Command();
program.name("toolbox").version("0.1.0");

program.command("integrate")
  .option("--dry", "dry run")
  .option("--force", "overwrite existing files (use sparingly)")
  .action(integrate);

program.command("agent").command("plan")
  .requiredOption("--goal <text>", "goal to plan")
  .action(agentPlan);

program.command("agent").command("execute")
  .option("--goal <text>", "goal to execute")
  .option("--task <file>", "task JSON file")
  .option("--save", "persist jobs if configured")
  .action(agentExecute);

program.command("ensure").command("appwrite")
  .option("--project-config <file>", "toolbox.project.json path")
  .action(ensureAppwrite);

program.command("doctor").action(doctor);

program.parse();
// <toolbox:END toolbox/packages/cli/bin/toolbox.ts v2>
