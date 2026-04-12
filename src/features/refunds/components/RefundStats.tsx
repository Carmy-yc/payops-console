import { Card, Col, Row, Statistic } from 'antd';
import type { RefundRecord } from '../../transactions/types';

type RefundStatsProps = {
  refunds: RefundRecord[];
};

export function RefundStats({ refunds }: RefundStatsProps) {
  const totalAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const pendingReviews = refunds.filter((refund) => refund.reviewStatus === 'pending').length;
  const processingCount = refunds.filter((refund) => refund.status === 'processing').length;
  const successCount = refunds.filter((refund) => refund.status === 'success').length;

  const stats = [
    { title: '退款总金额', value: totalAmount, prefix: '¥' },
    { title: '待审核退款', value: pendingReviews, suffix: '笔' },
    { title: '处理中退款', value: processingCount, suffix: '笔' },
    { title: '退款成功', value: successCount, suffix: '笔' },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((item) => (
        <Col key={item.title} xs={24} md={12} xl={6}>
          <Card>
            <Statistic {...item} precision={item.title === '退款总金额' ? 2 : 0} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

