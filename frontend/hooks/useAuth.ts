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
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
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
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { user, loading, logout, checkAuth };
}
