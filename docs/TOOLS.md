# Tools & Extensions (install fast)

## Editor AI
- GitHub Copilot + Chat
- Tabnine
- Sourcegraph Cody
- Qodo Gen
- Bito AI
- Continue.dev (local+cloud models)

Install (Cursor/VS Code):
```bash
# Choose your CLI: 'cursor' or 'code'
BIN=${BIN:-cursor}
$BIN --install-extension GitHub.copilot GitHub.copilot-chat TabNine.tabnine-vscode \
  sourcegraph.cody-ai Qodo-dev.qodo bito.bito Continue.continue
```

## API testing
- REST Client (humao.rest-client)
- Thunder Client (rangav.vscode-thunder-client)

## Frontend & Testing
- Tailwind IntelliSense, ES7+ Snippets
- Playwright Test, Jest

## Diagrams & Docs
- Draw.io Integration, Markdown Mermaid, Markdown All in One

## Session helpers
- `npm run session:fixport | preflight | start`
- Playbook: `docs/SESSION_PLAYBOOK.md`
- Prompts: `docs/PROMPT_TEMPLATES.md`
- Weekly: `docs/WORKFLOW_TUNEUP.md`
