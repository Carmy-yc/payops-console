import { Card, Col, Row, Statistic, Typography } from 'antd';

const { Paragraph, Title } = Typography;

const dashboardStats = [
  { title: '今日交易额', value: 268900, suffix: 'CNY' },
  { title: '支付成功率', value: 98.6, suffix: '%' },
  { title: '退款率', value: 1.4, suffix: '%' },
  { title: '待处理告警', value: 6, suffix: '条' },
];

export function DashboardPage() {
  return (
    <div>
      <Title level={3}>图表看板</Title>
      <Paragraph type="secondary">
        这里先放一版静态看板，证明项目骨架已经跑通。下一步会接趋势图、异常榜单和真实业务统计接口。
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

