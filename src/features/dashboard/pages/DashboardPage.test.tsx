import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { demoUsers } from '../../auth/data/demo-users';
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
});
