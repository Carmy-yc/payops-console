import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { ReconciliationPage } from './ReconciliationPage';

describe('ReconciliationPage', () => {
  it('会渲染对账中心页和默认差异数据', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <ReconciliationPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('对账中心')).toBeInTheDocument();
    expect(screen.getByText('RC202604110001')).toBeInTheDocument();
    expect(screen.getByText('差异订单数')).toBeInTheDocument();
  });
});
