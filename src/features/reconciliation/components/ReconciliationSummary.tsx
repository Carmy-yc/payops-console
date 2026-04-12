import { StatsRow } from '../../../shared/ui/StatsRow';
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

  return <StatsRow items={stats} xl={8} />;
}
