import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { getDefaultRoute } from '../../../shared/constants/routes';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { authSessionManager } from '../lib/AuthSessionManager';
import { demoUsers } from '../data/demo-users';
import type { CurrentUser, DemoUserRecord } from '../types';

type AuthContextValue = {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (account: string, password: string) => CurrentUser | null;
  loginWithDemoUser: (user: DemoUserRecord) => CurrentUser;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { addLog } = useAudit();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    authSessionManager.getStoredUser(),
  );

  const persistUser = (user: CurrentUser | null) => {
    setCurrentUser(user);
    authSessionManager.persistUser(user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login(account, password) {
        const normalizedAccount = account.trim();
        const safeUser = authSessionManager.authenticate(account, password, demoUsers);

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
          relatedPath: getDefaultRoute(safeUser.permissions),
        });
        return safeUser;
      },
      loginWithDemoUser(user) {
        const safeUser = authSessionManager.toCurrentUser(user);
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
