# VS Code Extensions Guide for College Football Fantasy App

This guide covers the recommended VS Code extensions for enhanced development experience with AI assistants like Claude and Cursor.

## 🚀 Quick Installation

Run this command to install all recommended extensions at once:

```bash
code --install-extension dbaeumer.vscode-eslint \
  --install-extension esbenp.prettier-vscode \
  --install-extension usernamehw.errorlens \
  --install-extension Gruntfuggly.todo-tree \
  --install-extension humao.rest-client \
  --install-extension aaron-bond.better-comments \
  --install-extension eamodio.gitlens \
  --install-extension bradlc.vscode-tailwindcss \
  --install-extension Prisma.prisma \
  --install-extension ms-playwright.playwright \
  --install-extension yzhang.markdown-all-in-one \
  --install-extension christian-kohler.path-intellisense \
  --install-extension wix.vscode-import-cost \
  --install-extension mikestead.dotenv \
  --install-extension hediet.vscode-drawio \
  --install-extension bierner.markdown-mermaid
```

## 📦 Extension Details & Usage

### 1. **Error Lens** (`usernamehw.errorlens`)
Shows errors and warnings inline as you type, making issues immediately visible.

**Configuration**:
```json
{
  "errorLens.enabled": true,
  "errorLens.errorBackground": "rgba(240,0,0,0.1)",
  "errorLens.warningBackground": "rgba(255,220,0,0.1)",
  "errorLens.infoBackground": "rgba(0,150,255,0.1)"
}
```

**Usage**:
- Errors appear as colored highlights in your code
- Hover for full error details
- Click the lightbulb for quick fixes

### 2. **TODO Tree** (`Gruntfuggly.todo-tree`)
Finds and organizes all TODO, FIXME, HACK, and custom tags in your codebase.

**Configuration**:
```json
{
  "todo-tree.general.tags": [
    "TODO",
    "FIXME",
    "HACK",
    "BUG",
    "OPTIMIZE",
    "REFACTOR",
    "[ ]",
    "[x]"
  ],
  "todo-tree.highlights.customHighlight": {
    "BUG": {
      "icon": "bug",
      "foreground": "#ff0000"
    },
    "OPTIMIZE": {
      "icon": "rocket",
      "foreground": "#00ff00"
    },
    "REFACTOR": {
      "icon": "tools",
      "foreground": "#ffaa00"
    }
  }
}
```

**Usage**:
```typescript
// TODO: Implement user authentication
// FIXME: Handle edge case when draft timer expires
// BUG: OAuth redirect loop on production
// OPTIMIZE: Query is slow with 1000+ players
// REFACTOR: Extract this into a custom hook
```

### 3. **REST Client** (`humao.rest-client`)
Test APIs directly in VS Code without leaving your editor.

**Create API test files**: `/docs/api/test-endpoints.http`

```http
### Variables
@baseUrl = http://localhost:3001
@token = {{$dotenv APPWRITE_SESSION_TOKEN}}

### Health Check
GET {{baseUrl}}/api/health

### Create League
POST {{baseUrl}}/api/leagues/create
Content-Type: application/json
Cookie: appwrite-session={{token}}

{
  "name": "Test League",
  "maxTeams": 10,
  "scoringType": "standard",
  "draftType": "snake"
}

### Get League Details
GET {{baseUrl}}/api/leagues/{{leagueId}}
Cookie: appwrite-session={{token}}

### OAuth Test
GET https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google
  ?project=college-football-fantasy-app
  &success=http://localhost:3001/dashboard
  &failure=http://localhost:3001/login
```

**Usage**:
- Click "Send Request" above each request
- View responses in split pane
- Save common requests for quick testing
- Share `.http` files with team

### 4. **Better Comments** (`aaron-bond.better-comments`)
Highlights different types of comments with colors.

**Usage**:
```typescript
// ! Important: This must run before authentication
// ? Should we cache this response?
// TODO: Add error handling
// * Highlighted information
// // Deprecated code - remove in v2
```

### 5. **GitLens** (`eamodio.gitlens`)
Supercharges Git capabilities with inline blame, history, and more.

**Key Features**:
- See who changed each line and when
- View commit messages inline
- Compare branches and commits
- Interactive rebase support

**Usage**:
- Hover over any line to see last change
- Click blame annotations for full history
- Use Command Palette: "GitLens: Show Commit Details"

### 6. **Path Intellisense** (`christian-kohler.path-intellisense`)
Autocompletes filenames and paths as you type imports.

**Usage**:
```typescript
import { Component } from './comp<autocomplete shows options>'
import { useAuth } from '@lib/ho<autocomplete shows hooks folder>'
```

### 7. **Import Cost** (`wix.vscode-import-cost`)
Shows the size of imported packages inline.

**Example**:
```typescript
import { format } from 'date-fns'; // 2.3K (gzipped: 0.9K)
import _ from 'lodash'; // 71.5K (gzipped: 25.2K) ⚠️
```

### 8. **DotENV** (`mikestead.dotenv`)
Syntax highlighting and validation for `.env` files.

**Features**:
- Syntax highlighting
- Hover for variable usage
- Go to definition support
- Validation warnings

### 9. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
Autocomplete, syntax highlighting, and linting for Tailwind CSS.

**Usage**:
```tsx
<div className="flex items-center justify-between p-4 bg-amber-100 hover:bg-amber-200">
  {/* Autocompletes class names and shows color previews */}
</div>
```

### 10. **Playwright Test** (`ms-playwright.playwright`)
Run and debug Playwright tests directly in VS Code.

**Usage**:
- Click play button next to tests
- Set breakpoints in tests
- View test results in sidebar
- Generate tests with recording

## 📋 Workspace Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "files.eol": "\n",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"],
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "todo-tree.filtering.excludeGlobs": ["**/node_modules", "**/.next"],
  "errorLens.excludePatterns": ["node_modules/**"],
  "rest-client.environmentVariables": {
    "$shared": {
      "baseUrl": "http://localhost:3001",
      "prodUrl": "https://cfbfantasy.app"
    }
  }
}
```

## 🎯 AI Assistant Integration

These extensions enhance AI assistant capabilities:

1. **Error Lens**: AI can see errors immediately without running commands
2. **TODO Tree**: AI can find all pending tasks across the codebase
3. **REST Client**: AI can test APIs and see real responses
4. **Better Comments**: AI can understand comment priorities
5. **GitLens**: AI can understand code history and changes

## 💡 Pro Tips

1. **Combine Extensions**: Use REST Client + TODO Tree to track API testing tasks
2. **Custom Shortcuts**: Map frequently used commands (e.g., "Send Request") to keyboard shortcuts
3. **Extension Sync**: Enable Settings Sync to share config across machines
4. **AI Context**: Include `.http` files in prompts for API context
5. **Performance**: Disable unused extensions per workspace

## 🔧 Troubleshooting

### Extension not working?
1. Reload window: `Cmd+Shift+P` → "Developer: Reload Window"
2. Check extension is enabled for workspace
3. Update VS Code and extensions
4. Check extension output panel for errors

### Performance issues?
1. Disable extensions one by one to find culprit
2. Increase TypeScript memory: `"typescript.tsserver.maxTsServerMemory": 8192`
3. Exclude large folders from watchers

### REST Client variables not working?
1. Ensure `.env` file exists with required variables
2. Install REST Client environment variables
3. Use `{{$dotenv VARIABLE_NAME}}` syntax

## 📚 Additional Resources

- [VS Code Tips and Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
- [Extension API](https://code.visualstudio.com/api)
- [Workspace Recommendations](https://code.visualstudio.com/docs/editor/extension-marketplace#_workspace-recommended-extensions)

---

**Note**: This guide is optimized for AI-assisted development. When working with Claude or Cursor, reference specific extensions to enhance their capabilities.