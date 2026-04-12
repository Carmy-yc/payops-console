import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { AuditLogsPage } from './AuditLogsPage';

describe('AuditLogsPage', () => {
  it('会渲染审计日志页和默认日志数据', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <AuditLogsPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('审计日志')).toBeInTheDocument();
    expect(screen.getByText('AL202604120001')).toBeInTheDocument();
    expect(screen.getByText('总日志数')).toBeInTheDocument();
  });

  it('默认只显示一行筛选条件，展开后显示更多项', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <AuditLogsPage />
        </MemoryRouter>
      </AppProviders>,
    );

    const filterPanel = screen.getByText('筛选条件').closest('.ant-card');

    expect(filterPanel).not.toBeNull();
    expect(within(filterPanel as HTMLElement).queryByText('操作时间')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '展开' }));

    expect(within(filterPanel as HTMLElement).getByText('操作时间')).toBeInTheDocument();
    expect(within(filterPanel as HTMLElement).getByText('执行结果')).toBeInTheDocument();
  });
});
