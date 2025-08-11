import { Client, Databases, Account, Avatars } from 'appwrite';
import { APPWRITE_PUBLIC_CONFIG as APPWRITE_CONFIG } from './appwrite-config';
import { DATABASE_ID, COLLECTIONS } from './appwrite-config';
import { createProxyAwareAccount } from './appwrite-proxy';

// Initialize Appwrite client for frontend (NO API KEY - uses session auth)
const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Enable cookie fallback to support Safari/third‑party cookie restrictions
// @ts-ignore - method exists in browser SDK
if (typeof (client as any).setCookieFallback === 'function') {
  (client as any).setCookieFallback(true);
}

// Export Appwrite services
export const databases = new Databases(client);

// In production on our public domains, use a proxy-aware account to avoid CORS.
// We resolve this at call-time using a JS Proxy so SSR imports don't lock the choice.
function chooseAccount(): Account {
  const isBrowser = typeof window !== 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';
  const hostname = isBrowser ? window.location.hostname : '';
  const onProdDomain =
    /(^|\.)cfbfantasy\.app$/.test(hostname) || /(^|\.)collegefootballfantasy\.app$/.test(hostname);

  if (isBrowser && isProduction && onProdDomain) {
    return createProxyAwareAccount() as unknown as Account;
  }
  return new Account(client);
}

export const account: Account = new Proxy({} as Account, {
  get(_target, prop: keyof Account) {
    const real = chooseAccount() as any;
    const value = real[prop as any];
    return typeof value === 'function' ? value.bind(real) : value;
  },
}) as Account;
export const avatars = new Avatars(client);
export { client };

// Re-export configuration for backward compatibility
export { DATABASE_ID, COLLECTIONS };

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_SESSIONS}.documents`,
  PLAYER_PROJECTIONS: () => `databases.${DATABASE_ID}.collections.${COLLECTIONS.PLAYER_PROJECTIONS}.documents`
};

export default client;