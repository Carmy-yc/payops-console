import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { AppProviders } from '../app/providers/AppProviders';
import { RequireAuth, RequirePermission } from '../app/router/guards';
import { AuditLogsPage } from '../features/audit-logs/pages/AuditLogsPage';
import { demoUsers } from '../features/auth/data/demo-users';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ReconciliationPage } from '../features/reconciliation/pages/ReconciliationPage';
import { RefundsPage } from '../features/refunds/pages/RefundsPage';
import { RiskAlertsPage } from '../features/risk-alerts/pages/RiskAlertsPage';
import { TransactionsPage } from '../features/transactions/pages/TransactionsPage';
import { OrderDetailPage } from '../features/transactions/pages/OrderDetailPage';
import { PERMISSIONS } from '../shared/constants/permissions';
import { CenteredResult } from '../shared/ui/CenteredResult';

function storeDemoUser(account: string) {
  const matchedUser = demoUsers.find((user) => user.account === account);

  if (!matchedUser) {
    throw new Error(`Unknown demo user: ${account}`);
  }

  const { password: _password, ...safeUser } = matchedUser;
  window.localStorage.setItem('payops-console.auth.current-user', JSON.stringify(safeUser));
}

function SmokeNav() {
  return (
    <nav>
      <Link to="/refunds">去退款</Link>
      <Link to="/reconciliation">去对账</Link>
      <Link to="/risk-alerts">去风控</Link>
      <Link to="/audit-logs">去审计</Link>
    </nav>
  );
}

function SmokeFlowApp() {
  return (
    <AppProviders>
      <MemoryRouter initialEntries={['/transactions/PO202604120001']}>
        <SmokeNav />
        <Routes>
          <Route path="/transactions/:orderId" element={<OrderDetailPage />} />
          <Route path="/refunds" element={<RefundsPage />} />
          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="/risk-alerts" element={<RiskAlertsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );
}

describe('M7 核心冒烟流程', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('未登录访问受保护页面时会跳转登录，并在登录后返回目标页面', async () => {
    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/transactions']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/transactions"
              element={
                <RequireAuth>
                  <TransactionsPage />
                </RequireAuth>
              }
            />
          </Routes>
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('商户支付运营后台')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: '快速进入' })[0]);

    expect(await screen.findByText('交易列表')).toBeInTheDocument();
    expect(screen.getByText('当前命中 18 / 18 条订单')).toBeInTheDocument();
  });

  it('普通运营账号访问审计日志时会被权限拦截', async () => {
    storeDemoUser('ops');

    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/audit-logs']}>
          <Routes>
            <Route
              path="/audit-logs"
              element={
                <RequirePermission permission={PERMISSIONS.auditView}>
                  <AuditLogsPage />
                </RequirePermission>
              }
            />
            <Route
              path="/403"
              element={
                <CenteredResult
                  status="403"
                  title="无权限访问"
                  subtitle="当前角色没有这个页面的访问权限。"
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </AppProviders>,
    );

    expect(await screen.findByText('无权限访问')).toBeInTheDocument();
  });

  it('管理员可以完成退款、对账、风控处理，并在审计日志里看到留痕', async () => {
    storeDemoUser('admin');

    render(<SmokeFlowApp />);

    expect(screen.getByText('订单详情')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '发起退款' }));

    const refundDialog = await screen.findByRole('dialog', { name: '发起退款' });
    fireEvent.change(within(refundDialog).getByRole('spinbutton'), {
      target: { value: '100' },
    });
    fireEvent.click(within(refundDialog).getByRole('button', { name: '提交退款' }));

    await waitFor(() => {
      expect(screen.queryByText('当前订单暂无退款记录')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('link', { name: '去退款' }));

    expect(await screen.findByText('退款管理')).toBeInTheDocument();
    expect(screen.getAllByText('PO202604120001').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('link', { name: '去对账' }));

    expect(await screen.findByText('对账中心')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '处理' })[0]);
    fireEvent.click(await screen.findByRole('button', { name: '确认处理' }));

    fireEvent.click(screen.getByRole('link', { name: '去风控' }));

    expect(await screen.findByText('风险告警')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);
    fireEvent.click(await screen.findByRole('button', { name: '确认处理' }));

    fireEvent.click(screen.getByRole('link', { name: '去审计' }));

    expect(await screen.findByText('审计日志')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('例如：财务同学'), {
      target: { value: '系统管理员' },
    });
    fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));

    await waitFor(() => {
      expect(screen.getByText('RC202604110001 已标记为已对平')).toBeInTheDocument();
      expect(screen.getByText('RA202604120001 已标记为已处理')).toBeInTheDocument();
      expect(screen.getByText('退款管理')).toBeInTheDocument();
      expect(screen.getByText('对账中心')).toBeInTheDocument();
      expect(screen.getByText('风险告警')).toBeInTheDocument();
    });
  });
});
