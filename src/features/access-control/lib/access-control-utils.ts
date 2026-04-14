import type { CurrentUser, RoleRecord, UserRecord } from '../types';

export function findRoleById(roles: RoleRecord[], roleId: string) {
  return roles.find((role) => role.id === roleId) ?? null;
}

export function buildCurrentUser(user: UserRecord, role: RoleRecord): CurrentUser {
  return {
    id: user.id,
    account: user.account,
    name: user.name,
    status: user.status,
    roleId: role.id,
    roleCode: role.code,
    roleName: role.name,
    permissions: role.permissionKeys,
    landingPath: role.landingPath,
  };
}

export function resolveCurrentUserById(
  users: UserRecord[],
  roles: RoleRecord[],
  userId: string,
) {
  const matchedUser = users.find((user) => user.id === userId && user.status === 'active');

  if (!matchedUser) {
    return null;
  }

  const matchedRole = findRoleById(roles, matchedUser.roleId);

  if (!matchedRole) {
    return null;
  }

  return buildCurrentUser(matchedUser, matchedRole);
}

export function resolveUserWithRole(
  users: UserRecord[],
  roles: RoleRecord[],
  account: string,
  password: string,
) {
  const normalizedAccount = account.trim();
  const matchedUser = users.find(
    (user) =>
      user.account === normalizedAccount &&
      user.password === password &&
      user.status === 'active',
  );

  if (!matchedUser) {
    return null;
  }

  const matchedRole = findRoleById(roles, matchedUser.roleId);

  if (!matchedRole) {
    return null;
  }

  return {
    user: matchedUser,
    role: matchedRole,
    currentUser: buildCurrentUser(matchedUser, matchedRole),
  };
}

export function getActiveDemoUsers(users: UserRecord[]) {
  return users.filter((user) => user.status === 'active');
}
