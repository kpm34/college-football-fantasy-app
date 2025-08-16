// <toolbox:BEGIN toolbox/packages/agent/src/tools.ts v2>
import * as clients from "../../clients";
export const tools: Record<string, (args: any) => Promise<any>> = {
  "openai.respond": (args) => clients.openai.respond(args),
  "anthropic.message": (args) => clients.anthropic.message({ messages: [{ role: "user", content: args.prompt }], system: args.system }),
  "runway.create": (args) => clients.runway.create(args),
  "meshy.create": (args) => clients.meshy.create(args),
  "appwrite.write": async (args) => ({ ok: true, saved: args })
};
// <toolbox:END toolbox/packages/agent/src/tools.ts v2>
