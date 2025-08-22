"use client"
export function useClipboard() {
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); return true } catch { return false }
  }
  return { copy }
}
