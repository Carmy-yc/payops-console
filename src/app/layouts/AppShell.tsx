import {
  DesktopOutlined,
  DownOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeSetting, type ThemePreference } from '../providers/ThemeProvider';
import { authSessionManager } from '../../features/auth/lib/AuthSessionManager';
import { useAuth } from '../../features/auth/store/AuthProvider';
import { NAV_ITEMS } from '../../shared/constants/routes';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { themePreference, resolvedTheme, setThemePreference } = useThemeSetting();

  const availableItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) =>
        item.permission ? currentUser?.permissions.includes(item.permission) : true,
      ),
    [currentUser?.permissions],
  );

  const selectedKey =
    availableItems.find((item) => location.pathname.startsWith(item.path))?.key ?? 'dashboard';

  const currentThemeIcon =
    themePreference === 'system' ? (
      <DesktopOutlined />
    ) : resolvedTheme === 'dark' ? (
      <MoonOutlined />
    ) : (
      <SunOutlined />
    );

  const themeLabelMap: Record<ThemePreference, string> = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  };

  const handleLogout = () => {
    logout();
    navigate(authSessionManager.getLogoutRedirectPath(), { replace: true });
  };

  return (
    <Layout className="app-shell">
      <Sider
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        width={256}
        className="app-shell__sider"
      >
        <div className="app-shell__brand">
          <Title level={4} className="app-shell__brand-title">
            PayOps Console
          </Title>
          <Text type="secondary">商户支付运营后台</Text>
        </div>
        <Menu
          mode="inline"
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          selectedKeys={[selectedKey]}
          items={availableItems.map((item) => ({
            key: item.key,
            label: item.label,
            onClick: () => navigate(item.path),
          }))}
        />
      </Sider>

      <Layout className="app-shell__main">
        <Header className="app-shell__header">
          <div className="app-shell__header-copy">
            <Title level={5} className="app-shell__header-title">
              支付运营演示后台
            </Title>
            <Text type="secondary">当前已完成交易、退款、对账、风控与审计闭环演示</Text>
          </div>

          <Space size="small">
            <Dropdown
              menu={{
                selectable: true,
                selectedKeys: [themePreference],
                items: [
                  {
                    key: 'light',
                    icon: <SunOutlined />,
                    label: themeLabelMap.light,
                  },
                  {
                    key: 'dark',
                    icon: <MoonOutlined />,
                    label: themeLabelMap.dark,
                  },
                  {
                    key: 'system',
                    icon: <DesktopOutlined />,
                    label: themeLabelMap.system,
                  },
                ],
                onClick: ({ key }) => setThemePreference(key as ThemePreference),
              }}
              trigger={['click']}
            >
              <Button size="small" icon={currentThemeIcon}>
                {themeLabelMap[themePreference]}
              </Button>
            </Dropdown>

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    disabled: true,
                    label: (
                      <div className="app-shell__user-menu">
                        <Text strong>{currentUser?.name ?? '未登录'}</Text>
                        <Text type="secondary">{currentUser?.roleName ?? '游客'}</Text>
                      </div>
                    ),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: handleLogout,
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button size="small" type="text" className="app-shell__user-trigger">
                <Space size={8}>
                  <Avatar size={28}>{currentUser?.name?.slice(0, 1) ?? 'U'}</Avatar>
                  <Text>{currentUser?.name ?? '未登录'}</Text>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content className="app-shell__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
