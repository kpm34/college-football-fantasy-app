# External Docs & Assets (Google Drive)

This folder documents external files stored in Google Drive so we can reference them from code, docs, and admin tools without crowding the repo.

## How it works

- Keep the shared Drive folder public to "Anyone with the link" (view).
- Add file IDs to `drive-manifest.json` with a short, stable alias.
- Reference files using either:
  - Direct link (download): `https://drive.google.com/uc?export=download&id=<FILE_ID>`
  - Viewer link: `https://drive.google.com/file/d/<FILE_ID>/view`
  - Alias in docs: `drive://<alias>` (future-friendly; resolved via manifest)

## Drive Manifest

See `docs/external/drive-manifest.json` for the canonical list of Drive files. Update it when you add or move files in Drive.

## Why

- Keep repository lean while allowing reproducible references to large assets (PDFs, CSVs, videos).
- Enables server-side fetch/proxy when needed (e.g., converting PDFs to Markdown).
