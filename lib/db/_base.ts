import { Databases, Models } from 'node-appwrite'
import { serverDatabases } from '../appwrite-server'
import { DATABASE_ID } from '../appwrite'

export async function getById<T = any>(collectionId: string, id: string, databases: Databases = serverDatabases): Promise<T | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, collectionId, id)
    return doc as unknown as T
  } catch {
    return null
  }
}

export async function list<T = any>(collectionId: string, queries: any[] = [], databases: Databases = serverDatabases): Promise<Models.DocumentList<T>> {
  return (await databases.listDocuments(DATABASE_ID, collectionId, queries)) as unknown as Models.DocumentList<T>
}

async function createOrUpdate(databases: Databases, collectionId: string, id: string, data: Record<string, any>) {
  try {
    return await databases.createDocument(DATABASE_ID, collectionId, id, data)
  } catch {
    return await databases.updateDocument(DATABASE_ID, collectionId, id, data)
  }
}

export async function upsert<T = any>(collectionId: string, id: string, data: Record<string, any>, databases: Databases = serverDatabases): Promise<T> {
  const res = await createOrUpdate(databases, collectionId, id, data)
  return res as unknown as T
}


