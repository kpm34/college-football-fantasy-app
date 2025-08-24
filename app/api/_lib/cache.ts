export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { retries = 2, backoffMs = 200 }: { retries?: number; backoffMs?: number } = {}
) {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(input, init);
      return res;
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise(r => setTimeout(r, backoffMs * (i + 1)));
    }
  }
  throw lastErr;
}
