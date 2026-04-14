import { mockUsers } from '../features/access-control/data/mock-users';
import { authSessionManager } from '../features/auth/lib/AuthSessionManager';

export function getMockUserByAccount(account: string) {
  const matchedUser = mockUsers.find((user) => user.account === account);

  if (!matchedUser) {
    throw new Error(`Unknown mock user: ${account}`);
  }

  return matchedUser;
}

export function storeAuthSession(account: string) {
  const matchedUser = getMockUserByAccount(account);
  authSessionManager.persistSession(matchedUser.id);
  return matchedUser;
}
