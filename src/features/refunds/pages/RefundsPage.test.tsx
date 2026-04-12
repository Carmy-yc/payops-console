import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { RefundsPage } from './RefundsPage';

describe('RefundsPage', () => {
  it('会渲染退款管理页和默认退款数据', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <RefundsPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('退款管理')).toBeInTheDocument();
    expect(screen.getByText('RF202604120001')).toBeInTheDocument();
    expect(screen.getByText('退款总金额')).toBeInTheDocument();
  });
});
