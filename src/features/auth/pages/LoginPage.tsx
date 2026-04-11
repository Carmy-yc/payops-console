import { Alert, Button, Card, Divider, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const handleSuccess = () => {
    navigate(redirectTo ?? '/dashboard', { replace: true });
  };

  const handleFinish = (values: LoginFormValues) => {
    const succeeded = login(values.account, values.password);

    if (!succeeded) {
      setErrorMessage('账号或密码错误，请使用下方演示账号快速进入。');
      return;
    }

    setErrorMessage('');
    handleSuccess();
  };

  return (
    <div className="login-page">
      <Card className="login-page__card" bordered={false}>
        <Space direction="vertical" size={20} className="full-width">
          <div>
            <Text type="secondary">PayOps Console</Text>
            <Title level={2}>商户支付运营后台</Title>
            <Paragraph type="secondary">
              当前已完成项目初始化、登录入口、RBAC 骨架和模块占位页，后续可以继续接交易、退款和对账流程。
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
                      handleSuccess();
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
