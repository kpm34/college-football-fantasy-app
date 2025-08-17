// lib/appwrite/server.ts
import { Client, Databases, Users } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY } from '../env';

export function serverAppwrite() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(APPWRITE_API_KEY);
  
  return {
    client,
    databases: new Databases(client),
    users: new Users(client),
  };
}

