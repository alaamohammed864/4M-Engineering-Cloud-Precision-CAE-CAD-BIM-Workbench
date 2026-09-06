// Real client-side authentication (closes the gap: the backend has
// required JWT auth on solver-run/save/geometry routes since Priority 5,
// but no frontend code ever obtained or sent a token - every real solve
// call was silently 401ing and falling back to the analytical formula).
import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'cae_cloud_token';
const USER_KEY = 'cae_cloud_user';

export interface AuthUser {
  id: number;
  email: string;
  role: 'ADMIN' | 'ENGINEER' | 'VIEWER';
}

function loadStoredAuth(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    return { token, user: userRaw ? JSON.parse(userRaw) : null };
  } catch {
    return { token: null, user: null };
  }
}

function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function registerGuest(): Promise<{ token: string; user: AuthUser }> {
  const email = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@cae-cloud.local`;
  const password = Math.random().toString(36).slice(2, 14) + 'A1!';
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'ENGINEER' }),
  });
  if (!res.ok) throw new Error('Guest auto-registration failed');
  return res.json();
}

export function useAuth() {
  const [{ token, user }, setState] = useState(loadStoredAuth);
  const [isBootstrapping, setIsBootstrapping] = useState(!loadStoredAuth().token);

  // Auto-provision a guest ENGINEER account on first visit so solver runs
  // work out of the box without forcing manual signup - the person can
  // still sign in with a real account any time via login()/register().
  useEffect(() => {
    if (token) { setIsBootstrapping(false); return; }
    let cancelled = false;
    registerGuest()
      .then(({ token: t, user: u }) => {
        if (cancelled) return;
        storeAuth(t, u);
        setState({ token: t, user: u });
      })
      .catch(() => { /* leave unauthenticated; login button remains available */ })
      .finally(() => { if (!cancelled) setIsBootstrapping(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    storeAuth(data.token, data.user);
    setState({ token: data.token, user: data.user });
  }, []);

  const register = useCallback(async (email: string, password: string, role: AuthUser['role'] = 'ENGINEER') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    storeAuth(data.token, data.user);
    setState({ token: data.token, user: data.user });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setState({ token: null, user: null });
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return { token, user, isBootstrapping, isGuest: !!user?.email.startsWith('guest_'), login, register, logout, authHeaders };
}
