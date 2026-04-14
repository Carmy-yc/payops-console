import { authSessionManager } from './AuthSessionManager';

describe('AuthSessionManager', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('会兼容旧版完整用户结构并迁移为 session 结构', () => {
    window.localStorage.setItem(
      'payops-console.auth.current-user',
      JSON.stringify({
        id: 'u_admin',
        account: 'admin',
        name: '林越',
      }),
    );

    expect(authSessionManager.getStoredSession()).toEqual({ userId: 'u_admin' });
    expect(window.localStorage.getItem('payops-console.auth.current-user')).toBe(
      JSON.stringify({ userId: 'u_admin' }),
    );
  });
});
