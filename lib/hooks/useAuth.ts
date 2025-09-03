import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  $id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Check if we just completed OAuth
    if (typeof window !== 'undefined') {
      const oauthSuccess = document.cookie.includes('oauth_success=true');
      if (oauthSuccess) {
        // Clear the cookie
        document.cookie = 'oauth_success=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Force auth check to sync server-side session
        checkAuth();
      }
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Try the new check endpoint first
      const checkResponse = await fetch('/api/auth/check', { 
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.authenticated && checkData.user) {
          setUser({
            $id: checkData.user.id,
            email: checkData.user.email,
            name: checkData.user.name
          } as any);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to original endpoint
      const response = await fetch('/api/auth/user', { 
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const payload = await response.json();
        // Handle both shapes: { success: true, data: {...} } and direct user object
        const normalized = payload?.data
          ? { $id: payload.data.$id || payload.data.id, email: payload.data.email, name: payload.data.name }
          : { $id: payload.$id || payload.id, email: payload.email, name: payload.name };
        setUser(normalized as any);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear user state immediately
      setUser(null);
      setLoading(true);
      
      // Call logout API
      await fetch('/api/auth/logout', { 
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // Re-check auth state to ensure server-side session is cleared
      await checkAuth();
      
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if logout request fails
      setUser(null);
      setLoading(false);
      router.push('/');
    }
  };

  return { user, loading, logout, checkAuth };
}
