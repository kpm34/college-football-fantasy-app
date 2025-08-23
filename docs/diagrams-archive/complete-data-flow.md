# Complete Data Flow

```mermaid
graph TD
  Client --> API
  API --> DB[(Appwrite)]
  API --> KV[(Vercel KV)]
  Jobs[Crons] --> API
```
