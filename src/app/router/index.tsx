import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { Space, Spin, Typography } from 'antd';
import { useAuth } from '../../features/auth/store/AuthProvider';
import { PERMISSIONS } from '../../shared/constants/permissions';
import { getDefaultRoute } from '../../shared/constants/routes';
import { CenteredResult } from '../../shared/ui/CenteredResult';
import { AppShell } from '../layouts/AppShell';
import { RequireAuth, RequirePermission } from './guards';

const { Text } = Typography;

const LoginPage = lazy(async () => {
  const module = await import('../../features/auth/pages/LoginPage');
  return { default: module.LoginPage };
});

const DashboardPage = lazy(async () => {
  const module = await import('../../features/dashboard/pages/DashboardPage');
  return { default: module.DashboardPage };
});

const TransactionsPage = lazy(async () => {
  const module = await import('../../features/transactions/pages/TransactionsPage');
  return { default: module.TransactionsPage };
});

const OrderDetailPage = lazy(async () => {
  const module = await import('../../features/transactions/pages/OrderDetailPage');
  return { default: module.OrderDetailPage };
});

const RefundsPage = lazy(async () => {
  const module = await import('../../features/refunds/pages/RefundsPage');
  return { default: module.RefundsPage };
});

const ReconciliationPage = lazy(async () => {
  const module = await import('../../features/reconciliation/pages/ReconciliationPage');
  return { default: module.ReconciliationPage };
});

const RiskAlertsPage = lazy(async () => {
  const module = await import('../../features/risk-alerts/pages/RiskAlertsPage');
  return { default: module.RiskAlertsPage };
});

const AuditLogsPage = lazy(async () => {
  const module = await import('../../features/audit-logs/pages/AuditLogsPage');
  return { default: module.AuditLogsPage };
});

const AccessControlPage = lazy(async () => {
  const module = await import('../../features/access-control/pages/AccessControlPage');
  return { default: module.AccessControlPage };
});

function RouteLoading() {
  return (
    <div className="centered-result">
      <Space direction="vertical" align="center" size={12}>
        <Spin size="large" />
        <Text type="secondary">页面加载中，请稍候...</Text>
      </Space>
    </div>
  );
}

function withRouteSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export function HomeRedirect() {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRoute(currentUser?.permissions)} replace />;
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    path: '/login',
    element: withRouteSuspense(<LoginPage />),
  },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        path: '/dashboard',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.dashboardView}>
            <DashboardPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/transactions',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.transactionList}>
            <TransactionsPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/transactions/:orderId',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.transactionDetail}>
            <OrderDetailPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/refunds',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.refundList}>
            <RefundsPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/reconciliation',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.reconciliationView}>
            <ReconciliationPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/risk-alerts',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.riskList}>
            <RiskAlertsPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/audit-logs',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.auditView}>
            <AuditLogsPage />
          </RequirePermission>,
        ),
      },
      {
        path: '/access-control',
        element: withRouteSuspense(
          <RequirePermission permission={PERMISSIONS.accessControlView}>
            <AccessControlPage />
          </RequirePermission>,
        ),
      },
    ],
  },
  {
    path: '/403',
    element: <CenteredResult status="403" title="无权限访问" subtitle="当前角色没有这个页面的访问权限。" />,
  },
  {
    path: '*',
    element: <CenteredResult status="404" title="页面不存在" subtitle="这条路由还没有接入，或者地址输入有误。" />,
  },
];

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
