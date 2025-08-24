export function log(event: string, payload?: unknown) {
  try {
    console.log(`[api] ${event}`, payload ?? "");
  } catch {}
}
