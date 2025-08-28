#!/usr/bin/env tsx

/*
 * One-off script: Normalize draft_states.draftStatus values
 * - Converts 'active' -> 'drafting'
 * - Converts 'predraft' -> 'pre-draft'
 * - Converts 'postdraft' -> 'post-draft'
 */

import 'dotenv/config';
import { Client, Databases, Query } from 'node-appwrite';

async function main() {
	const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1').trim();
	const projectId = (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app').trim();
	const databaseId = (process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy').trim();
	const apiKey = (process.env.APPWRITE_API_KEY || '').trim();
	const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES || 'draft_states';

	if (!apiKey) {
		console.error('❌ APPWRITE_API_KEY is required in env');
		process.exit(1);
	}

	const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
	const databases = new Databases(client);

	const toCanonical: Record<string, string> = {
		active: 'drafting',
		predraft: 'pre-draft',
		postdraft: 'post-draft',
	};

	let updated = 0;
	let scanned = 0;
	let cursor: string | undefined = undefined;

	while (true) {
		const queries = [Query.limit(100)];
		if (cursor) queries.push(Query.cursorAfter(cursor));
		const page = await databases.listDocuments(databaseId, collectionId, queries);
		const docs = page.documents || [];
		if (docs.length === 0) break;
		for (const doc of docs) {
			scanned += 1;
			const current = (doc as any).draftStatus;
			if (current && toCanonical[current]) {
				const next = toCanonical[current];
				try {
					await databases.updateDocument(databaseId, collectionId, doc.$id, { draftStatus: next } as any);
					updated += 1;
					console.log(`➡️  ${doc.$id}: ${current} -> ${next}`);
				} catch (e: any) {
					console.warn(`⚠️  Failed to update ${doc.$id}:`, e?.message || e);
				}
			}
		}
		cursor = docs[docs.length - 1].$id;
	}

	console.log(`\nScanned: ${scanned}, Updated: ${updated}`);
}

main().catch((e) => {
	console.error('❌ Script failed:', e);
	process.exit(1);
});


