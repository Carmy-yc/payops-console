import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { mockPermissionDefinitions } from '../data/mock-permission-definitions';
import { mockRoles } from '../data/mock-roles';
import { mockUsers } from '../data/mock-users';
import {
  resolveCurrentUserById,
  resolveUserWithRole,
} from '../lib/access-control-utils';
import type {
  AccessControlActionResult,
  AccessControlOperator,
  CreateUserPayload,
  CurrentUser,
  CreateRolePayload,
  PermissionDefinition,
  RoleRecord,
  UpdateUserPayload,
  UpdateRolePayload,
  UserRecord,
} from '../types';

type AccessControlContextValue = {
  permissionDefinitions: PermissionDefinition[];
  roles: RoleRecord[];
  users: UserRecord[];
  authenticate: (account: string, password: string) => CurrentUser | null;
  resolveCurrentUser: (userId: string) => CurrentUser | null;
  getUserById: (userId: string) => UserRecord | null;
  createUser: (
    payload: CreateUserPayload,
    operator: AccessControlOperator,
  ) => AccessControlActionResult;
  updateUser: (
    payload: UpdateUserPayload,
    operator: AccessControlOperator,
  ) => AccessControlActionResult;
  toggleUserStatus: (
    userId: string,
    operator: AccessControlOperator,
  ) => AccessControlActionResult;
  cloneRole: (
    sourceRoleId: string,
    payload: CreateRolePayload,
    operator: AccessControlOperator,
  ) => AccessControlActionResult;
  updateRole: (
    payload: UpdateRolePayload,
    operator: AccessControlOperator,
  ) => AccessControlActionResult;
  deleteRole: (
    roleId: string,
    operator: AccessControlOperator,
  ) => AccessControlActionResult;
  getUsersByRoleId: (roleId: string) => UserRecord[];
};

const AccessControlContext = createContext<AccessControlContextValue | null>(null);

function seedRoles() {
  return mockRoles.map((role) => ({ ...role, permissionKeys: [...role.permissionKeys] }));
}

function seedUsers() {
  return mockUsers.map((user) => ({ ...user }));
}

function nowIsoString() {
  return new Date().toISOString();
}

function formatRuntimeUserId() {
  return `u_runtime_${Date.now()}`;
}

function formatRuntimeRoleId() {
  return `role_runtime_${Date.now()}`;
}

export function AccessControlProvider({ children }: PropsWithChildren) {
  const { addLog } = useAudit();
  const [roles, setRoles] = useState<RoleRecord[]>(() => seedRoles());
  const [users, setUsers] = useState<UserRecord[]>(() => seedUsers());

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
      createUser(payload, operator) {
        const account = payload.account.trim();
        const name = payload.name.trim();
        const password = payload.password.trim();
        const matchedRole = roles.find((role) => role.id === payload.roleId);

        if (!account || !name || !password) {
          return { success: false, message: '请完整填写账号、姓名、密码和角色。' };
        }

        if (!matchedRole) {
          return { success: false, message: '所选角色不存在，请重新选择。' };
        }

        if (users.some((user) => user.account === account)) {
          return { success: false, message: '账号已存在，请更换其他账号。' };
        }

        const createdAt = nowIsoString();
        const nextUser: UserRecord = {
          id: formatRuntimeUserId(),
          account,
          name,
          password,
          roleId: payload.roleId,
          status: payload.status ?? 'active',
          createdAt,
          updatedAt: createdAt,
        };

        setUsers((previous) => [nextUser, ...previous]);
        addLog({
          actorName: operator.name,
          actorRole: operator.roleName,
          module: 'access_control',
          actionType: 'user_create',
          targetType: 'user',
          targetId: nextUser.account,
          targetLabel: nextUser.name,
          result: 'success',
          summary: `创建用户 ${nextUser.name}`,
          detail: `${operator.roleName} ${operator.name} 创建了用户 ${nextUser.name}，并分配角色 ${matchedRole.name}。`,
          createdAt,
          relatedPath: '/access-control',
        });

        return {
          success: true,
          message: `用户 ${nextUser.name} 已创建。`,
          user: nextUser,
        };
      },
      updateUser(payload, operator) {
        const targetUser = users.find((user) => user.id === payload.userId);
        const matchedRole = roles.find((role) => role.id === payload.roleId);
        const name = payload.name.trim();

        if (!targetUser) {
          return { success: false, message: '用户不存在，无法继续编辑。' };
        }

        if (!name) {
          return { success: false, message: '请输入用户姓名。' };
        }

        if (!matchedRole) {
          return { success: false, message: '所选角色不存在，请重新选择。' };
        }

        const updatedAt = nowIsoString();
        const nextUser: UserRecord = {
          ...targetUser,
          name,
          roleId: payload.roleId,
          status: payload.status,
          updatedAt,
        };

        setUsers((previous) =>
          previous.map((user) => (user.id === payload.userId ? nextUser : user)),
        );
        addLog({
          actorName: operator.name,
          actorRole: operator.roleName,
          module: 'access_control',
          actionType: 'user_update',
          targetType: 'user',
          targetId: nextUser.account,
          targetLabel: nextUser.name,
          result: 'success',
          summary: `更新用户 ${nextUser.name}`,
          detail: `${operator.roleName} ${operator.name} 更新了用户 ${nextUser.name} 的角色或状态配置。`,
          createdAt: updatedAt,
          relatedPath: '/access-control',
        });

        return {
          success: true,
          message: `用户 ${nextUser.name} 已更新。`,
          user: nextUser,
        };
      },
      toggleUserStatus(userId, operator) {
        const targetUser = users.find((user) => user.id === userId);

        if (!targetUser) {
          return { success: false, message: '用户不存在，无法修改状态。' };
        }

        const nextStatus = targetUser.status === 'active' ? 'disabled' : 'active';
        const updatedAt = nowIsoString();
        const nextUser: UserRecord = {
          ...targetUser,
          status: nextStatus,
          updatedAt,
        };

        setUsers((previous) =>
          previous.map((user) => (user.id === userId ? nextUser : user)),
        );
        addLog({
          actorName: operator.name,
          actorRole: operator.roleName,
          module: 'access_control',
          actionType: nextStatus === 'active' ? 'user_enable' : 'user_disable',
          targetType: 'user',
          targetId: nextUser.account,
          targetLabel: nextUser.name,
          result: 'success',
          summary: `${nextStatus === 'active' ? '启用' : '停用'}用户 ${nextUser.name}`,
          detail: `${operator.roleName} ${operator.name} 已${nextStatus === 'active' ? '启用' : '停用'}用户 ${nextUser.name}。`,
          createdAt: updatedAt,
          relatedPath: '/access-control',
        });

        return {
          success: true,
          message: `用户 ${nextUser.name} 已${nextStatus === 'active' ? '启用' : '停用'}。`,
          user: nextUser,
        };
      },
      cloneRole(sourceRoleId, payload, operator) {
        const sourceRole = roles.find((role) => role.id === sourceRoleId);
        const code = payload.code.trim();
        const name = payload.name.trim();

        if (!sourceRole) {
          return { success: false, message: '源角色不存在，无法复制。' };
        }

        if (!code || !name) {
          return { success: false, message: '请完整填写角色名称和角色编码。' };
        }

        if (!payload.permissionKeys.length) {
          return { success: false, message: '请至少选择一个权限。' };
        }

        if (roles.some((role) => role.code === code)) {
          return { success: false, message: '角色编码已存在，请更换后重试。' };
        }

        const createdAt = nowIsoString();
        const nextRole: RoleRecord = {
          id: formatRuntimeRoleId(),
          code,
          name,
          description: payload.description?.trim() || undefined,
          isSystem: false,
          landingPath: payload.landingPath ?? sourceRole.landingPath,
          permissionKeys: [...payload.permissionKeys],
          createdAt,
          updatedAt: createdAt,
        };

        setRoles((previous) => [nextRole, ...previous]);
        addLog({
          actorName: operator.name,
          actorRole: operator.roleName,
          module: 'access_control',
          actionType: 'role_clone',
          targetType: 'role',
          targetId: nextRole.code,
          targetLabel: nextRole.name,
          result: 'success',
          summary: `复制角色 ${nextRole.name}`,
          detail: `${operator.roleName} ${operator.name} 基于 ${sourceRole.name} 复制出自定义角色 ${nextRole.name}。`,
          createdAt,
          relatedPath: '/access-control',
        });

        return {
          success: true,
          message: `角色 ${nextRole.name} 已复制完成。`,
          role: nextRole,
        };
      },
      updateRole(payload, operator) {
        const targetRole = roles.find((role) => role.id === payload.roleId);
        const code = payload.code.trim();
        const name = payload.name.trim();

        if (!targetRole) {
          return { success: false, message: '角色不存在，无法继续编辑。' };
        }

        if (targetRole.isSystem) {
          return { success: false, message: '系统角色不支持直接编辑，请先复制后再调整。' };
        }

        if (!code || !name) {
          return { success: false, message: '请完整填写角色名称和角色编码。' };
        }

        if (!payload.permissionKeys.length) {
          return { success: false, message: '请至少选择一个权限。' };
        }

        if (roles.some((role) => role.id !== payload.roleId && role.code === code)) {
          return { success: false, message: '角色编码已存在，请更换后重试。' };
        }

        const updatedAt = nowIsoString();
        const nextRole: RoleRecord = {
          ...targetRole,
          code,
          name,
          description: payload.description?.trim() || undefined,
          landingPath: payload.landingPath ?? targetRole.landingPath,
          permissionKeys: [...payload.permissionKeys],
          updatedAt,
        };

        setRoles((previous) =>
          previous.map((role) => (role.id === payload.roleId ? nextRole : role)),
        );
        addLog({
          actorName: operator.name,
          actorRole: operator.roleName,
          module: 'access_control',
          actionType: 'role_update',
          targetType: 'role',
          targetId: nextRole.code,
          targetLabel: nextRole.name,
          result: 'success',
          summary: `更新角色 ${nextRole.name}`,
          detail: `${operator.roleName} ${operator.name} 更新了自定义角色 ${nextRole.name} 的权限配置。`,
          createdAt: updatedAt,
          relatedPath: '/access-control',
        });

        return {
          success: true,
          message: `角色 ${nextRole.name} 已更新。`,
          role: nextRole,
        };
      },
      deleteRole(roleId, operator) {
        const targetRole = roles.find((role) => role.id === roleId);

        if (!targetRole) {
          return { success: false, message: '角色不存在，无法删除。' };
        }

        if (targetRole.isSystem) {
          return { success: false, message: '系统角色不支持删除。' };
        }

        if (users.some((user) => user.roleId === roleId)) {
          return { success: false, message: '当前角色仍有用户绑定，不能直接删除。' };
        }

        setRoles((previous) => previous.filter((role) => role.id !== roleId));
        addLog({
          actorName: operator.name,
          actorRole: operator.roleName,
          module: 'access_control',
          actionType: 'role_delete',
          targetType: 'role',
          targetId: targetRole.code,
          targetLabel: targetRole.name,
          result: 'success',
          summary: `删除角色 ${targetRole.name}`,
          detail: `${operator.roleName} ${operator.name} 删除了自定义角色 ${targetRole.name}。`,
          createdAt: nowIsoString(),
          relatedPath: '/access-control',
        });

        return {
          success: true,
          message: `角色 ${targetRole.name} 已删除。`,
          role: targetRole,
        };
      },
      getUsersByRoleId(roleId) {
        return users.filter((user) => user.roleId === roleId);
      },
    }),
    [addLog, roles, users],
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
