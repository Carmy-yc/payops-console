import type {
  OrderEvent,
  RefundRecord,
  TransactionFilters,
  TransactionOrder,
  TransactionSorter,
} from '../types';

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function filterTransactions(orders: TransactionOrder[], filters: TransactionFilters) {
  const keyword = filters.keyword?.trim().toLowerCase();

  return orders.filter((order) => {
    if (keyword) {
      const matchedKeyword = [order.id, order.merchantName, order.subject]
        .join(' ')
        .toLowerCase()
        .includes(keyword);

      if (!matchedKeyword) {
        return false;
      }
    }

    if (filters.status && order.status !== filters.status) {
      return false;
    }

    if (filters.payChannel && order.payChannel !== filters.payChannel) {
      return false;
    }

    if (filters.riskLevel && order.riskLevel !== filters.riskLevel) {
      return false;
    }

    if (typeof filters.amountMin === 'number' && order.amount < filters.amountMin) {
      return false;
    }

    if (typeof filters.amountMax === 'number' && order.amount > filters.amountMax) {
      return false;
    }

    const orderDate = order.createdAt.slice(0, 10);

    if (filters.createdFrom && orderDate < filters.createdFrom) {
      return false;
    }

    if (filters.createdTo && orderDate > filters.createdTo) {
      return false;
    }

    return true;
  });
}

export function sortTransactions(orders: TransactionOrder[], sorter: TransactionSorter) {
  if (!sorter.field || !sorter.order) {
    return [...orders];
  }

  const clonedOrders = [...orders];

  clonedOrders.sort((left, right) => {
    const leftValue =
      sorter.field === 'amount'
        ? left.amount
        : new Date(left.createdAt).getTime();
    const rightValue =
      sorter.field === 'amount'
        ? right.amount
        : new Date(right.createdAt).getTime();

    if (leftValue === rightValue) {
      return right.id.localeCompare(left.id);
    }

    return sorter.order === 'ascend' ? leftValue - rightValue : rightValue - leftValue;
  });

  return clonedOrders;
}

export function paginateTransactions(orders: TransactionOrder[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return orders.slice(start, start + pageSize);
}

export function findOrderById(orders: TransactionOrder[], orderId?: string) {
  if (!orderId) {
    return undefined;
  }

  return orders.find((order) => order.id === orderId);
}

export function getOrderEvents(events: OrderEvent[], orderId: string) {
  return events
    .filter((event) => event.orderId === orderId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function getRefundRecords(refunds: RefundRecord[], orderId: string) {
  return refunds
    .filter((refund) => refund.orderId === orderId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

