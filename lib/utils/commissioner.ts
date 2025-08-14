function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesClose(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const an = normalizeName(a);
  const bn = normalizeName(b);
  if (!an || !bn) return false;
  if (an === bn) return true;
  if (an.includes(bn) || bn.includes(an)) return true; // substring match like 'kash' in 'kashyap'

  const [af, ...alParts] = an.split(' ');
  const [bf, ...blParts] = bn.split(' ');
  const al = alParts.at(-1) || '';
  const bl = blParts.at(-1) || '';

  // First-name startsWith and same last name
  const firstClose = af.startsWith(bf) || bf.startsWith(af);
  const lastMatch = !!al && !!bl && al === bl;
  return firstClose && lastMatch;
}

export function isUserCommissioner(league: any, user: any): boolean {
  if (!league || !user) return false;
  const norm = (s: any) => String(s ?? '').trim().toLowerCase();

  const leagueCandidates = [
    league.commissionerId,
    league.commissioner,
    league.commissionerEmail,
    league.commissioner_id,
    league.commissioner_email,
    league.ownerId,
    league.owner,
    league.createdBy,
    league.created_by,
  ].filter(Boolean);

  const userCandidates = [user.$id, (user as any).email, (user as any).name].filter(Boolean) as string[];

  // Direct id/email/name match
  if (leagueCandidates.some((val: string) => userCandidates.map(norm).includes(norm(val)))) return true;

  // Fuzzy name-only fallback (e.g., 'Kash Maheshwari' vs 'Kashyap Maheshwari')
  const leagueName = league.commissioner || league.commissioner_name;
  const userName = (user as any).name;
  if (namesClose(leagueName, userName)) return true;

  return false;
}

export function debugCommissionerMatch(league: any, user: any) {
  try {
    const norm = (s: any) => String(s ?? '').trim().toLowerCase();
    const leagueCandidates = [
      league?.commissionerId,
      league?.commissioner,
      league?.commissionerEmail,
      league?.commissioner_id,
      league?.commissioner_email,
      league?.ownerId,
      league?.owner,
      league?.createdBy,
      league?.created_by,
    ].filter(Boolean);
    const userCandidates = [user?.$id, user?.email, user?.name].filter(Boolean) as string[];
    // eslint-disable-next-line no-console
    console.log('[CommishDebug] leagueIds:', leagueCandidates, 'userIds:', userCandidates);
    // eslint-disable-next-line no-console
    console.log('[CommishDebug] normalized compare:', leagueCandidates.map(norm), userCandidates.map(norm));
  } catch {}
}


