import { Card, Col, Row, Statistic, Typography } from 'antd';

const { Paragraph, Title } = Typography;

const dashboardStats = [
  { title: '今日交易额', value: 268900, suffix: 'CNY' },
  { title: '支付成功率', value: 98.6, suffix: '%' },
  { title: '退款率', value: 1.4, suffix: '%' },
  { title: '待处理告警', value: 4, suffix: '条' },
];

export function DashboardPage() {
  return (
    <div>
      <Title level={3}>图表看板</Title>
      <Paragraph type="secondary">
        这里暂时保留静态看板，当前核心业务闭环和权限链路已经完成，后续可以继续补趋势图和聚合指标。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {dashboardStats.map((item) => (
          <Col key={item.title} xs={24} md={12} xl={6}>
            <Card>
              <Statistic title={item.title} value={item.value} suffix={item.suffix} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
