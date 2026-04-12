import { Button, Space, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { ChannelTag } from '../../transactions/components/TransactionTags';
import { formatAmount, formatDateTime } from '../../transactions/lib/transaction-utils';
import {
  reconciliationDiffTypeConfig,
  reconciliationStatusConfig,
} from '../lib/reconciliation-utils';
import type { ReconciliationRecord } from '../types';

type ReconciliationDiffTableProps = {
  data: ReconciliationRecord[];
  onHandle: (record: ReconciliationRecord) => void;
};

const { Text } = Typography;

function renderDiffAmount(value: number) {
  const absoluteAmount = formatAmount(Math.abs(value));
  const displayValue = value > 0 ? `+${absoluteAmount}` : value < 0 ? `-${absoluteAmount}` : absoluteAmount;

  return <Text type={value === 0 ? undefined : 'danger'}>{displayValue}</Text>;
}

export function ReconciliationDiffTable({ data, onHandle }: ReconciliationDiffTableProps) {
  const columns: TableProps<ReconciliationRecord>['columns'] = [
    {
      title: '差异单号',
      dataIndex: 'id',
      width: 170,
    },
    {
      title: '批次日期',
      dataIndex: 'batchDate',
      width: 120,
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      width: 170,
      render: (value: string) => <Link to={`/transactions/${value}`}>{value}</Link>,
    },
    {
      title: '商户名称',
      dataIndex: 'merchantName',
      width: 160,
    },
    {
      title: '支付渠道',
      dataIndex: 'payChannel',
      width: 120,
      render: (value: ReconciliationRecord['payChannel']) => <ChannelTag channel={value} />,
    },
    {
      title: '平台金额',
      dataIndex: 'internalAmount',
      width: 120,
      render: (value: number) => formatAmount(value),
    },
    {
      title: '渠道金额',
      dataIndex: 'channelAmount',
      width: 120,
      render: (value: number) => formatAmount(value),
    },
    {
      title: '差异金额',
      dataIndex: 'diffAmount',
      width: 120,
      render: (value: number) => renderDiffAmount(value),
    },
    {
      title: '差异类型',
      dataIndex: 'diffType',
      width: 140,
      render: (value: ReconciliationRecord['diffType']) => {
        const config = reconciliationDiffTypeConfig[value];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      width: 140,
      render: (value: ReconciliationRecord['status']) => {
        const config = reconciliationStatusConfig[value];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      width: 120,
      render: (value?: string) => value || '--',
    },
    {
      title: '处理备注',
      dataIndex: 'note',
      width: 240,
      ellipsis: true,
      render: (value?: string) => value || '--',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' || record.status === 'processing' ? (
            <Button type="link" onClick={() => onHandle(record)}>
              处理
            </Button>
          ) : (
            <Text type="secondary">已处理</Text>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<ReconciliationRecord>
      rowKey="id"
      columns={columns}
      dataSource={data}
      scroll={{ x: 1920 }}
      pagination={{
        pageSize: 8,
        showSizeChanger: false,
      }}
      locale={{
        emptyText: '当前条件下暂无差异记录',
      }}
    />
  );
}
