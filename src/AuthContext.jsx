import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('eventpass_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  useEffect(() => {
    let alive = true;
    if (!token) { setUser(null); setLoading(false); return undefined; }
    setLoading(true);
    api('/auth/me', { token }).then(({ user }) => { if (alive) setUser(user); })
      .catch(() => { if (alive) { localStorage.removeItem('eventpass_token'); setToken(null); setUser(null); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [token]);
  const saveSession = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem('eventpass_token', nextToken);
    setUser(nextUser);
    setToken(nextToken);
  };
  const logout = () => { localStorage.removeItem('eventpass_token'); setUser(null); setToken(null); };
  const value = useMemo(() => ({ user, token, loading, saveSession, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
