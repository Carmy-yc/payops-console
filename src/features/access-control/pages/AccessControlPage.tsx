import { Alert, Card, Space, Typography } from 'antd';

const { Paragraph, Title } = Typography;

export function AccessControlPage() {
  return (
    <Space direction="vertical" size={16} className="full-width">
      <div>
        <Title level={3}>访问控制</Title>
        <Paragraph type="secondary">
          当前已完成 RBAC 真相层和认证链路切换，后续会在这里继续接入用户、角色和权限管理页面。
        </Paragraph>
      </div>

      <Card>
        <Alert
          type="info"
          showIcon
          message="第一批已完成基础切换"
          description="当前版本已经改为基于 用户 -> 角色 -> 权限 解析登录态，管理界面会在下一批继续补齐。"
        />
      </Card>
    </Space>
  );
}
