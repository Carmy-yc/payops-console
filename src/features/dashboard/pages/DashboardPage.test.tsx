import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { demoUsers } from '../../auth/data/demo-users';
import { ReconciliationPage } from '../../reconciliation/pages/ReconciliationPage';
import { RiskAlertsPage } from '../../risk-alerts/pages/RiskAlertsPage';
import { DashboardPage } from './DashboardPage';

function storeDemoUser(account: string) {
  const matchedUser = demoUsers.find((user) => user.account === account);

  if (!matchedUser) {
    throw new Error(`Unknown demo user: ${account}`);
  }

  const { password: _password, ...safeUser } = matchedUser;
  window.localStorage.setItem('payops-console.auth.current-user', JSON.stringify(safeUser));
}

describe('DashboardPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function DashboardRuntimeApp() {
    return (
      <AppProviders>
        <MemoryRouter initialEntries={['/dashboard']}>
          <nav>
            <Link to="/dashboard">回看板</Link>
            <Link to="/reconciliation">去对账</Link>
            <Link to="/risk-alerts">去风控</Link>
          </nav>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reconciliation" element={<ReconciliationPage />} />
            <Route path="/risk-alerts" element={<RiskAlertsPage />} />
          </Routes>
        </MemoryRouter>
      </AppProviders>
    );
  }

  it('会渲染业务总览区块和当前角色可访问的快捷入口', () => {
    storeDemoUser('admin');

    render(
      <AppProviders>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('图表看板')).toBeInTheDocument();
    expect(screen.getByText('今日核心指标')).toBeInTheDocument();
    expect(screen.getByText('近 7 日交易趋势')).toBeInTheDocument();
    expect(screen.getByText('支付渠道分布')).toBeInTheDocument();
    expect(screen.getByText('异常分布')).toBeInTheDocument();
    expect(screen.getByText('待处理事项')).toBeInTheDocument();
    expect(screen.getByText('快捷入口')).toBeInTheDocument();
    expect(screen.getByText('最近异常')).toBeInTheDocument();
    expect(screen.getByText('交易列表')).toBeInTheDocument();
    expect(screen.getByText('审计日志')).toBeInTheDocument();
  });

  it('处理对账差异和风险告警后，看板异常会同步刷新', async () => {
    storeDemoUser('admin');

    render(<DashboardRuntimeApp />);

    expect(screen.getByText(/退款 1 \/ 对账 5 \/ 风控 4/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: '去对账' }));
    expect(await screen.findByText('对账中心')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '处理' })[0]);
    fireEvent.click(await screen.findByRole('button', { name: '确认处理' }));

    fireEvent.click(screen.getByRole('link', { name: '去风控' }));
    expect(await screen.findByText('风险告警')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);
    fireEvent.click(await screen.findByRole('button', { name: '确认处理' }));

    fireEvent.click(screen.getByRole('link', { name: '回看板' }));
    expect(await screen.findByText('图表看板')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/退款 1 \/ 对账 4 \/ 风控 3/)).toBeInTheDocument();
    });
  });
});
