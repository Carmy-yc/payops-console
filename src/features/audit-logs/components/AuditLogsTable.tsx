import { Button, Space, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../transactions/lib/transaction-utils';
import {
  auditActionConfig,
  auditModuleConfig,
  auditResultConfig,
} from '../lib/audit-log-utils';
import type { AuditLogRecord } from '../types';

type AuditLogsTableProps = {
  data: AuditLogRecord[];
  onView: (record: AuditLogRecord) => void;
};

const { Text } = Typography;

export function AuditLogsTable({ data, onView }: AuditLogsTableProps) {
  const columns: TableProps<AuditLogRecord>['columns'] = [
    {
      title: '日志号',
      dataIndex: 'id',
      width: 170,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作人',
      dataIndex: 'actorName',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'actorRole',
      width: 120,
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 120,
      render: (value: AuditLogRecord['module']) => {
        const config = auditModuleConfig[value];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '动作',
      dataIndex: 'actionType',
      width: 160,
      render: (value: AuditLogRecord['actionType']) => auditActionConfig[value].label,
    },
    {
      title: '关联对象',
      key: 'target',
      width: 180,
      render: (_, record) =>
        record.relatedPath ? (
          <Link to={record.relatedPath}>{record.targetId}</Link>
        ) : (
          <Text>{record.targetId}</Text>
        ),
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      width: 100,
      render: (value: AuditLogRecord['result']) => {
        const config = auditResultConfig[value];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onView(record)}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<AuditLogRecord>
      rowKey="id"
      columns={columns}
      dataSource={data}
      scroll={{ x: 1540 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
      }}
      locale={{
        emptyText: '暂无符合条件的审计日志',
      }}
    />
  );
}
