export const PERMISSIONS = {
  dashboardView: 'dashboard:view',
  transactionList: 'transaction:list',
  transactionDetail: 'transaction:detail',
  refundList: 'refund:list',
  refundCreate: 'refund:create',
  refundApprove: 'refund:approve',
  reconciliationView: 'reconciliation:view',
  riskList: 'risk:list',
  riskHandle: 'risk:handle',
  auditView: 'audit:view',
  accessControlView: 'access-control:view',
  userManage: 'user:manage',
  roleManage: 'role:manage',
  permissionView: 'permission:view',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
