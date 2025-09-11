import driveManifestJson from '@docs/external/drive-manifest.json'
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
    const json = driveManifestJson as DriveManifest
    cached = json
    return json
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
