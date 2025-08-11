import { Account, Client } from 'appwrite';
import { APPWRITE_PUBLIC_CONFIG as APPWRITE_CONFIG } from './appwrite-config';

// Check if we're in production and need to use the proxy
const isProduction = process.env.NODE_ENV === 'production' && typeof window !== 'undefined';
const needsProxy = isProduction && window.location.hostname.includes('cfbfantasy.app');

class ProxyAccount extends Account {
  async createSession(email: string, password: string) {
    if (needsProxy) {
      const response = await fetch('/api/auth/proxy?path=/account/sessions/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    }
    
    // Fall back to normal Appwrite SDK
    return super.createEmailPasswordSession(email, password);
  }
  
  async get() {
    if (needsProxy) {
      const response = await fetch('/api/auth/proxy?path=/account', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    }
    
    // Fall back to normal Appwrite SDK
    return super.get();
  }
  
  async deleteSession(sessionId: string = 'current') {
    if (needsProxy) {
      const response = await fetch(`/api/auth/proxy?path=/account/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    }
    
    // Fall back to normal Appwrite SDK
    return super.deleteSession(sessionId);
  }
  
  // Override the old method name for backward compatibility
  async createEmailPasswordSession(email: string, password: string) {
    return this.createSession(email, password);
  }
}

// Create a proxy-aware client
export function createProxyAwareClient() {
  const client = new Client();
  
  client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  
  // Enable cookie fallback
  // @ts-ignore - method exists in browser SDK
  if (typeof (client as any).setCookieFallback === 'function') {
    (client as any).setCookieFallback(true);
  }
  
  return client;
}

// Export a proxy-aware account instance
export function createProxyAwareAccount() {
  const client = createProxyAwareClient();
  return new ProxyAccount(client);
}
