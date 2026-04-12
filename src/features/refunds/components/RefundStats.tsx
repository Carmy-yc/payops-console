import { StatsRow } from '../../../shared/ui/StatsRow';
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
    { title: '退款总金额', value: totalAmount, prefix: '¥', precision: 2 },
    { title: '待审核退款', value: pendingReviews, suffix: '笔' },
    { title: '处理中退款', value: processingCount, suffix: '笔' },
    { title: '退款成功', value: successCount, suffix: '笔' },
  ];

  return <StatsRow items={stats} />;
}
