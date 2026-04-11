import { Table, Typography } from 'antd';
import type { TablePaginationConfig, TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { formatAmount, formatDateTime } from '../lib/transaction-utils';
import type { TransactionOrder, TransactionSortField, TransactionSorter } from '../types';
import { ChannelTag, RiskLevelTag, TransactionStatusTag } from './TransactionTags';

const { Text } = Typography;

type TransactionTableProps = {
  data: TransactionOrder[];
  current: number;
  pageSize: number;
  total: number;
  sorter: TransactionSorter;
  onPageChange: (page: number, nextPageSize: number) => void;
  onSortChange: (sorter: TransactionSorter) => void;
};

function parseSorter(sorter: unknown): TransactionSorter {
  const nextSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (
    nextSorter &&
    typeof nextSorter === 'object' &&
    'field' in nextSorter &&
    'order' in nextSorter &&
    (nextSorter.field === 'amount' || nextSorter.field === 'createdAt')
  ) {
    return {
      field: nextSorter.field as TransactionSortField,
      order:
        nextSorter.order === 'ascend' || nextSorter.order === 'descend'
          ? nextSorter.order
          : null,
    };
  }

  return {
    field: null,
    order: null,
  };
}

export function TransactionTable({
  data,
  current,
  pageSize,
  total,
  sorter,
  onPageChange,
  onSortChange,
}: TransactionTableProps) {
  const columns: TableProps<TransactionOrder>['columns'] = [
    {
      title: '订单号',
      dataIndex: 'id',
      width: 188,
      render: (value: string) => <Link to={`/transactions/${value}`}>{value}</Link>,
    },
    {
      title: '商户名称',
      dataIndex: 'merchantName',
      width: 160,
    },
    {
      title: '交易标题',
      dataIndex: 'subject',
      ellipsis: true,
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      width: 140,
      sorter: true,
      sortOrder: sorter.field === 'amount' ? sorter.order : null,
      render: (value: number) => formatAmount(value),
    },
    {
      title: '支付渠道',
      dataIndex: 'payChannel',
      width: 130,
      render: (value: TransactionOrder['payChannel']) => <ChannelTag channel={value} />,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 120,
      render: (value: TransactionOrder['status']) => <TransactionStatusTag status={value} />,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 120,
      render: (value: TransactionOrder['riskLevel']) => <RiskLevelTag riskLevel={value} />,
    },
    {
      title: '风险告警',
      dataIndex: 'hasRiskAlert',
      width: 110,
      render: (value: boolean) =>
        value ? <Text type="danger">已命中</Text> : <Text type="secondary">无</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      sorter: true,
      sortOrder: sorter.field === 'createdAt' ? sorter.order : null,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '支付时间',
      dataIndex: 'paidAt',
      width: 180,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 110,
      render: (_, record) => <Link to={`/transactions/${record.id}`}>查看详情</Link>,
    },
  ];

  const handleChange: TableProps<TransactionOrder>['onChange'] = (
    nextPagination: TablePaginationConfig,
    _filters,
    nextSorter,
  ) => {
    onPageChange(nextPagination.current ?? 1, nextPagination.pageSize ?? pageSize);
    onSortChange(parseSorter(nextSorter));
  };

  return (
    <Table<TransactionOrder>
      rowKey="id"
      columns={columns}
      dataSource={data}
      onChange={handleChange}
      scroll={{ x: 1540 }}
      pagination={{
        current,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [5, 10, 20],
        showTotal: (value, range) => `第 ${range[0]}-${range[1]} 条，共 ${value} 条`,
      }}
      locale={{
        emptyText: '暂无符合条件的订单',
      }}
    />
  );
}

