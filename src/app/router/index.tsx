import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { AuditLogsPage } from '../../features/audit-logs/pages/AuditLogsPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { ReconciliationPage } from '../../features/reconciliation/pages/ReconciliationPage';
import { RefundsPage } from '../../features/refunds/pages/RefundsPage';
import { RiskAlertsPage } from '../../features/risk-alerts/pages/RiskAlertsPage';
import { OrderDetailPage } from '../../features/transactions/pages/OrderDetailPage';
import { TransactionsPage } from '../../features/transactions/pages/TransactionsPage';
import { PERMISSIONS } from '../../shared/constants/permissions';
import { CenteredResult } from '../../shared/ui/CenteredResult';
import { AppShell } from '../layouts/AppShell';
import { RequireAuth, RequirePermission } from './guards';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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
        element: (
          <RequirePermission permission={PERMISSIONS.dashboardView}>
            <DashboardPage />
          </RequirePermission>
        ),
      },
      {
        path: '/transactions',
        element: (
          <RequirePermission permission={PERMISSIONS.transactionList}>
            <TransactionsPage />
          </RequirePermission>
        ),
      },
      {
        path: '/transactions/:orderId',
        element: (
          <RequirePermission permission={PERMISSIONS.transactionDetail}>
            <OrderDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: '/refunds',
        element: (
          <RequirePermission permission={PERMISSIONS.refundList}>
            <RefundsPage />
          </RequirePermission>
        ),
      },
      {
        path: '/reconciliation',
        element: (
          <RequirePermission permission={PERMISSIONS.reconciliationView}>
            <ReconciliationPage />
          </RequirePermission>
        ),
      },
      {
        path: '/risk-alerts',
        element: (
          <RequirePermission permission={PERMISSIONS.riskList}>
            <RiskAlertsPage />
          </RequirePermission>
        ),
      },
      {
        path: '/audit-logs',
        element: (
          <RequirePermission permission={PERMISSIONS.auditView}>
            <AuditLogsPage />
          </RequirePermission>
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

