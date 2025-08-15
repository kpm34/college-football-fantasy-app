/**
 * Schema Guard
 *
 * Verifies that the running app matches the schema version stored in Vercel Edge Config.
 * - Safe by default: no-ops if Edge Config or expected digest is missing
 * - Won't break builds: dynamically imports '@vercel/edge-config'
 * - Behavior controlled via env flags
 *   - NEXT_PUBLIC_SCHEMA_DIGEST: expected digest written at deploy
 *   - RUNTIME_SCHEMA_CHECK=true: throw on mismatch; otherwise warn
 */

export interface AssertSchemaOptions {
  throwOnMismatch?: boolean; // override behavior regardless of env
  key?: string; // Edge Config key, defaults to 'SCHEMA_DIGEST'
}

export async function assertSchema(options: AssertSchemaOptions = {}): Promise<{ ok: boolean; expected?: string; current?: string; reason?: string }> {
  const expected = process.env.NEXT_PUBLIC_SCHEMA_DIGEST;

  // If no expected digest is provided, do nothing (safe default)
  if (!expected) {
    return { ok: true, reason: 'No expected digest set; skipping schema check.' };
  }

  // Try to dynamically import Edge Config (avoids hard dependency at build time)
  let getFromEdgeConfig: (<T = unknown>(key: string) => Promise<T | null>) | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const edge = (await import('@vercel/edge-config')) as typeof import('@vercel/edge-config');
    getFromEdgeConfig = edge.get as any;
  } catch (err) {
    console.warn('[SchemaGuard] @vercel/edge-config not available; skipping check.');
    return { ok: true, reason: 'Edge Config not available' };
  }

  const key = options.key || 'SCHEMA_DIGEST';
  let current: string | null = null;
  try {
    current = (await getFromEdgeConfig<string>(key)) || null;
  } catch (err) {
    console.warn('[SchemaGuard] Failed to read schema digest from Edge Config; skipping check.');
    return { ok: true, reason: 'Edge Config read failed' };
  }

  if (!current) {
    console.warn('[SchemaGuard] No schema digest found in Edge Config; skipping check.');
    return { ok: true, reason: 'No digest in Edge Config' };
  }

  const matches = current === expected;
  if (matches) {
    return { ok: true, expected, current };
  }

  const shouldThrow = options.throwOnMismatch ?? (process.env.RUNTIME_SCHEMA_CHECK === 'true');
  const message = `Schema mismatch: expected ${expected}, got ${current}. Redeploy or resync.`;

  if (shouldThrow) {
    throw new Error(message);
  } else {
    console.warn(`[SchemaGuard] ${message}`);
    return { ok: false, expected, current, reason: 'Mismatch (warn only)' };
  }
}

/**
 * Helper to get current status without warnings/exceptions.
 */
export async function getSchemaStatus(key: string = 'SCHEMA_DIGEST'): Promise<{ expected?: string; current?: string | null }> {
  const expected = process.env.NEXT_PUBLIC_SCHEMA_DIGEST;
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const edge = (await import('@vercel/edge-config')) as typeof import('@vercel/edge-config');
    const current = await edge.get<string>(key);
    return { expected, current: current ?? null };
  } catch {
    return { expected, current: null };
  }
}


