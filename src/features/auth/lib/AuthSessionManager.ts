import type { PermissionKey } from '../../../shared/constants/permissions';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { getDefaultRoute } from '../../../shared/constants/routes';

type RoutePermissionRule = {
  pathPrefix: string;
  permission: PermissionKey;
};

const AUTH_STORAGE_KEY = 'payops-console.auth.current-user';

type StoredAuthSession = {
  userId: string;
};

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
    pathPrefix: '/access-control',
    permission: PERMISSIONS.accessControlView,
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
  getStoredSession(): StoredAuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as { id?: unknown; userId?: unknown };

      if (typeof parsed.userId === 'string') {
        return { userId: parsed.userId };
      }

      if (typeof parsed.id === 'string') {
        const migratedSession = { userId: parsed.id };
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(migratedSession));
        return migratedSession;
      }

      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    } catch {
      return null;
    }
  }

  persistSession(userId: string | null) {
    if (typeof window === 'undefined') {
      return;
    }

    if (userId) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId }));
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
