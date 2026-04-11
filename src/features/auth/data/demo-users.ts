import { PERMISSIONS } from '../../../shared/constants/permissions';
import type { DemoUserRecord } from '../types';

export const demoUsers: DemoUserRecord[] = [
  {
    id: 'u_admin',
    account: 'admin',
    name: '系统管理员',
    password: 'admin123',
    role: 'admin',
    roleName: '超级管理员',
    permissions: Object.values(PERMISSIONS),
  },
  {
    id: 'u_ops',
    account: 'ops',
    name: '运营同学',
    password: 'ops123',
    role: 'ops',
    roleName: '运营人员',
    permissions: [
      PERMISSIONS.dashboardView,
      PERMISSIONS.transactionList,
      PERMISSIONS.transactionDetail,
      PERMISSIONS.refundList,
      PERMISSIONS.refundCreate,
      PERMISSIONS.riskList,
    ],
  },
  {
    id: 'u_finance',
    account: 'finance',
    name: '财务同学',
    password: 'finance123',
    role: 'finance',
    roleName: '财务人员',
    permissions: [
      PERMISSIONS.dashboardView,
      PERMISSIONS.transactionList,
      PERMISSIONS.transactionDetail,
      PERMISSIONS.refundList,
      PERMISSIONS.refundApprove,
      PERMISSIONS.reconciliationView,
      PERMISSIONS.auditView,
    ],
  },
  {
    id: 'u_risk',
    account: 'risk',
    name: '风控同学',
    password: 'risk123',
    role: 'risk',
    roleName: '风控人员',
    permissions: [
      PERMISSIONS.dashboardView,
      PERMISSIONS.transactionList,
      PERMISSIONS.transactionDetail,
      PERMISSIONS.riskList,
      PERMISSIONS.riskHandle,
      PERMISSIONS.auditView,
    ],
  },
  {
    id: 'u_auditor',
    account: 'auditor',
    name: '审计同学',
    password: 'auditor123',
    role: 'auditor',
    roleName: '审计人员',
    permissions: [PERMISSIONS.auditView],
  },
];

