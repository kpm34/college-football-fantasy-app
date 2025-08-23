import { serverDatabases } from '../appwrite-server'
import { list, getById, upsert } from './_base'

const PAIR = { newId: 'auctions', oldId: 'auctions' }

export async function get(id: string) { return getById(PAIR, id, serverDatabases) }
export async function listAll() { return list(PAIR, [], serverDatabases) }
export async function save(id: string, data: any) { return upsert(PAIR, id, data, serverDatabases) }


