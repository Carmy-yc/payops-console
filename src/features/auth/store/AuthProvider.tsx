import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { demoUsers } from '../data/demo-users';
import type { CurrentUser, DemoUserRecord } from '../types';

type AuthContextValue = {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (account: string, password: string) => boolean;
  loginWithDemoUser: (user: DemoUserRecord) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = 'payops-console.auth.current-user';

const AuthContext = createContext<AuthContextValue | null>(null);

function toCurrentUser(user: DemoUserRecord): CurrentUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function getStoredUser(): CurrentUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    typeof window === 'undefined' ? null : getStoredUser(),
  );

  const persistUser = (user: CurrentUser | null) => {
    setCurrentUser(user);

    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login(account, password) {
        const matchedUser = demoUsers.find(
          (user) => user.account === account.trim() && user.password === password,
        );

        if (!matchedUser) {
          return false;
        }

        persistUser(toCurrentUser(matchedUser));
        return true;
      },
      loginWithDemoUser(user) {
        persistUser(toCurrentUser(user));
      },
      logout() {
        persistUser(null);
      },
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }

  return context;
}

