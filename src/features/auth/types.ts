import type { PermissionKey } from '../../shared/constants/permissions';

export type RoleCode = 'admin' | 'ops' | 'finance' | 'risk' | 'auditor';

export type DemoUserRecord = {
  id: string;
  account: string;
  name: string;
  password: string;
  role: RoleCode;
  roleName: string;
  permissions: PermissionKey[];
};

export type CurrentUser = Omit<DemoUserRecord, 'password'>;

