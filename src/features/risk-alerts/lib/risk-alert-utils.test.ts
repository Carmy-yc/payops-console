import { mockRiskAlerts } from '../data/mock-risk-alerts';
import { handleRiskAlertAction, summarizeRiskAlerts } from './risk-alert-utils';

describe('risk-alert-utils', () => {
  it('会生成风险告警统计数据', () => {
    const summary = summarizeRiskAlerts(mockRiskAlerts);

    expect(summary.totalCount).toBe(6);
    expect(summary.pendingCount).toBe(3);
    expect(summary.reviewingCount).toBe(1);
    expect(summary.handledCount).toBe(2);
  });

  it('处理告警后会更新状态和负责人', () => {
    const result = handleRiskAlertAction(mockRiskAlerts, {
      alertId: 'RA202604120003',
      action: 'review',
      operator: '风控同学',
      note: '已转人工复核。',
      updatedAt: '2026-04-12T03:40:00.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.alerts.find((alert) => alert.id === 'RA202604120003')).toMatchObject({
      status: 'reviewing',
      owner: '风控同学',
      note: '已转人工复核。',
      updatedAt: '2026-04-12T03:40:00.000Z',
    });
  });
});
