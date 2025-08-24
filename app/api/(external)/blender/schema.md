Collection: `blender_jobs`

Attributes
- status: string (QUEUED|RUNNING|FAILED|COMPLETE)
- inputGlbUrl: string (url)
- outputGlbUrl: string (url, optional)
- prompt: string
- ops: string (JSON)
- teamId: string (optional)
- error: string (optional)
- createdAt: datetime
- startedAt: datetime (optional)
- updatedAt: datetime (optional)

Indexes
- status key index
- createdAt descending


