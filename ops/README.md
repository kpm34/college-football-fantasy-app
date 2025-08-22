# Ops Directory

Centralized operational scripts and docs for AI tooling and automation.

Structure:
- claude-ops/: Claude-specific tools and guides
- cursor-ops/: Cursor-specific commands and toolbox
- chatgpt-ops/: ChatGPT-specific workflows
- common/scripts/: Shared scripts used by all tools

Guidelines:
- Put all scripts in ops/common/scripts and reference them from tool-specific docs.
- Avoid duplicating scripts across folders; use the common path.
- Update references in docs and package.json when moving scripts.
