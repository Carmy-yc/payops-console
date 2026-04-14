import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useAccessControl } from '../store/AccessControlProvider';
import type { PermissionDefinition } from '../types';

const moduleLabelMap: Record<PermissionDefinition['module'], string> = {
  dashboard: '图表看板',
  transaction: '交易',
  refund: '退款',
  reconciliation: '对账',
  risk: '风控',
  audit: '审计',
  'access-control': '访问控制',
};

export function PermissionCatalogTab() {
  const { permissionDefinitions } = useAccessControl();

  const columns: TableProps<PermissionDefinition>['columns'] = [
    {
      title: '权限名称',
      dataIndex: 'label',
      width: 160,
    },
    {
      title: '权限 Key',
      dataIndex: 'key',
      width: 180,
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      width: 120,
      render: (value: PermissionDefinition['module']) => (
        <Tag color="processing">{moduleLabelMap[value]}</Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (value: PermissionDefinition['type']) => (
        <Tag color={value === 'page' ? 'success' : 'default'}>
          {value === 'page' ? '页面权限' : '动作权限'}
        </Tag>
      ),
    },
    {
      title: '关联页面',
      dataIndex: 'relatedPath',
      width: 140,
      render: (value?: string) => value ?? '--',
    },
    {
      title: '说明',
      dataIndex: 'description',
    },
  ];

  return (
    <Space direction="vertical" size={16} className="full-width">
      <Table<PermissionDefinition>
        rowKey="key"
        columns={columns}
        dataSource={permissionDefinitions}
        scroll={{ x: 1100 }}
        pagination={false}
        locale={{
          emptyText: '暂无权限定义',
        }}
      />
    </Space>
  );
}
