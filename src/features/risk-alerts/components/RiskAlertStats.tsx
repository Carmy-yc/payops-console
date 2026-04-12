import { StatsRow } from '../../../shared/ui/StatsRow';
import type { RiskAlertSummary } from '../types';

type RiskAlertStatsProps = {
  summary: RiskAlertSummary;
};

export function RiskAlertStats({ summary }: RiskAlertStatsProps) {
  const stats = [
    { title: '总告警数', value: summary.totalCount, suffix: '条' },
    { title: '待处理告警', value: summary.pendingCount, suffix: '条' },
    { title: '人工复核中', value: summary.reviewingCount, suffix: '条' },
    { title: '已处理告警', value: summary.handledCount, suffix: '条' },
  ];

  return <StatsRow items={stats} />;
}
