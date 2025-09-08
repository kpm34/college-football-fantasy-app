# Architecture Decision Records (ADR)

Use this directory as the single source for decisions about system architecture, schema, data flow, and platform choices. Each ADR should be small, numbered, and immutable; superseded ADRs should reference their replacements.

## Index

- ADR-0001: Option A repository reorganization (`0001-option-a.md`)
- Data Flow (canonical): `DATA_FLOW.md`
- Data Flow Alignment (SSOT): `DATA_FLOW_ALIGNMENT.md`
- Design to Code Integration: `DESIGN_TO_CODE_INTEGRATION.md`
- Design Vision: `DESIGN_VISION.md`
- Schema Audit Report: `SCHEMA_AUDIT_REPORT.md`
- Schema Drift Report: `SCHEMA_DRIFT_REPORT.md`
- Guardrails and Data Sourcing: `guardrails-and-data-sourcing.md`
- Unified Talent Projections: `UNIFIED_TALENT_PROJECTIONS.md`
- User ID Consistency: `USER_ID_CONSISTENCY.md`
- MCP Config (reference): `MCP_CONFIG.json`

## How to add a new ADR

1. Create a new file `NNNN-title-kebab.md` with context, decision, consequences.
2. Link it here under Index.
3. If it supersedes an ADR, add "Supersedes ADR-NNNN" and update the older file with "Superseded by ADR-MMMM".
