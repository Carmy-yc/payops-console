import { Button, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { RiskLevelTag } from '../../transactions/components/TransactionTags';
import { formatDateTime } from '../../transactions/lib/transaction-utils';
import { riskAlertStatusConfig, riskAlertTypeConfig } from '../lib/risk-alert-utils';
import type { RiskAlertRecord } from '../types';

type RiskAlertsTableProps = {
  data: RiskAlertRecord[];
  onView: (record: RiskAlertRecord) => void;
};

export function RiskAlertsTable({ data, onView }: RiskAlertsTableProps) {
  const columns: TableProps<RiskAlertRecord>['columns'] = [
    {
      title: '告警号',
      dataIndex: 'id',
      width: 170,
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
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 120,
      render: (value: RiskAlertRecord['riskLevel']) => <RiskLevelTag riskLevel={value} />,
    },
    {
      title: '告警类型',
      dataIndex: 'alertType',
      width: 140,
      render: (value: RiskAlertRecord['alertType']) => {
        const config = riskAlertTypeConfig[value];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '命中规则',
      dataIndex: 'ruleName',
      width: 220,
    },
    {
      title: '风险分',
      dataIndex: 'riskScore',
      width: 100,
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      width: 140,
      render: (value: RiskAlertRecord['status']) => {
        const config = riskAlertStatusConfig[value];
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
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onView(record)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<RiskAlertRecord>
      rowKey="id"
      columns={columns}
      dataSource={data}
      scroll={{ x: 1600 }}
      pagination={{
        pageSize: 8,
        showSizeChanger: false,
      }}
      locale={{
        emptyText: '暂无符合条件的风险告警',
      }}
    />
  );
}
