import type { PermissionKey } from './permissions';
import { PERMISSIONS } from './permissions';

type NavItem = {
  key: string;
  label: string;
  path: string;
  permission?: PermissionKey;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: '图表看板',
    path: '/dashboard',
    permission: PERMISSIONS.dashboardView,
  },
  {
    key: 'transactions',
    label: '交易列表',
    path: '/transactions',
    permission: PERMISSIONS.transactionList,
  },
  {
    key: 'refunds',
    label: '退款管理',
    path: '/refunds',
    permission: PERMISSIONS.refundList,
  },
  {
    key: 'reconciliation',
    label: '对账中心',
    path: '/reconciliation',
    permission: PERMISSIONS.reconciliationView,
  },
  {
    key: 'risk-alerts',
    label: '风险告警',
    path: '/risk-alerts',
    permission: PERMISSIONS.riskList,
  },
  {
    key: 'audit-logs',
    label: '审计日志',
    path: '/audit-logs',
    permission: PERMISSIONS.auditView,
  },
];
