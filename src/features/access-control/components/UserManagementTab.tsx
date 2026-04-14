import { Button, Col, Form, Input, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/store/AuthProvider';
import { formatDateTime } from '../../transactions/lib/transaction-utils';
import { usePageMessage } from '../../../shared/hooks/usePageMessage';
import { FilterPanel, FilterPanelActions } from '../../../shared/ui/FilterPanel';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { useAccessControl } from '../store/AccessControlProvider';
import type { RoleRecord, UserRecord, UserStatus } from '../types';
import { UserEditorModal } from './UserEditorModal';

const { Text } = Typography;

type UserFilters = {
  keyword?: string;
  roleId?: string;
  status?: UserStatus;
};

type UserEditorMode = 'create' | 'edit';

type UserManagementRow = UserRecord & {
  roleName: string;
  roleCode: string;
};

const statusOptions = [
  { label: '启用中', value: 'active' },
  { label: '已停用', value: 'disabled' },
];

function buildRoleMap(roles: RoleRecord[]) {
  return new Map(roles.map((role) => [role.id, role]));
}

export function UserManagementTab() {
  const { currentUser } = useAuth();
  const { users, roles, createUser, updateUser, toggleUserStatus } = useAccessControl();
  const { contextHolder, showResult } = usePageMessage();
  const [form] = Form.useForm<UserFilters>();
  const [filters, setFilters] = useState<UserFilters>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<UserEditorMode>('create');
  const [activeUser, setActiveUser] = useState<UserRecord>();

  const canManageUsers = Boolean(currentUser?.permissions.includes(PERMISSIONS.userManage));
  const roleMap = useMemo(() => buildRoleMap(roles), [roles]);

  const userRows = useMemo<UserManagementRow[]>(
    () =>
      users
        .map((user) => {
          const role = roleMap.get(user.roleId);

          return {
            ...user,
            roleName: role?.name ?? '未知角色',
            roleCode: role?.code ?? '--',
          };
        })
        .filter((user) => {
          const keyword = filters.keyword?.trim().toLowerCase();

          if (keyword) {
            const matchedKeyword = [user.account, user.name, user.roleName]
              .join(' ')
              .toLowerCase()
              .includes(keyword);

            if (!matchedKeyword) {
              return false;
            }
          }

          if (filters.roleId && user.roleId !== filters.roleId) {
            return false;
          }

          if (filters.status && user.status !== filters.status) {
            return false;
          }

          return true;
        })
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [filters, roleMap, users],
  );

  const columns: TableProps<UserManagementRow>['columns'] = [
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '角色',
      key: 'role',
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.roleName}</Text>
          <Text type="secondary">{record.roleCode}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: UserStatus) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? '启用中' : '已停用'}
        </Tag>
      ),
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginAt',
      width: 180,
      render: (value?: string) => formatDateTime(value),
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
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            disabled={!canManageUsers}
            onClick={() => {
              setEditorMode('edit');
              setActiveUser(record);
              setEditorOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            disabled={!canManageUsers}
            onClick={() => {
              showResult(
                toggleUserStatus(record.id, {
                  name: currentUser?.name ?? '林越',
                  roleName: currentUser?.roleName ?? '超级管理员',
                }),
              );
            }}
          >
            {record.status === 'active' ? '停用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="full-width">
      {contextHolder}

      <FilterPanel
        extra={
          <Space wrap>
            <Text type="secondary">当前命中 {userRows.length} 个账号</Text>
            <Button
              type="primary"
              disabled={!canManageUsers}
              onClick={() => {
                setEditorMode('create');
                setActiveUser(undefined);
                setEditorOpen(true);
              }}
            >
              新建用户
            </Button>
          </Space>
        }
      >
        <Form<UserFilters>
          form={form}
          layout="vertical"
          onFinish={(values) =>
            setFilters({
              keyword: values.keyword?.trim() || undefined,
              roleId: values.roleId || undefined,
              status: values.status || undefined,
            })
          }
        >
          <Row gutter={16}>
            <Col span={8}>
                <Form.Item label="关键字" name="keyword">
                  <Input placeholder="支持账号 / 姓名 / 角色" />
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item label="角色" name="roleId">
                  <Select
                    allowClear
                    placeholder="全部角色"
                    options={roles.map((role) => ({
                      label: role.name,
                      value: role.id,
                    }))}
                  />
                </Form.Item>
            </Col>
            <Col span={4}>
                <Form.Item label="状态" name="status">
                  <Select allowClear placeholder="全部状态" options={statusOptions} />
                </Form.Item>
            </Col>
            <FilterPanelActions span={6}>
              <Space wrap>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setFilters({});
                  }}
                >
                  重置
                </Button>
              </Space>
            </FilterPanelActions>
          </Row>
        </Form>
      </FilterPanel>

      <Table<UserManagementRow>
        rowKey="id"
        columns={columns}
        dataSource={userRows}
        scroll={{ x: 1040 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        locale={{
          emptyText: '暂无符合条件的用户账号',
        }}
      />

      <UserEditorModal
        open={editorOpen}
        mode={editorMode}
        roles={roles}
        user={activeUser}
        onCancel={() => {
          setEditorOpen(false);
          setActiveUser(undefined);
        }}
        onSubmit={(values) => {
          const operator = {
            name: currentUser?.name ?? '林越',
            roleName: currentUser?.roleName ?? '超级管理员',
          };

          const result =
            editorMode === 'create'
              ? createUser(
                  {
                    account: values.account,
                    name: values.name,
                    password: values.password ?? '',
                    roleId: values.roleId,
                    status: values.status,
                  },
                  operator,
                )
              : updateUser(
                  {
                    userId: activeUser?.id ?? '',
                    name: values.name,
                    roleId: values.roleId,
                    status: values.status,
                  },
                  operator,
                );

          showResult(result);

          if (!result.success) {
            return;
          }

          setEditorOpen(false);
          setActiveUser(undefined);
        }}
      />
    </Space>
  );
}
