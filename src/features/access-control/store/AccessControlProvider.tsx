import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { mockPermissionDefinitions } from '../data/mock-permission-definitions';
import { mockRoles } from '../data/mock-roles';
import { mockUsers } from '../data/mock-users';
import {
  resolveCurrentUserById,
  resolveUserWithRole,
} from '../lib/access-control-utils';
import type { CurrentUser, PermissionDefinition, RoleRecord, UserRecord } from '../types';

type AccessControlContextValue = {
  permissionDefinitions: PermissionDefinition[];
  roles: RoleRecord[];
  users: UserRecord[];
  authenticate: (account: string, password: string) => CurrentUser | null;
  resolveCurrentUser: (userId: string) => CurrentUser | null;
  getUserById: (userId: string) => UserRecord | null;
};

const AccessControlContext = createContext<AccessControlContextValue | null>(null);

function seedRoles() {
  return mockRoles.map((role) => ({ ...role, permissionKeys: [...role.permissionKeys] }));
}

function seedUsers() {
  return mockUsers.map((user) => ({ ...user }));
}

export function AccessControlProvider({ children }: PropsWithChildren) {
  const [roles] = useState<RoleRecord[]>(() => seedRoles());
  const [users] = useState<UserRecord[]>(() => seedUsers());

  const value = useMemo<AccessControlContextValue>(
    () => ({
      permissionDefinitions: mockPermissionDefinitions,
      roles,
      users,
      authenticate(account, password) {
        return resolveUserWithRole(users, roles, account, password)?.currentUser ?? null;
      },
      resolveCurrentUser(userId) {
        return resolveCurrentUserById(users, roles, userId);
      },
      getUserById(userId) {
        return users.find((user) => user.id === userId) ?? null;
      },
    }),
    [roles, users],
  );

  return (
    <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);

  if (!context) {
    throw new Error('useAccessControl 必须在 AccessControlProvider 内部使用');
  }

  return context;
}
