# Schema (SSOT)

- zod/: one file per collection
- zod-schema.ts: barrel and shared exports
- schemas.registry.ts: machine-readable COLLECTIONS metadata (id, attributes)
- generators/: codegen that outputs to lib/generated/* only
- fixtures/: optional seeds for local/dev

Invariant: never write generated files back into /schema.
