import { Client, Databases, Storage, ID, Query } from "node-appwrite";
export type AppwriteClients = {
    client: Client;
    databases: Databases;
    storage: Storage;
};
export declare function getClients(config?: {
    endpoint?: string;
    projectId?: string;
    apiKey?: string;
}): AppwriteClients;
export { ID, Query };
