<<<<<<< HEAD
import driveManifestJson from '@docs/external/drive-manifest.json'
=======
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
export type DriveManifest = {
  folderId: string
  folderUrl: string
  notes?: string
  files: Record<
    string,
    { type: 'file' | 'folder'; id?: string; name?: string; description?: string }
  >
}

let cached: DriveManifest | null = null

export function getDriveManifest(): DriveManifest | null {
  try {
    if (cached) return cached
<<<<<<< HEAD
    const json = driveManifestJson as DriveManifest
    cached = json
    return json
=======
    const data = JSON.parse(
      // Use fs only on server; fall back to dynamic import when bundled for edge
      // but both resolve to the same JSON content at build time
      typeof process !== 'undefined' && process.cwd
        ? require('fs').readFileSync(
            require('path').join(process.cwd(), 'docs/external/drive-manifest.json'),
            'utf-8'
          )
        : '{}'
    ) as DriveManifest
    cached = data
    return data
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
  } catch {
    return null
  }
}

export function driveFileUrlById(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`
}

export function driveViewerUrlById(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`
}

export function driveUrlByAlias(alias: string, viewer = false): string | null {
  const man = getDriveManifest()
  if (!man) return null
  const entry = man.files[alias]
  if (!entry || entry.type !== 'file' || !entry.id) return null
  return viewer ? driveViewerUrlById(entry.id) : driveFileUrlById(entry.id)
}

export function driveFolderUrlById(folderId: string): string {
  return `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}?usp=sharing`
}

export function driveFolderUrlByAlias(alias: string): string | null {
  const man = getDriveManifest()
  if (!man) return null
  const entry = man.files[alias]
  if (!entry || entry.type !== 'folder' || !entry.id) return null
  return driveFolderUrlById(entry.id)
}
