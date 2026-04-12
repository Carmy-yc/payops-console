import { Card, Col, Row, Statistic } from 'antd';
import type { ReconciliationSummary as ReconciliationSummaryValue } from '../types';

type ReconciliationSummaryProps = {
  summary: ReconciliationSummaryValue;
};

export function ReconciliationSummary({ summary }: ReconciliationSummaryProps) {
  const stats = [
    { title: '当前批次', value: summary.batchDate },
    { title: '总订单数', value: summary.totalOrders, suffix: '笔' },
    { title: '已对平订单', value: summary.matchedOrders, suffix: '笔' },
    { title: '差异订单数', value: summary.diffOrders, suffix: '笔' },
    { title: '待处理差异', value: summary.pendingCount, suffix: '笔' },
    { title: '差异总金额', value: summary.diffAmount, prefix: '¥', precision: 2 },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((item) => {
        const isNumeric = typeof item.value === 'number';

        return (
          <Col key={item.title} xs={24} md={12} xl={8}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                suffix={item.suffix}
                prefix={item.prefix}
                precision={isNumeric ? item.precision ?? 0 : undefined}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
