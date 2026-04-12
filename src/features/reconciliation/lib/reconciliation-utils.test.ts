import { mockReconciliationBatches, mockReconciliationRecords } from '../data/mock-reconciliation-records';
import { handleReconciliationAction, summarizeReconciliation } from './reconciliation-utils';

describe('reconciliation-utils', () => {
  it('会基于未处理差异生成批次汇总', () => {
    const batch = mockReconciliationBatches[0];
    const batchRecords = mockReconciliationRecords.filter((record) => record.batchDate === batch.batchDate);

    const summary = summarizeReconciliation(batch, batchRecords);

    expect(summary.totalOrders).toBe(1286);
    expect(summary.diffOrders).toBe(3);
    expect(summary.matchedOrders).toBe(1283);
    expect(summary.pendingCount).toBe(2);
    expect(summary.diffAmount).toBe(2109);
  });

  it('处理差异后会更新状态、负责人和时间', () => {
    const result = handleReconciliationAction(mockReconciliationRecords, {
      recordId: 'RC202604110001',
      action: 'resolve',
      operator: '财务同学',
      note: '已补齐渠道对账单。',
      updatedAt: '2026-04-12T03:20:00.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.records.find((record) => record.id === 'RC202604110001')).toMatchObject({
      status: 'resolved',
      owner: '财务同学',
      note: '已补齐渠道对账单。',
      updatedAt: '2026-04-12T03:20:00.000Z',
    });
  });
});
