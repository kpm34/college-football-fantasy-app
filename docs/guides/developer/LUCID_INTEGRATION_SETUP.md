# Lucid Integration Setup (Cursor Instructions)

This guide explains how to generate diagrams in Cursor and upload them into Lucid. No code integration is added yet; this is a workflow guide you can follow today.

## 1. Auth Setup
- Open the Lucid Developer Portal: https://lucid.co/developers
- Create an OAuth app or request an API token (whichever is enabled for your account).
- Copy your credentials.
- Add them to `.env.local` (and Vercel env later if needed):

```env
# Choose one path below based on what Lucid enables for your account

# OAuth App (recommended)
LUCID_CLIENT_ID=
LUCID_CLIENT_SECRET=
# Local callback we may use later for testing (not needed yet):
LUCID_REDIRECT_URI=http://localhost:3001/api/lucid/oauth/callback

# Or: Token / API Key (if provided by Lucid)
LUCID_TOKEN=
```

## 2. Generate Diagrams in Cursor
You have two common options:

- Mermaid (text → SVG/PNG)
  - Author a Mermaid code block in a doc or component.
  - Render locally (we already have a `MermaidRenderer` for internal pages).
  - Export as SVG (preferred for Lucid) or PNG.

- Design/Diagram tools
  - Draw.io / Figma / Spline exports → SVG/PNG.
  - Keep assets under `docs/diagrams/` or a dedicated `/assets/diagrams/` folder.

Tips
- Prefer SVG for crisp diagrams in Lucid.
- Keep file names stable and descriptive (e.g., `system-architecture-overview.svg`).

## 3. Upload to Lucid
- Manual upload (UI):
  1) Open Lucid, create/open a document.
  2) Use Import/Place Image to add your exported SVG/PNG.
  3) Organize into pages/folders.

- (Optional) API-based upload (later):
  - Once API access is approved and OAuth is configured, we can add a server route to upload or attach exported diagrams programmatically.

## 4. Verify & Iterate
- Check rendering fidelity (fonts, arrowheads, line joins).
- Test zoom levels and print/export from Lucid to ensure SVG scales well.
- Keep a change log note in the doc/page description with a short summary (date, source commit/PR).

## 5. Source of Truth & Organization
- Architecture/ADR diagrams originate from our repo; Lucid stores curated/cleaned presentation versions.
- Keep a backlink in Lucid (doc/page description) to the source path in the repo when possible.
- Use consistent naming between repo file and Lucid page.

## 6. Security & Scope
- Do not paste secrets or internal IDs into diagram text.
- Limit Lucid permissions to editors who need it.
- If/when we add OAuth integration, tokens will remain server-side only.

## 7. Troubleshooting
- Fonts look off: convert text to compatible fonts or outline in source (last resort).
- Overflows/clipping in Lucid: adjust the canvas page size or scale SVG before import.
- Large SVGs: consider splitting across pages or simplifying paths.

## References
- Lucid Developer Docs: https://developer.lucid.co/docs/welcome
- Lucid extensions samples: https://github.com/lucidsoftware/sample-lucid-extensions
- Mermaid: https://mermaid.js.org/
- Our internal Mermaid renderer: see `components/docs/MermaidRenderer.tsx`
