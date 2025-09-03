# AI-Assisted Web App Development

**Goal:** Make Cursor/Claude/Code work precisely by giving them the right guardrails, shared context, and better visibility into your app. This doc is copy‑ready Markdown: extension stack → setup steps → reusable prompts.

---

## A) Must‑have extensions (Cursor / VS Code)

### 1) Code quality & speed

- ESLint — `dbaeumer.vscode-eslint`
- Prettier — `esbenp.prettier-vscode`
- EditorConfig — `EditorConfig.EditorConfig`
- Error Lens — `usernamehw.errorlens`
- GitLens — `eamodio.gitlens`
- TODO Tree — `Gruntfuggly.todo-tree`
- Path Intellisense — `christian-kohler.path-intellisense`
- Import Cost — `wix.vscode-import-cost`
- DotENV — `mikestead.dotenv`

### 2) Frontend (React/Next/Tailwind)

- Tailwind CSS IntelliSense — `bradlc.vscode-tailwindcss`
- Headwind (sort Tailwind classes) — `heybourn.headwind`
- Stylelint — `stylelint.vscode-stylelint`
- ES7+ React Snippets — `dsznajder.es7-react-js-snippets`
- Prisma — `Prisma.prisma` (if applicable)

### 3) API & data

- REST Client — `humao.rest-client`
- Thunder Client — `rangav.vscode-thunder-client`
- GraphQL — `Prisma.vscode-graphql`
- OpenAPI (Swagger) Viewer — `42Crunch.vscode-openapi`

### 4) Testing & reliability

- Playwright Test — `ms-playwright.playwright`
- Jest — `Orta.vscode-jest` (if using Jest)
- Vitest — `ZixuanChen.vitest-explorer` (if using Vitest)
- Better Comments — `aaron-bond.better-comments`

### 5) Containers & parity

- Dev Containers — `ms-vscode-remote.remote-containers`
- Docker — `ms-azuretools.vscode-docker`

### 6) Docs & diagrams

- Markdown All in One — `yzhang.markdown-all-in-one`
- Paste Image — `mushan.vscode-paste-image`
- Draw\.io Integration — `hediet.vscode-drawio`
- Excalidraw Editor — `pomber.excalidraw-editor`
- Mermaid Markdown — `bierner.markdown-mermaid`

---

## B) Browser extensions (visibility & inspection)

### Framework devtools

- React Developer Tools
- Redux DevTools (if using Redux)
- Apollo Client DevTools / Urql Devtools (if using)

### Quality & accessibility

- axe DevTools (Deque)
- WAVE Evaluation Tool
- Lighthouse (Chrome built‑in)
- Web Vitals (live LCP/CLS/INP)

### CSS/layout & inspection

- VisBug (visual nudge/inspect)
- CSS Peeper (extract styles/assets)

### Network & mocking

- Requestly or ModHeader (rewrite routes/headers; mock APIs)
- JSON Formatter

---

## C) 10‑step setup so Cursor/Claude stop guessing

> Do these once in your repo. You’ll give the AI: deterministic formatting, strict scope, reproducible APIs, and pass/fail tests.

### 1) Baseline config files

\`\`

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
```

\`\`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true,
  "tabWidth": 2
}
```

\`\` (Next.js + TS + Tailwind)

```json
{
  "root": true,
  "extends": ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 2) Workspace settings (Cursor / VS Code)

\`\`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "files.eol": "\n",
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"],
  "prettier.requireConfig": true,
  "tailwindCSS.experimental.classRegex": [],
  "typescript.tsserver.maxTsServerMemory": 4096
}
```

### 3) Install extensions (one‑liner for VS Code)

```bash
code --install-extension dbaeumer.vscode-eslint esbenp.prettier-vscode EditorConfig.EditorConfig \
usernamehw.errorlens eamodio.gitlens Gruntfuggly.todo-tree christian-kohler.path-intellisense wix.vscode-import-cost \
bradlc.vscode-tailwindcss heybourn.headwind stylelint.vscode-stylelint Prisma.prisma \
humao.rest-client rangav.vscode-thunder-client Prisma.vscode-graphql 42Crunch.vscode-openapi \
ms-playwright.playwright Orta.vscode-jest ZixuanChen.vitest-explorer aaron-bond.better-comments \
ms-vscode-remote.remote-containers ms-azuretools.vscode-docker yzhang.markdown-all-in-one mushan.vscode-paste-image \
hediet.vscode-drawio pomber.excalidraw-editor bierner.markdown-mermaid mikestead.dotenv
```

### 4) Add `.cursorrules` (guardrails for the AI)

```text
# Project Ground Rules
- Stack: Next.js (App Router), React 18, TypeScript, Tailwind, shadcn/ui, Appwrite SDK.
- Env: Use process.env via .env.local; NEVER hardcode secrets. Do not add new env keys without listing them in .env.example.
- Data: Prefer server actions or /api routes for server code. No client-side secret usage.
- Styling: Tailwind utility-first; prefer shadcn/ui for primitives; run Headwind class sort.
- Quality: ESLint/Prettier must pass; add/adjust tests for changed logic.
- DX: Include a short plan before code changes; then provide a minimal diff-only patch.
- Scope: Only touch files named in the plan; do not refactor unrelated code.
- Commits: Conventional Commits style (feat:, fix:, chore:, docs:, perf:, test:).

# Patterns & Preferences
- Forms => react-hook-form + zod.
- Data fetching => Next.js server components when possible; client hooks only for interactive state.
- State => local component state first; avoid global unless necessary.
- Accessibility: Ensure accessible labels, roles, and keyboard nav.

# Deliverables the Agent Must Return
1) Plan: bullet list of changes with file paths.
2) Patch: unified diff for each file.
3) Notes: any migration steps, new env vars, and test instructions.

# Non-Goals
- Do not switch libraries without an explicit instruction.
- Do not create global singletons or new abstractions unless asked.

# Test
- Add/adjust Playwright or Testing Library tests for changed behavior.
```

### 5) Add design/system docs at repo root

- `ARCHITECTURE.md` — app flow, data boundaries, key directories (1 page)
- `STYLEGUIDE.md` — naming, file structure, commit style, UI tokens/patterns
- `API_NOTES.md` — key endpoints + sample requests/responses (paste from REST/Thunder)

### 6) Create API scratchpads

- Add `/docs/api/*.http` files (VS Code REST Client) to make requests reproducible and copyable in prompts.

### 7) Turn on visual diff & blame

- Use GitLens “Line History” to anchor discussions to exact commits/lines.

### 8) Add a minimal DevContainer (optional, recommended)

- `.devcontainer/devcontainer.json` with Node version + Docker Compose for services (ensures identical environments).

### 9) Add a Playwright smoke test

- One smoke test per critical screen provides an objective pass/fail signal for the AI.

### 10) Add a “debug checklist” in `README.md`

1. Repro steps
2. URL + role/feature flags
3. Console & network traces
4. Screenshot of DOM section (use Paste Image extension)

---

## D) Reusable prompt templates (copy/paste)

> Structure: **Goal → Context → Constraints → Acceptance → Deliverables**. Ask the model to restate in 3 bullets before coding.

### 1) Implement a feature

```text
Goal:
Add a "Join League" CTA to /leagues/[id] that opens a modal and posts to /api/leagues/[id]/join.

Context:
- Tech: Next.js App Router, TypeScript, Tailwind, shadcn/ui, Appwrite SDK.
- Related files: app/leagues/[id]/page.tsx, app/api/leagues/[id]/join/route.ts, components/JoinLeagueDialog.tsx.
- Current bug: No feedback on failure.

Constraints:
- Keep dialog accessible (focus trap, esc to close).
- Use react-hook-form + zod for validation.
- Only modify the three files listed above.

Acceptance:
- Button opens modal; invalid invite shows inline error.
- Successful join redirects to /leagues/[id]?joined=1.
- ESLint/Prettier clean; add a simple Playwright test: sees button, opens modal, form validates.

Deliverables:
1) Short plan with file paths.
2) Unified diffs only.
3) Any new env keys or commands.
```

### 2) Refactor safely

```text
Goal:
Refactor the roster fetch logic into a server action without changing visible behavior.

Context:
- Today it's a client hook calling /api/roster.
- Files: app/teams/[id]/page.tsx, lib/roster.ts, app/actions/roster.ts.

Constraints:
- No extra re-renders; keep types strict.
- Do not touch unrelated components.

Acceptance:
- Same UI; TTI unchanged; tests pass.

Deliverables: plan + diffs.
```

### 3) Bug reproduction & fix

```text
Goal:
Fix "Add to lineup" silently fails on slow networks.

Repro:
1) Open /lineups/[id]
2) Click "Add"
3) See 200 OK but UI doesn’t update for 5–8s.

Evidence:
- Console shows stale TanStack Query cache.
- Network waterfall attached below.

Constraints:
- Keep optimistic update; show a toast on rollback.

Acceptance:
- Under 1000ms UI feedback; rollback toast on server error.

Deliverables: plan + diffs + note which query keys changed.
```

### 4) Design‑to‑code

```text
Goal:
Implement the "Player Card v2" Figma spec (link) using shadcn/ui.

Constraints:
- Tailwind only; no inline styles.
- Match spacing/typography tokens from STYLEGUIDE.md.

Acceptance:
- Visual diff: spacing ±2px max.
- Axe: no violations.
```

---

## E) Daily usage flow (to avoid “lost in translation”)

1. Open the screen in the browser → run axe/Lighthouse; copy results.
2. In Cursor, open and pin the exact files that will change.
3. Paste a prompt template with **Goal/Context/Constraints/Acceptance/Deliverables** and any relevant `.http` requests.
4. Require a **plan first**, then **diffs only**.
5. Run Playwright/Jest smoke; if failing, paste the failure and ask for a **patch-only update** (no re‑plan).

---

**Want this as a starter commit?** Include the configs, `.cursorrules`, API scratchpads, and a README checklist; then apply to your Next/Appwrite routes.



---

## F) Power **Browser** Setup — Extensions & Workflows (Chrome on macOS)

> Goal: make your browser “dev‑grade” so you can see what you see, capture it, and hand it to Cursor/Claude with zero ambiguity.

### 0) Create a dedicated Chrome **Dev Profile** (keeps extensions isolated)

1. Chrome → Profile (top‑right avatar) → **Add** → name it `Dev` → pick a color.
2. In this profile, sign into nothing (optional) so cookies/sessions are clean.
3. Pin your dev tabs as a startup set (chrome://settings/onStartup → **Continue where you left off**).

### 1) Install the **must‑have dev extensions**

1. **React Developer Tools** — inspect component tree/props/hooks.
2. **Redux DevTools** *(if you use Redux)* — time‑travel state.
3. **Apollo Client DevTools / Urql Devtools** *(if you use GraphQL)* — cache/operations.
4. **Web Vitals** — live LCP/CLS/INP overlay while you click.
5. **axe DevTools** — one‑click a11y audits that you can paste into issues.
6. **Lighthouse** *(built‑in: Chrome DevTools → Lighthouse tab)* — perf/PWA/SEO reports.
7. **VisBug** — visual nudge/inspect/measure directly on the page.
8. **CSS Peeper** — extract colors/fonts/assets from a page.
9. **Requestly** *or* **ModHeader** — rewrite URLs/headers; mock APIs w/out changing code.
10. **JSON Formatter** — pretty‑print API responses.
11. **Cookie‑Editor** — view/edit cookies quickly per domain.
12. **Clear Cache** — one‑click cache wipe without nuking cookies.

> Optional but powerful: **Tampermonkey** (run user‑scripts to add debug UI), **Page Ruler Redux** (measure), **Pesticide** (outline boxes to debug layout), **Session Buddy** (save/restore tab sets).

### 2) Turn on key **Chrome DevTools** settings

1. Open DevTools (⌥⌘I) → ⋮ → **Settings**:
   - **Preferences → Network →** ✓ *Disable cache (while DevTools is open)*.
   - **Experiments** (enable) → check **Timeline: Enable advanced paint instrumentation** (if offered).
   - **Console →** ✓ *Show timestamps*; ✓ *Log XMLHttpRequests*.
2. **Performance panel**: add throttling presets *(Slow 3G, 4x CPU)* to reproduce “slow user” bugs.
3. **Coverage** (Ctrl‑P → type “Coverage”) to see unused CSS/JS by route.

### 3) Enable **Local Overrides** (live‑patch files in the browser)

1. DevTools → **Sources → Overrides** → choose a local folder → allow permissions.
2. Now edits to network‑fetched files persist on reload (amazing for quick CSS/JSON tweaks you can copy back to the repo).

### 4) Create **Snippets** (reusable one‑click scripts)

DevTools → **Sources → Snippets → New**. Examples:

- **Outline all elements** (layout debugging):
  ```js
  (() => { const css = '*{outline:1px solid rgba(0,0,0,.1)}';
    const id = 'debug-outline'; let el = document.getElementById(id);
    if (el) el.remove(); else { el = document.createElement('style'); el.id = id; el.textContent = css; document.head.appendChild(el);} })();
  ```
- **Dump current React props (selected node)**:
  ```js
  // Select a node in Elements panel first; $0 is that node
  console.dir($0?.$reactFiber ?? $0);
  ```

### 5) **Network & Mocking** recipes

**A. Redirect prod API → local mock (Requestly)**

1. Create Rule → *Replace Host* → Match: `https://api.example.com/v1/*` → Replace with: `http://localhost:3000/mock/*` → Enable.
2. Add a second rule for **block** analytics (e.g., `https://www.google-analytics.com/*`).

**B. Force auth header (ModHeader)**

1. Add header: `Authorization: Bearer <your-local-token>` when URL matches `localhost:3000/*`.

**C. Reproduce flaky networks**

1. DevTools → **Network** → Throttle to *Offline* or *Slow 3G*.
2. Check your offline/timeout UI states quickly.

### 6) **Performance & a11y** workflow

1. Install **Web Vitals**; browse your app and note worst‑offenders (LCP/CLS spikes).
2. Open DevTools → **Performance Insights**; record a slow interaction.
3. Run **Lighthouse** with *Mobile* preset + *Simulated throttling*.
4. Run **axe**; copy violations into issues with node selectors.

### 7) **Storage/Session** power‑moves

1. DevTools → **Application** tab for Local Storage/Session Storage/IndexedDB inspection & delete per key.
2. Use **Cookie‑Editor** to quickly toggle auth variants (expired token, different roles) without logging in/out.

### 8) **GraphQL/REST** inspection

1. GraphQL: install **Apollo Client DevTools** or **Altair** (extension/app) to test queries against your schema.
2. REST: open a JSON response → **JSON Formatter** highlights/expands; save a raw response to use as a contract fixture.

### 9) Add **in‑app devtool hooks** (so problems are visible)

- **TanStack Query Devtools** (only in dev):
  ```tsx
  // app/providers.tsx
  {process.env.NODE_ENV !== 'production' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
  ```
- **A tiny DevBar**: a fixed div with build SHA, user role, feature flags, and links to `/api/health` & your logs page. Make it togglable via `?devbar=1`.

### 10) **Apple Developer**: Safari & iOS remote web debugging

1. **Enable Develop menu (macOS Safari)**: Safari → Settings → **Advanced** → ✓ *Show Develop menu*.
2. **On iPhone/iPad**: Settings → Safari → **Advanced** → ✓ *Web Inspector*.
3. Connect device via USB (or same Wi‑Fi). Safari menu → **Develop → [Your iPhone] → [Your App’s URL]** to inspect mobile Safari/Chrome WebView.
4. Use **Responsive Design Mode** (⌥⌘R) for quick viewport/device tests.

### 11) Device‑level network debugging (optional, powerful)

- **Proxyman** or **Charles Proxy**: intercept HTTPS traffic from iOS Simulator/Device to see requests, latency, and errors.\
  **Steps (high level)**: install → enable HTTPS proxy → trust certificate on simulator/device → set Wi‑Fi proxy to your Mac → watch requests; export HAR and paste into issues.

### 12) Daily **browser‑first** debugging loop

1. Repro in the **Dev Profile** with **Disable Cache** on.
2. Capture **HAR** (Network → Export HAR) + **Console** (Save as).
3. Run **Web Vitals + Lighthouse + axe** → paste summaries into your issue/prompt.
4. If API related: flip **Requestly** to point at mocks and test both success/failure.
5. Hand the package (HAR + Console + screenshots + exact URL/role) to Cursor/Claude using the prompt template in Section D.

### Troubleshooting

- Seeing inconsistent CSS? Clear **Local Overrides** or disable **Headless experimental features** you toggled.
- SPA route not updating after code push? Hard reload (Cmd‑Shift‑R) with DevTools open; also clear **Application → Cache Storage**.

---

## G) (Optional) iOS Simulator + Xcode **for web**

1. Install **Xcode** → open **iOS Simulator**.
2. Launch Safari inside the simulator → open your app → Safari on macOS → **Develop → Simulator** to inspect.
3. Use **Features → Slow Animations** and **Debug → Color Blended Layers** to spot repaint hotspots.
4. Combine with **Proxyman/Charles** (above) for end‑to‑end web perf tracing on “mobile”.

---

## H) Quick checklist (paste into your README)

-

---

## I) Extension publishers (canonical IDs)

> Use these to ensure you’re installing the **correct** items.

### VS Code / Cursor Marketplace

(Name — **Publisher** — Marketplace ID)

- ESLint — **dbaeumer** — `dbaeumer.vscode-eslint`
- Prettier — **esbenp** — `esbenp.prettier-vscode`
- EditorConfig — **EditorConfig** — `EditorConfig.EditorConfig`
- Error Lens — **usernamehw** — `usernamehw.errorlens`
- GitLens — **eamodio** — `eamodio.gitlens`
- TODO Tree — **Gruntfuggly** — `Gruntfuggly.todo-tree`
- Path Intellisense — **christian-kohler** — `christian-kohler.path-intellisense`
- Import Cost — **wix** — `wix.vscode-import-cost`
- DotENV — **mikestead** — `mikestead.dotenv`
- Tailwind CSS IntelliSense — **bradlc** — `bradlc.vscode-tailwindcss`
- Headwind — **heybourn** — `heybourn.headwind`
- Stylelint — **stylelint** — `stylelint.vscode-stylelint`
- ES7+ React Snippets — **dsznajder** — `dsznajder.es7-react-js-snippets`
- Prisma — **Prisma** — `Prisma.prisma`
- REST Client — **humao** — `humao.rest-client`
- Thunder Client — **rangav** — `rangav.vscode-thunder-client`
- GraphQL — **Prisma** — `Prisma.vscode-graphql`
- OpenAPI (Swagger) Viewer — **42Crunch** — `42Crunch.vscode-openapi`
- Playwright Test — **ms-playwright** — `ms-playwright.playwright`
- Jest — **Orta** — `Orta.vscode-jest`
- Vitest — **ZixuanChen** — `ZixuanChen.vitest-explorer`
- Better Comments — **aaron-bond** — `aaron-bond.better-comments`
- Dev Containers — **ms-vscode-remote** — `ms-vscode-remote.remote-containers`
- Docker — **ms-azuretools** — `ms-azuretools.vscode-docker`
- Markdown All in One — **yzhang** — `yzhang.markdown-all-in-one`
- Paste Image — **mushan** — `mushan.vscode-paste-image`
- Draw\.io Integration — **hediet** — `hediet.vscode-drawio`
- Excalidraw Editor — **pomber** — `pomber.excalidraw-editor`
- Mermaid Markdown — **bierner** — `bierner.markdown-mermaid`

### Chrome/Edge Browser Extensions

(Name — **Publisher** on the store)

- React Developer Tools — **Meta (Meta Platforms, Inc.)**
- Redux DevTools — **Redux DevTools**
- Apollo Client Devtools — **Apollo Graph, Inc.**
- (Optional) GraphQL Network Inspector — **warrenjday**
- axe DevTools — **Deque Systems Inc.**
- WAVE Evaluation Tool — **WebAIM**
- VisBug — **Google Ireland Ltd.**
- CSS Peeper — **Sparkglare Sp. Z o.o.**
- Requestly — **Requestly** (now part of BrowserStack)
- ModHeader — **ModHeader (modheader.com)**
- JSON Formatter — **Callum Locke**
- Cookie-Editor — **Cookie-Editor (cookie-editor.com)**
- Clear Cache — **Little Void LLC**
- Tampermonkey — **Tampermonkey (tampermonkey.net)**
- Lighthouse — **Built into Chrome DevTools (Google)**
- Web Vitals — *(retired; merged into DevTools Performance panel)*

### How to verify before installing (30s)

1. Open the item in the Chrome Web Store or VS Code Marketplace.
2. Check **“Offered by / Developer”** matches the publisher above.
3. Sanity‑check **user count** and **recent update date** to avoid clones.
4. Prefer the items linked from the official docs/GitHub when in doubt.



---

## J) Smart VS Code/Cursor installer (auto‑detect + idempotent)

> This script inspects your repo (deps/files) and installs only the **necessary** extensions. It skips ones you already have and supports both **Cursor** and **VS Code** CLIs.

### 1) Save this file as `scripts/install_editor_extensions.sh`

````bash
#!/usr/bin/env bash
set -euo pipefail
shopt -s globstar nullglob

DRY_RUN=false
VERBOSE=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    -v|--verbose) VERBOSE=true ;;
  esac
  shift
done

# Pick Cursor first, then VS Code
EDITOR_BIN=""
if command -v cursor >/dev/null 2>&1; then EDITOR_BIN="cursor";
elif command -v code >/dev/null 2>&1; then EDITOR_BIN="code";
elif command -v code-insiders >/dev/null 2>&1; then EDITOR_BIN="code-insiders";
else
  echo "❌ Neither 'cursor' nor 'code' CLI found. In Cursor/VS Code, run: ‘Shell Command: Install … in PATH’." >&2
  exit 1
fi

ROOT="$(pwd)"
pkg="$ROOT/package.json"

have_ext() { "$EDITOR_BIN" --list-extensions | grep -i -q "^$1$"; }
add_ext() { EXTS+=("$1"); }

EXTS=()
# --- Baseline essentials ---
add_ext "dbaeumer.vscode-eslint"
add_ext "esbenp.prettier-vscode"
add_ext "EditorConfig.EditorConfig"
add_ext "usernamehw.errorlens"
add_ext "eamodio.gitlens"
add_ext "mikestead.dotenv"
add_ext "yzhang.markdown-all-in-one"

# Helpers
has_dep() { [[ -f "$pkg" ]] && grep -q "\"$1\"" "$pkg"; }
has_any_file() { for f in "$@"; do [[ -e "$ROOT/$f" ]] && return 0; done; return 1; }
has_glob() { compgen -G "$1" >/dev/null 2>&1; }

# Tailwind
if has_dep "tailwindcss" || has_any_file "tailwind.config.js" "tailwind.config.ts"; then
  add_ext "bradlc.vscode-tailwindcss"
  add_ext "heybourn.headwind"
fi

# Stylelint
if has_dep "stylelint" || has_any_file ".stylelintrc" ".stylelintrc.json" ".stylelintrc.js" ".stylelintrc.cjs" "stylelint.config.js" "stylelint.config.cjs"; then
  add_ext "stylelint.vscode-stylelint"
fi

# Prisma
if has_dep "prisma" || has_any_file "prisma/schema.prisma"; then
  add_ext "Prisma.prisma"
fi

# GraphQL
if has_dep "graphql" || has_glob "**/*.graphql" || has_glob "**/*.gql"; then
  add_ext "Prisma.vscode-graphql"
fi

# REST tooling
if has_glob "**/*.http" || has_any_file "docs/api/example.http"; then
  add_ext "humao.rest-client"
fi
if [[ -d ".vscode/thunder-client" ]]; then
  add_ext "rangav.vscode-thunder-client"
fi

# OpenAPI specs
if has_glob "**/openapi.json" || has_glob "**/openapi.yaml" || has_glob "**/openapi.yml" || has_glob "**/*openapi*.json" || has_glob "**/*openapi*.y?(a)ml"; then
  add_ext "42Crunch.vscode-openapi"
fi

# Testing
if has_dep "@playwright/test" || has_any_file "playwright.config.ts" "playwright.config.js"; then
  add_ext "ms-playwright.playwright"
fi
if has_dep "jest" || has_any_file "jest.config.ts" "jest.config.js"; then
  add_ext "Orta.vscode-jest"
fi
if has_dep "vitest" || has_any_file "vitest.config.ts" "vitest.config.js"; then
  add_ext "ZixuanChen.vitest-explorer"
fi
add_ext "aaron-bond.better-comments"

# Docker / Dev Containers
if has_any_file ".devcontainer/devcontainer.json"; then
  add_ext "ms-vscode-remote.remote-containers"
fi
if has_any_file "Dockerfile" "docker-compose.yml" "compose.yaml"; then
  add_ext "ms-azuretools.vscode-docker"
fi

# Docs & diagrams
if has_glob "**/*.drawio" || has_glob "**/*.drawio.png"; then
  add_ext "hediet.vscode-drawio"
fi
if has_glob "**/*.excalidraw"; then
  add_ext "pomber.excalidraw-editor"
fi
if grep -R --include="*.md" -n "```mermaid" . >/dev/null 2>&1; then
  add_ext "bierner.markdown-mermaid"
fi
if [[ -d "docs" || -d "documentation" ]]; then
  add_ext "mushan.vscode-paste-image"
fi

# JS/TS convenience
if has_dep "typescript" || has_glob "**/*.ts" || has_glob "**/*.tsx" || has_glob "**/*.js" || has_glob "**/*.jsx"; then
  add_ext "christian-kohler.path-intellisense"
  add_ext "wix.vscode-import-cost"
fi

# TODO surfaces
if grep -R -n -E "TODO|FIXME" --include="*.{ts,tsx,js,jsx,md}" . >/dev/null 2>&1; then
  add_ext "Gruntfuggly.todo-tree"
fi

# De-dup
mapfile -t EXTS < <(printf "%s
" "${EXTS[@]}" | awk '!x[$0]++')

echo "Detected editor CLI: $EDITOR_BIN"
echo "Repository: $ROOT"
echo "Proposed extensions (${#EXTS[@]}):"
printf "  - %s
" "${EXTS[@]}"

TO_INSTALL=()
for ext in "${EXTS[@]}"; do
  if have_ext "$ext"; then
    [[ "$VERBOSE" == "true" ]] && echo "Already installed: $ext"
  else
    TO_INSTALL+=("$ext")
  fi
done

if [[ ${#TO_INSTALL[@]} -eq 0 ]]; then
  echo "✅ All detected extensions already installed."
  exit 0
fi

echo "Missing extensions (${#TO_INSTALL[@]}):"
printf "  - %s
" "${TO_INSTALL[@]}"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "(dry-run) Skipping installation."
  exit 0
fi

for ext in "${TO_INSTALL[@]}"; do
  echo "Installing $ext …"
  "$EDITOR_BIN" --install-extension "$ext" || {
    echo "⚠️ Failed to install $ext" >&2
  }
done

echo "🎉 Done."
````

### 2) Make it executable

```bash
chmod +x scripts/install_editor_extensions.sh
```

### 3) Optional: add an npm script

```json
// package.json
{
  "scripts": {
    "ide:exts": "scripts/install_editor_extensions.sh",
    "ide:exts:dry": "scripts/install_editor_extensions.sh --dry-run",
    "ide:exts:verbose": "scripts/install_editor_extensions.sh --dry-run --verbose"
  }
}
```

### 4) Run it (recommended dry run first)

```bash
# See what it *would* install
npm run ide:exts:dry

# Then actually install
npm run ide:exts
```

### 5) Troubleshooting

1. **CLI not found**: In Cursor/VS Code run the command palette → `Shell Command: Install 'cursor' command in PATH` (or `'code'` for VS Code). Re‑open your terminal.
2. **Corporate network**: If behind a proxy, set `HTTP_PROXY/HTTPS_PROXY` env vars before running.
3. **False positives**: If you don’t want a category, temporarily create an empty `.no-<tool>` file (e.g., `.no-openapi`) and add a quick `if` guard to the script.

---

### Prompt for Cursor to “decide” with context

Copy/paste this into Cursor when running the dry‑run so it can trim categories further based on your current tasks:

```text
You are my IDE copilot. Given the dry-run output below and our current tasks (Next.js + Appwrite), remove any extensions that don’t add near-term value. Keep only what improves our DX for:
- Next App Router + TypeScript + Tailwind
- Testing (Playwright or Vitest) for changed pages
- API work (REST Client if .http files present)
- Prisma/GraphQL only if we actively use them this sprint
Return: a bullet list of the final extensions you want installed and a rationale (1 line each). Then output the exact CLI commands to install missing ones.

Dry run output:
<PASTE TERMINAL OUTPUT HERE>
```

