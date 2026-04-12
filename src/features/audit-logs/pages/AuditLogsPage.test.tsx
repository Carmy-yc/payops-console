import { render, screen } from '@testing-library/react';
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
});
