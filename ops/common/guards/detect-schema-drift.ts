#!/usr/bin/env tsx

/**
 * Schema Drift Detection Guard (deep diff)
 * Compares SSOT (schema/schema.ts) against live Appwrite dump (schema/appwrite-current-schema.json)
 * Reports missing/mismatched collections, attributes, and indexes by name and shape.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
	const livePath = join(process.cwd(), 'schema', 'appwrite-current-schema.json');
	const ssotModulePath = join(process.cwd(), 'schema', 'schema.ts');

	if (!existsSync(livePath)) {
		console.error('❌ Live schema file not found:', livePath);
		console.error('   Run: node scripts/fetch-current-appwrite-schema.ts');
		process.exit(1);
	}
	if (!existsSync(ssotModulePath)) {
		console.error('❌ SSOT module not found:', ssotModulePath);
		process.exit(1);
	}

	const liveJson = JSON.parse(readFileSync(livePath, 'utf-8'));
	const mod = await import(ssotModulePath);
	const SCHEMA: Record<string, any> = (mod as any).SCHEMA;

	const liveCollections: Record<string, any> = {};
	const colObj = liveJson.collections || {};
	for (const key of Object.keys(colObj)) {
		const c = colObj[key];
		liveCollections[(c && (c.id || c.$id)) || key] = {
			attributes: (c?.attributes || []).map((a: any) => ({
				key: a.key,
				type: a.type,
				required: !!a.required,
				array: !!a.array,
				size: a.size,
				min: a.min,
				max: a.max,
				default: a.default,
				elements: a.elements,
			})),
			indexes: (c?.indexes || []).map((i: any) => ({
				key: i.key,
				type: i.type,
				attributes: i.attributes,
				orders: i.orders,
			})),
		};
	}

	const diffs: any = { collections_missing_in_live: [], collections_missing_in_ssot: [], per_collection: {} };
	const ssotIds = Object.keys(SCHEMA);
	const liveIds = Object.keys(liveCollections);

	for (const id of ssotIds) if (!liveIds.includes(id)) diffs.collections_missing_in_live.push(id);
	for (const id of liveIds) if (!ssotIds.includes(id)) diffs.collections_missing_in_ssot.push(id);

	function attrKey(a: any) {
		return `${a.key}|${a.type}|${a.required}|${a.array || false}|${a.size ?? ''}|${a.min ?? ''}|${a.max ?? ''}|${(a.elements || []).join(',')}|${a.default ?? ''}`;
	}
	function indexKey(i: any) {
		return `${i.key}|${i.type}|${(i.attributes || []).join(',')}`;
	}

	for (const id of ssotIds) {
		const ssot = SCHEMA[id];
		const liveC = liveCollections[id];
		if (!liveC) continue;

		const per: any = { missing_attrs_in_live: [], missing_attrs_in_ssot: [], mismatched_attrs: [], missing_indexes_in_live: [], missing_indexes_in_ssot: [], mismatched_indexes: [] };

		// Attributes
		const ssotAttrMap: Record<string, any> = Object.fromEntries((ssot.attributes || []).map((a: any) => [a.key, a]));
		const liveAttrMap: Record<string, any> = Object.fromEntries((liveC.attributes || []).map((a: any) => [a.key, a]));
		for (const k of Object.keys(ssotAttrMap)) {
			if (!liveAttrMap[k]) per.missing_attrs_in_live.push(k);
			else if (attrKey(ssotAttrMap[k]) !== attrKey(liveAttrMap[k])) per.mismatched_attrs.push({ key: k, ssot: ssotAttrMap[k], live: liveAttrMap[k] });
		}
		for (const k of Object.keys(liveAttrMap)) if (!ssotAttrMap[k]) per.missing_attrs_in_ssot.push(k);

		// Indexes
		const ssotIdxMap: Record<string, any> = Object.fromEntries((ssot.indexes || []).map((i: any) => [i.key, i]));
		const liveIdxMap: Record<string, any> = Object.fromEntries((liveC.indexes || []).map((i: any) => [i.key, i]));
		for (const k of Object.keys(ssotIdxMap)) {
			if (!liveIdxMap[k]) per.missing_indexes_in_live.push(k);
			else if (indexKey(ssotIdxMap[k]) !== indexKey(liveIdxMap[k])) per.mismatched_indexes.push({ key: k, ssot: ssotIdxMap[k], live: liveIdxMap[k] });
		}
		for (const k of Object.keys(liveIdxMap)) if (!ssotIdxMap[k]) per.missing_indexes_in_ssot.push(k);

		diffs.per_collection[id] = per;
	}

	const outPath = join(process.cwd(), 'schema', 'DRIFT_REPORT.json');
	writeFileSync(outPath, JSON.stringify(diffs, null, 2));

	const hasDrift = (
		diffs.collections_missing_in_live.length > 0 ||
		diffs.collections_missing_in_ssot.length > 0 ||
		Object.values(diffs.per_collection).some((p: any) => (
			p.missing_attrs_in_live.length || p.missing_attrs_in_ssot.length || p.mismatched_attrs.length || p.missing_indexes_in_live.length || p.missing_indexes_in_ssot.length || p.mismatched_indexes.length
		))
	);

	if (hasDrift) {
		console.error('❌ Schema drift detected. See schema/DRIFT_REPORT.json');
		process.exit(1);
	}

	console.log('✅ No Schema Drift Detected');
	console.log('📊 SSOT and database schemas are aligned');
}

if (import.meta.url === `file://${process.argv[1]}`) {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	main();
}