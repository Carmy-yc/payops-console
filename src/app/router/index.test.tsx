import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from '../providers/AppProviders';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RequirePermission } from './guards';
import { HomeRedirect } from './index';
import { PERMISSIONS } from '../../shared/constants/permissions';
import { storeAuthSession } from '../../tests/test-auth-utils';

describe('首页默认跳转', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('未登录访问首页时会进入登录页', async () => {
    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<div>登录页</div>} />
          </Routes>
        </MemoryRouter>
      </AppProviders>,
    );

    expect(await screen.findByText('登录页')).toBeInTheDocument();
  });

  it('审计账号访问首页时会跳到审计日志页', async () => {
    storeAuthSession('auditor');

    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/audit-logs" element={<div>审计日志页</div>} />
          </Routes>
        </MemoryRouter>
      </AppProviders>,
    );

    expect(await screen.findByText('审计日志页')).toBeInTheDocument();
  });

  it('审计账号从登录页快速进入时会落到审计日志页', async () => {
    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/audit-logs" element={<div>审计日志页</div>} />
          </Routes>
        </MemoryRouter>
      </AppProviders>,
    );

    const auditorCard = screen.getByText('审计人员').closest('.ant-card');

    if (!(auditorCard instanceof HTMLElement)) {
      throw new Error('未找到审计账号卡片');
    }

    fireEvent.click(within(auditorCard).getByRole('button', { name: '快速进入' }));

    expect(await screen.findByText('审计日志页')).toBeInTheDocument();
  });

  it('旧账号遗留图表看板跳转地址时，审计账号登录后会回到自己的默认首页', async () => {
    render(
      <AppProviders>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/login',
              state: {
                from: {
                  pathname: '/dashboard',
                },
              },
            },
          ]}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <RequirePermission permission={PERMISSIONS.dashboardView}>
                  <div>图表看板页</div>
                </RequirePermission>
              }
            />
            <Route path="/audit-logs" element={<div>审计日志页</div>} />
            <Route path="/403" element={<div>403 页面</div>} />
          </Routes>
        </MemoryRouter>
      </AppProviders>,
    );

    const auditorCard = screen.getByText('审计人员').closest('.ant-card');

    if (!(auditorCard instanceof HTMLElement)) {
      throw new Error('未找到审计账号卡片');
    }

    fireEvent.click(within(auditorCard).getByRole('button', { name: '快速进入' }));

    expect(await screen.findByText('审计日志页')).toBeInTheDocument();
    expect(screen.queryByText('403 页面')).not.toBeInTheDocument();
  });
});
