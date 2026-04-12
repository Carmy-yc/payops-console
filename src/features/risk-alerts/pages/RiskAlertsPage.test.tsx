import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { RiskAlertsPage } from './RiskAlertsPage';

describe('RiskAlertsPage', () => {
  it('会渲染风险告警页和默认告警数据', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <RiskAlertsPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('风险告警')).toBeInTheDocument();
    expect(screen.getByText('RA202604120001')).toBeInTheDocument();
    expect(screen.getByText('待处理告警')).toBeInTheDocument();
  });
});
