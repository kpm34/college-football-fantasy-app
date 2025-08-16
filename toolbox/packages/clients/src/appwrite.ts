// <toolbox:BEGIN toolbox/packages/clients/src/appwrite.ts v1>
import { Client, Databases, Storage, ID, Query } from "node-appwrite";
export type AppwriteClients = { client: Client; databases: Databases; storage: Storage };
export function getClients(config?: { endpoint?: string; projectId?: string; apiKey?: string }): AppwriteClients {
  const client = new Client()
    .setEndpoint(config?.endpoint || process.env.APPWRITE_ENDPOINT!)
    .setProject(config?.projectId || process.env.APPWRITE_PROJECT_ID!)
    .setKey(config?.apiKey || process.env.APPWRITE_API_KEY!);
  return { client, databases: new Databases(client), storage: new Storage(client) };
}
export { ID, Query };
// <toolbox:END toolbox/packages/clients/src/appwrite.ts v1>
