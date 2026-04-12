import { Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useRefunds } from '../../refunds/store/RefundsProvider';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionTable } from '../components/TransactionTable';
import {
  filterTransactions,
  paginateTransactions,
  sortTransactions,
} from '../lib/transaction-utils';
import type { TransactionFilters as TransactionFiltersValue, TransactionSorter } from '../types';

const { Paragraph, Title } = Typography;

const defaultSorter: TransactionSorter = {
  field: 'createdAt',
  order: 'descend',
};

export function TransactionsPage() {
  const { orders } = useRefunds();
  const [filters, setFilters] = useState<TransactionFiltersValue>({});
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorter, setSorter] = useState<TransactionSorter>(defaultSorter);

  const filteredOrders = useMemo(
    () => filterTransactions(orders, filters),
    [filters, orders],
  );

  const sortedOrders = useMemo(
    () => sortTransactions(filteredOrders, sorter),
    [filteredOrders, sorter],
  );

  const paginatedOrders = useMemo(
    () => paginateTransactions(sortedOrders, current, pageSize),
    [sortedOrders, current, pageSize],
  );

  return (
    <Space direction="vertical" size={16} className="full-width">
      <div>
        <Title level={3}>交易列表</Title>
        <Paragraph type="secondary">
          这一页用于展示支付后台最常见的交易检索能力。当前已接入本地 mock 数据、筛选区、分页、排序和详情跳转。
        </Paragraph>
      </div>

      <TransactionFilters
        totalCount={orders.length}
        filteredCount={filteredOrders.length}
        onSearch={(values) => {
          setFilters(values);
          setCurrent(1);
        }}
        onReset={() => {
          setFilters({});
          setCurrent(1);
          setPageSize(10);
          setSorter(defaultSorter);
        }}
      />

      <TransactionTable
        data={paginatedOrders}
        total={sortedOrders.length}
        current={current}
        pageSize={pageSize}
        sorter={sorter}
        onPageChange={(page, nextPageSize) => {
          setCurrent(page);
          setPageSize(nextPageSize);
        }}
        onSortChange={(nextSorter) => {
          setSorter(nextSorter.field && nextSorter.order ? nextSorter : defaultSorter);
          setCurrent(1);
        }}
      />
    </Space>
  );
}
