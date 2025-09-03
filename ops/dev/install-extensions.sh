#!/usr/bin/env bash
set -euo pipefail

BIN=${BIN:-code}
if command -v cursor >/dev/null 2>&1; then
  BIN=cursor
elif command -v code >/dev/null 2>&1; then
  BIN=code
fi

EXTS=(
  # Essential
  dbaeumer.vscode-eslint
  esbenp.prettier-vscode
  usernamehw.errorlens
  
  # Productivity
  Gruntfuggly.todo-tree
  aaron-bond.better-comments
  eamodio.gitlens
  christian-kohler.path-intellisense
  wix.vscode-import-cost
  
  # API Testing
  humao.rest-client
  rangav.vscode-thunder-client
  
  # Frontend
  bradlc.vscode-tailwindcss
  dsznajder.es7-react-js-snippets
  
  # Testing
  ms-playwright.playwright
  Orta.vscode-jest
  
  # Docs/Diagrams
  yzhang.markdown-all-in-one
  bierner.markdown-mermaid
  hediet.vscode-drawio
  
  # Env/DB
  mikestead.dotenv
  Prisma.prisma
  
  # Git
  mhutchie.git-graph
  donjayamanne.githistory
  
  # AI
  GitHub.copilot
  GitHub.copilot-chat
  TabNine.tabnine-vscode
  sourcegraph.cody-ai
  Qodo-dev.qodo
  bito.bito
  Continue.continue

  # In-editor preview
  ms-vscode.live-preview
  ritwickdey.LiveServer
  auchenberg.vscode-browser-preview
)

echo "Using CLI: $BIN"
for ext in "${EXTS[@]}"; do
  echo "Installing $ext" && $BIN --install-extension "$ext" || true
done

echo "Done. Restart the editor if needed."


