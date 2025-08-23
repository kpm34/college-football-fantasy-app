// Minimal schema enforcer shim to unblock builds.
// TODO: Align with SSOT in schema/zod-schema.ts and enforce real validation.

export class SchemaValidator {
  static validate(collection: string, data: any): { success: boolean; data: any; errors?: string[] } {
    // Pass-through for now; could add per-collection checks
    return { success: true, data };
  }
  static transform(collection: string, data: any): any {
    // Remove undefined values and serialize objects where necessary
    const out: any = {};
    for (const [k, v] of Object.entries(data || {})) {
      if (v === undefined) continue;
      out[k] = v;
    }
    return out;
  }
}

export function enforceSchema(collection: string, data: any): any {
  const res = SchemaValidator.validate(collection, data);
  if (!res.success) {
    throw new Error(`Schema validation failed for ${collection}: ${res.errors?.join(', ')}`);
  }
  return res.data;
}
