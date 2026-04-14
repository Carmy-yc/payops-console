import type { PermissionKey } from '../../shared/constants/permissions';

export type PermissionModule =
  | 'dashboard'
  | 'transaction'
  | 'refund'
  | 'reconciliation'
  | 'risk'
  | 'audit'
  | 'access-control';

export type PermissionDefinition = {
  key: PermissionKey;
  label: string;
  module: PermissionModule;
  type: 'page' | 'action';
  description: string;
  relatedPath?: string;
};

export type RoleRecord = {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  landingPath?: string;
  permissionKeys: PermissionKey[];
  createdAt: string;
  updatedAt: string;
};

export type UserStatus = 'active' | 'disabled';

export type UserRecord = {
  id: string;
  account: string;
  name: string;
  password: string;
  roleId: string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentUser = {
  id: string;
  account: string;
  name: string;
  status: UserStatus;
  roleId: string;
  roleCode: string;
  roleName: string;
  permissions: PermissionKey[];
  landingPath?: string;
};

export type CreateUserPayload = {
  account: string;
  name: string;
  password: string;
  roleId: string;
  status?: UserStatus;
};

export type UpdateUserPayload = {
  userId: string;
  name: string;
  roleId: string;
  status: UserStatus;
};

export type CreateRolePayload = {
  code: string;
  name: string;
  description?: string;
  landingPath?: string;
  permissionKeys: PermissionKey[];
};

export type UpdateRolePayload = CreateRolePayload & {
  roleId: string;
};
