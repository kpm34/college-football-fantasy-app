import { serverDatabases } from '../appwrite-server'
import { list, getById, upsert } from './_base'

const COLLECTION = 'drafts'

export async function get(id: string) { return getById(COLLECTION, id, serverDatabases) }
export async function listAll() { return list(COLLECTION, [], serverDatabases) }
export async function save(id: string, data: any) { return upsert(COLLECTION, id, data, serverDatabases) }


