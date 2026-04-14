import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAccessControl } from '../../access-control/store/AccessControlProvider';
import { getDefaultRoute } from '../../../shared/constants/routes';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { authSessionManager } from '../lib/AuthSessionManager';
import type { CurrentUser } from '../types';

type AuthContextValue = {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (account: string, password: string) => CurrentUser | null;
  loginWithUserId: (userId: string) => CurrentUser | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { addLog } = useAudit();
  const { authenticate, resolveCurrentUser } = useAccessControl();
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    authSessionManager.getStoredSession()?.userId ?? null,
  );

  const currentUser = useMemo(
    () => (sessionUserId ? resolveCurrentUser(sessionUserId) : null),
    [resolveCurrentUser, sessionUserId],
  );

  useEffect(() => {
    if (sessionUserId && !currentUser) {
      setSessionUserId(null);
      authSessionManager.persistSession(null);
    }
  }, [currentUser, sessionUserId]);

  const persistSession = (userId: string | null) => {
    setSessionUserId(userId);
    authSessionManager.persistSession(userId);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login(account, password) {
        const normalizedAccount = account.trim();
        const safeUser = authenticate(account, password);

        if (!safeUser) {
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
          return null;
        }

        persistSession(safeUser.id);
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
          relatedPath: getDefaultRoute(safeUser.permissions),
        });
        return safeUser;
      },
      loginWithUserId(userId) {
        const safeUser = resolveCurrentUser(userId);

        if (!safeUser) {
          return null;
        }

        persistSession(safeUser.id);
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
          relatedPath: getDefaultRoute(safeUser.permissions),
        });
        return safeUser;
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
        persistSession(null);
      },
    }),
    [addLog, authenticate, currentUser, resolveCurrentUser],
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
