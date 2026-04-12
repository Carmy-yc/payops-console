import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
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
  const { addLog } = useAudit();
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
        const normalizedAccount = account.trim();
        const matchedUser = demoUsers.find(
          (user) => user.account === normalizedAccount && user.password === password,
        );

        if (!matchedUser) {
          addLog({
            actorName: normalizedAccount || '未知账号',
            actorRole: '未认证用户',
            module: 'auth',
            actionType: 'login',
            targetType: 'session',
            targetId: normalizedAccount || '--',
            targetLabel: '登录会话',
            result: 'failed',
            summary: `账号 ${normalizedAccount || '未知账号'} 登录失败`,
            detail: '输入的账号或密码错误，系统拒绝本次登录。',
            createdAt: new Date().toISOString(),
            relatedPath: '/login',
          });
          return false;
        }

        const safeUser = toCurrentUser(matchedUser);
        persistUser(safeUser);
        addLog({
          actorName: safeUser.name,
          actorRole: safeUser.roleName,
          module: 'auth',
          actionType: 'login',
          targetType: 'session',
          targetId: safeUser.account,
          targetLabel: '登录会话',
          result: 'success',
          summary: `${safeUser.name} 登录系统`,
          detail: `${safeUser.roleName} ${safeUser.name} 已成功登录系统。`,
          createdAt: new Date().toISOString(),
          relatedPath: '/dashboard',
        });
        return true;
      },
      loginWithDemoUser(user) {
        const safeUser = toCurrentUser(user);
        persistUser(safeUser);
        addLog({
          actorName: safeUser.name,
          actorRole: safeUser.roleName,
          module: 'auth',
          actionType: 'login',
          targetType: 'session',
          targetId: safeUser.account,
          targetLabel: '演示账号快速登录',
          result: 'success',
          summary: `${safeUser.name} 使用演示账号登录`,
          detail: `${safeUser.roleName} ${safeUser.name} 通过演示账号快速进入系统。`,
          createdAt: new Date().toISOString(),
          relatedPath: '/dashboard',
        });
      },
      logout() {
        if (currentUser) {
          addLog({
            actorName: currentUser.name,
            actorRole: currentUser.roleName,
            module: 'auth',
            actionType: 'logout',
            targetType: 'session',
            targetId: currentUser.account,
            targetLabel: '登录会话',
            result: 'success',
            summary: `${currentUser.name} 退出登录`,
            detail: `${currentUser.roleName} ${currentUser.name} 主动退出当前系统会话。`,
            createdAt: new Date().toISOString(),
            relatedPath: '/login',
          });
        }
        persistUser(null);
      },
    }),
    [addLog, currentUser],
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
