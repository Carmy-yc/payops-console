import { Alert, Button, Card, Divider, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDefaultRoute } from '../../../shared/constants/routes';
import { demoUsers } from '../data/demo-users';
import { useAuth } from '../store/AuthProvider';

const { Paragraph, Text, Title } = Typography;

type LoginFormValues = {
  account: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithDemoUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const handleSuccess = (defaultPath: string) => {
    navigate(redirectTo ?? defaultPath, { replace: true });
  };

  const handleFinish = (values: LoginFormValues) => {
    const matchedUser = demoUsers.find((user) => user.account === values.account.trim());
    const succeeded = login(values.account, values.password);

    if (!succeeded) {
      setErrorMessage('账号或密码错误，请使用下方演示账号快速进入。');
      return;
    }

    setErrorMessage('');
    handleSuccess(getDefaultRoute(matchedUser?.permissions));
  };

  return (
    <div className="login-page">
      <Card className="login-page__card">
        <Space direction="vertical" size={20} className="full-width">
          <div>
            <Text type="secondary">PayOps Console</Text>
            <Title level={2}>商户支付运营后台</Title>
            <Paragraph type="secondary">
              当前已完成登录鉴权、交易、退款、对账、风控和审计模块，可直接使用演示账号体验完整后台链路。
            </Paragraph>
          </div>

          {errorMessage ? <Alert type="error" message={errorMessage} showIcon /> : null}

          <Form<LoginFormValues> layout="vertical" onFinish={handleFinish} autoComplete="off">
            <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
              <Input placeholder="例如：admin" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="例如：admin123" />
            </Form.Item>
            <Form.Item className="login-page__submit">
              <Button type="primary" htmlType="submit" block size="large">
                登录进入系统
              </Button>
            </Form.Item>
          </Form>

          <Divider>演示账号</Divider>

          <Space direction="vertical" size={12} className="full-width">
            {demoUsers.map((user) => (
              <Card key={user.id} size="small">
                <div className="login-page__demo-user">
                  <div>
                    <Text strong>{user.roleName}</Text>
                    <Paragraph type="secondary" className="login-page__demo-meta">
                      {user.account} / {user.password}
                    </Paragraph>
                  </div>
                  <Button
                    onClick={() => {
                      loginWithDemoUser(user);
                      handleSuccess(getDefaultRoute(user.permissions));
                    }}
                  >
                    快速进入
                  </Button>
                </div>
              </Card>
            ))}
          </Space>
        </Space>
      </Card>
    </div>
  );
}
