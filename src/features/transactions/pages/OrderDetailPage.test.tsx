import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from './OrderDetailPage';

describe('OrderDetailPage', () => {
  it('订单不存在时会展示兜底提示', () => {
    render(
      <MemoryRouter initialEntries={['/transactions/PO404']}>
        <Routes>
          <Route path="/transactions/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('订单不存在')).toBeInTheDocument();
    expect(screen.getByText(/PO404/)).toBeInTheDocument();
  });
});

