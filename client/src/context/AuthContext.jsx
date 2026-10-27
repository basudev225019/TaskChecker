import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { clearToken, getStoredToken, storeToken } from '../services/api.js';

const USER_KEY = 'taskTracker.user';

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || !getStoredToken()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const saveSession = useCallback(({ token, user: account }) => {
    storeToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
    setUser(account);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      async login(credentials) {
        saveSession(await authService.login(credentials));
      },
      async register(details) {
        saveSession(await authService.register(details));
      },
      logout,
    }),
    [user, saveSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
