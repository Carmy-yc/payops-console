import { mockOrders } from '../data/mock-orders';
import { paginateTransactions, filterTransactions, sortTransactions } from './transaction-utils';

describe('transaction-utils', () => {
  it('会按关键字和状态筛选订单', () => {
    const result = filterTransactions(mockOrders, {
      keyword: '青木咖啡',
      status: 'refunded',
    });

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.merchantName === '青木咖啡')).toBe(true);
    expect(result.every((item) => item.status === 'refunded')).toBe(true);
  });

  it('会按金额降序排序并分页', () => {
    const sorted = sortTransactions(mockOrders, {
      field: 'amount',
      order: 'descend',
    });
    const paginated = paginateTransactions(sorted, 1, 3);

    expect(paginated).toHaveLength(3);
    expect(paginated[0]?.amount).toBeGreaterThanOrEqual(paginated[1]?.amount ?? 0);
    expect(paginated[1]?.amount).toBeGreaterThanOrEqual(paginated[2]?.amount ?? 0);
  });
});

