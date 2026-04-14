import { Alert, Space, Tabs, Typography } from 'antd';
import { PermissionCatalogTab } from '../components/PermissionCatalogTab';
import { RoleManagementTab } from '../components/RoleManagementTab';
import { UserManagementTab } from '../components/UserManagementTab';

const { Paragraph, Title } = Typography;

export function AccessControlPage() {
  return (
    <Space direction="vertical" size={16} className="full-width">
      <div>
        <Title level={3}>访问控制</Title>
        <Paragraph type="secondary">
          这一页承接后台账号、角色和权限配置，当前已经支持用户管理、角色复制与权限微调，并保留权限字典只读展示。
        </Paragraph>
      </div>

      <Alert
        type="info"
        showIcon
        message="当前访问控制基于 RBAC 运行"
        description="登录态已经由 用户 -> 角色 -> 权限 解析，后续可以继续在这里扩展角色配置和权限分配。"
      />

      <Tabs
        items={[
          {
            key: 'users',
            label: '用户管理',
            children: <UserManagementTab />,
          },
          {
            key: 'roles',
            label: '角色管理',
            children: <RoleManagementTab />,
          },
          {
            key: 'permissions',
            label: '权限字典',
            children: <PermissionCatalogTab />,
          },
        ]}
      />
    </Space>
  );
}
