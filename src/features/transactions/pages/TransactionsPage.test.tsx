import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TransactionsPage } from './TransactionsPage';

describe('TransactionsPage', () => {
  it('会渲染交易列表标题和默认订单数据', () => {
    render(
      <MemoryRouter>
        <TransactionsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('交易列表')).toBeInTheDocument();
    expect(screen.getByText('PO202604120001')).toBeInTheDocument();
    expect(screen.getByText('当前命中 18 / 18 条订单')).toBeInTheDocument();
  });
});
