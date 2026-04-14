import { Button, Space, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/store/AuthProvider';
import { formatDateTime } from '../../transactions/lib/transaction-utils';
import { usePageMessage } from '../../../shared/hooks/usePageMessage';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { useAccessControl } from '../store/AccessControlProvider';
import type { CreateRolePayload, RoleRecord, UpdateRolePayload } from '../types';
import { RoleEditorModal } from './RoleEditorModal';

const { Paragraph, Text } = Typography;

type RoleManagementRow = RoleRecord & {
  permissionCount: number;
  userCount: number;
};

type RoleEditorMode = 'clone' | 'edit';

function buildRoleCopyName(role: RoleRecord, roles: RoleRecord[]) {
  const matchedCount = roles.filter((item) => item.name.startsWith(`${role.name}副本`)).length;
  return matchedCount > 0 ? `${role.name}副本${matchedCount + 1}` : `${role.name}副本`;
}

function buildRoleCopyCode(role: RoleRecord, roles: RoleRecord[]) {
  const matchedCount = roles.filter((item) => item.code.startsWith(`${role.code}_copy`)).length;
  return matchedCount > 0 ? `${role.code}_copy_${matchedCount + 1}` : `${role.code}_copy`;
}

export function RoleManagementTab() {
  const { currentUser } = useAuth();
  const {
    roles,
    permissionDefinitions,
    cloneRole,
    updateRole,
    deleteRole,
    getUsersByRoleId,
  } = useAccessControl();
  const { contextHolder, showResult } = usePageMessage();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<RoleEditorMode>('clone');
  const [activeRole, setActiveRole] = useState<RoleRecord>();

  const canManageRoles = Boolean(currentUser?.permissions.includes(PERMISSIONS.roleManage));

  const roleRows = useMemo<RoleManagementRow[]>(
    () =>
      roles
        .map((role) => ({
          ...role,
          permissionCount: role.permissionKeys.length,
          userCount: getUsersByRoleId(role.id).length,
        }))
        .sort((left, right) => {
          if (left.isSystem !== right.isSystem) {
            return left.isSystem ? -1 : 1;
          }

          return left.name.localeCompare(right.name);
        }),
    [getUsersByRoleId, roles],
  );

  const columns: TableProps<RoleManagementRow>['columns'] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 160,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 160,
    },
    {
      title: '类型',
      dataIndex: 'isSystem',
      width: 120,
      render: (value: boolean) => (
        <Tag color={value ? 'processing' : 'success'}>
          {value ? '系统角色' : '自定义角色'}
        </Tag>
      ),
    },
    {
      title: '权限数',
      key: 'permissionCount',
      width: 100,
      render: (_, record) => `${record.permissionCount} 项`,
    },
    {
      title: '绑定用户',
      key: 'userCount',
      width: 100,
      render: (_, record) => `${record.userCount} 人`,
    },
    {
      title: '默认首页',
      dataIndex: 'landingPath',
      width: 160,
      render: (value?: string) => value ?? '--',
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
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            disabled={!canManageRoles}
            onClick={() => {
              setEditorMode('clone');
              setActiveRole(record);
              setEditorOpen(true);
            }}
          >
            复制
          </Button>
          <Button
            type="link"
            disabled={!canManageRoles || record.isSystem}
            onClick={() => {
              setEditorMode('edit');
              setActiveRole(record);
              setEditorOpen(true);
            }}
          >
            编辑权限
          </Button>
          <Button
            type="link"
            disabled={!canManageRoles || record.isSystem || record.userCount > 0}
            onClick={() => {
              showResult(
                deleteRole(record.id, {
                  name: currentUser?.name ?? '林越',
                  roleName: currentUser?.roleName ?? '超级管理员',
                }),
              );
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="full-width">
      {contextHolder}

      <Space direction="vertical" size={4}>
        <Text strong>角色管理说明</Text>
        <Paragraph type="secondary">
          系统角色保持只读，可通过复制生成自定义角色再进行权限微调；只有未绑定用户的自定义角色才允许删除。
        </Paragraph>
      </Space>

      <Table<RoleManagementRow>
        rowKey="id"
        columns={columns}
        dataSource={roleRows}
        scroll={{ x: 1280 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        locale={{
          emptyText: '暂无角色数据',
        }}
      />

      {activeRole ? (
        <RoleEditorModal
          open={editorOpen}
          mode={editorMode}
          role={activeRole}
          permissionDefinitions={permissionDefinitions}
          initialName={
            editorMode === 'clone' ? buildRoleCopyName(activeRole, roles) : activeRole.name
          }
          initialCode={
            editorMode === 'clone' ? buildRoleCopyCode(activeRole, roles) : activeRole.code
          }
          onCancel={() => {
            setEditorOpen(false);
            setActiveRole(undefined);
          }}
          onSubmit={(values) => {
            const operator = {
              name: currentUser?.name ?? '林越',
              roleName: currentUser?.roleName ?? '超级管理员',
            };

            const result =
              editorMode === 'clone'
                ? cloneRole(activeRole.id, values as CreateRolePayload, operator)
                : updateRole(values as UpdateRolePayload, operator);

            showResult(result);

            if (!result.success) {
              return;
            }

            setEditorOpen(false);
            setActiveRole(undefined);
          }}
        />
      ) : null}
    </Space>
  );
}
