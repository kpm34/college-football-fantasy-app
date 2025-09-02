export type AnyLeague = Record<string, any> | null | undefined;

export function normalizeLeague(raw: AnyLeague): AnyLeague {
  if (!raw || typeof raw !== 'object') return raw;
  // Ensure id is present for UI, derived from $id if needed
  const id = (raw as any).id ?? (raw as any).$id;
  const name = (raw as any).name ?? (raw as any).leagueName;
  return { id, $id: (raw as any).$id ?? id, name, ...raw } as any;
}

export function normalizeLeagues(list: AnyLeague[]): AnyLeague[] {
  return (list || []).map(normalizeLeague) as any[];
}


