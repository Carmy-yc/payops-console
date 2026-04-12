import type { PermissionKey } from '../../../shared/constants/permissions';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { getDefaultRoute } from '../../../shared/constants/routes';
import type { CurrentUser, DemoUserRecord } from '../types';

type RoutePermissionRule = {
  pathPrefix: string;
  permission: PermissionKey;
};

const AUTH_STORAGE_KEY = 'payops-console.auth.current-user';

const routePermissionRules: RoutePermissionRule[] = [
  {
    pathPrefix: '/transactions/',
    permission: PERMISSIONS.transactionDetail,
  },
  {
    pathPrefix: '/dashboard',
    permission: PERMISSIONS.dashboardView,
  },
  {
    pathPrefix: '/transactions',
    permission: PERMISSIONS.transactionList,
  },
  {
    pathPrefix: '/refunds',
    permission: PERMISSIONS.refundList,
  },
  {
    pathPrefix: '/reconciliation',
    permission: PERMISSIONS.reconciliationView,
  },
  {
    pathPrefix: '/risk-alerts',
    permission: PERMISSIONS.riskList,
  },
  {
    pathPrefix: '/audit-logs',
    permission: PERMISSIONS.auditView,
  },
];

class AuthSessionManager {
  toCurrentUser(user: DemoUserRecord): CurrentUser {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  authenticate(account: string, password: string, users: DemoUserRecord[]) {
    const normalizedAccount = account.trim();
    const matchedUser = users.find(
      (user) => user.account === normalizedAccount && user.password === password,
    );

    return matchedUser ? this.toCurrentUser(matchedUser) : null;
  }

  getStoredUser(): CurrentUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CurrentUser) : null;
    } catch {
      return null;
    }
  }

  persistUser(user: CurrentUser | null) {
    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  resolvePostLoginPath(permissions?: PermissionKey[], redirectTo?: string) {
    if (redirectTo && this.canAccessPath(redirectTo, permissions)) {
      return redirectTo;
    }

    return getDefaultRoute(permissions);
  }

  getLogoutRedirectPath() {
    return '/login';
  }

  private canAccessPath(path: string, permissions?: PermissionKey[]) {
    if (!permissions?.length) {
      return false;
    }

    const matchedRule = routePermissionRules.find((rule) => path.startsWith(rule.pathPrefix));

    if (!matchedRule) {
      return false;
    }

    return permissions.includes(matchedRule.permission);
  }
}

export const authSessionManager = new AuthSessionManager();
