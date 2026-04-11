import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthProvider';
import { NAV_ITEMS } from '../../shared/constants/routes';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const availableItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) =>
        item.permission ? currentUser?.permissions.includes(item.permission) : true,
      ),
    [currentUser?.permissions],
  );

  const selectedKey =
    availableItems.find((item) => location.pathname.startsWith(item.path))?.key ?? 'dashboard';

  return (
    <Layout className="app-shell">
      <Sider theme="light" width={256} className="app-shell__sider">
        <div className="app-shell__brand">
          <Title level={4} className="app-shell__brand-title">
            PayOps Console
          </Title>
          <Text type="secondary">商户支付运营后台</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={availableItems.map((item) => ({
            key: item.key,
            label: item.label,
            onClick: () => navigate(item.path),
          }))}
        />
      </Sider>

      <Layout>
        <Header className="app-shell__header">
          <div>
            <Title level={5} className="app-shell__header-title">
              支付业务演示骨架
            </Title>
            <Text type="secondary">当前阶段已完成项目初始化、路由与权限骨架</Text>
          </div>

          <Space size="middle">
            <Tag color="blue">{currentUser?.roleName ?? '游客'}</Tag>
            <Space size="small">
              <Avatar>{currentUser?.name?.slice(0, 1) ?? 'U'}</Avatar>
              <Text>{currentUser?.name ?? '未登录'}</Text>
            </Space>
            <Button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              退出登录
            </Button>
          </Space>
        </Header>

        <Content className="app-shell__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
